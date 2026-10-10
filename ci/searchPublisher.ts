// Publishes a docs search index to the userdocs-search worker. Dependency-free and
// shared verbatim between userdocs-search (scripts/utils/publisher.ts) and
// discord-userdoccers (ci/searchPublisher.ts); keep both copies identical.
//
// GET /health (embedding config) -> GET /admin/index (reuse vectors by content
// hash) -> POST /admin/embed (changed chunks only) -> PUT /admin/index
import { createHash } from "node:crypto";

export interface PublishChunk {
  title: string;
  section: string;
  path: string;
  anchor: string;
  content: string;
}

export interface PublishOptions {
  url: string;
  key: string;
  commit: string;
  /** Ignore the live index and re-embed everything */
  full?: boolean;
  log?: (message: string) => void;
}

interface IndexMeta {
  format: 2;
  config: string;
  dims: number;
  commit: string;
  builtAt: string;
  titles: string[];
  paths: string[];
  vocab: string[];
  chunks: [number, number, string, string, string, string, number[], number[]][];
}

interface StoredVector {
  scale: number;
  vec: Int8Array;
}

const SNIPPET_CHARS = 300;
const BATCH_SIZE = 100;
const CONCURRENCY = 4;
const MAGIC = 0x31534455;

// Must match tokenize() in the worker's src/shared/lexical.ts
const tokenize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9_\s-]/g, " ")
    .split(/[\s_-]+/)
    .filter((t) => t.length > 1);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const request = async (url: string, key: string | undefined, init: RequestInit = {}) => {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, {
      ...init,
      headers: { ...(init.headers as Record<string, string>), ...(key && { Authorization: `Bearer ${key}` }) },
    });

    if (res.ok || res.status === 404) {
      return res;
    }

    if ((res.status === 429 || res.status >= 500) && attempt < 5) {
      await sleep(1000 * 2 ** attempt);
      continue;
    }

    throw new Error(`${init.method ?? "GET"} ${url} -> ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
};

const encodeBundle = (meta: IndexMeta, scales: Float32Array, vectors: Int8Array) => {
  const json = new TextEncoder().encode(JSON.stringify(meta));
  const scalesOffset = 16 + Math.ceil(json.length / 4) * 4;
  const out = new Uint8Array(scalesOffset + scales.byteLength + vectors.byteLength);
  const view = new DataView(out.buffer);

  view.setUint32(0, MAGIC, true);
  view.setUint32(4, meta.chunks.length, true);
  view.setUint32(8, meta.dims, true);
  view.setUint32(12, json.length, true);
  out.set(json, 16);
  out.set(new Uint8Array(scales.buffer), scalesOffset);
  out.set(new Uint8Array(vectors.buffer), scalesOffset + scales.byteLength);

  return out;
};

const decodeBundle = (buf: ArrayBuffer) => {
  const view = new DataView(buf);

  if (view.getUint32(0, true) !== MAGIC) {
    throw new Error("Not an index bundle");
  }

  const [count, dims, metaLength] = [view.getUint32(4, true), view.getUint32(8, true), view.getUint32(12, true)];
  const scalesOffset = 16 + Math.ceil(metaLength / 4) * 4;

  return {
    meta: JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 16, metaLength))) as IndexMeta,
    scales: new Float32Array(buf, scalesOffset, count),
    vectors: new Int8Array(buf, scalesOffset + count * 4, count * dims),
  };
};

const loadLiveVectors = async (base: string, key: string, config: string, dims: number) => {
  const vectors = new Map<string, StoredVector>();
  const res = await request(`${base}/admin/index`, key);

  if (!res.ok) {
    return { vectors, commit: null };
  }

  const live = decodeBundle(await res.arrayBuffer());

  if (live.meta.config === config && live.meta.dims === dims) {
    live.meta.chunks.forEach((chunk, i) =>
      vectors.set(chunk[5], { scale: live.scales[i], vec: live.vectors.slice(i * dims, (i + 1) * dims) }),
    );
  }

  return { vectors, commit: live.meta.commit };
};

const embedMissing = async (
  base: string,
  key: string,
  config: string,
  dims: number,
  chunks: PublishChunk[],
  hashes: string[],
  vectors: Map<string, StoredVector>,
) => {
  const firstByHash = new Map(hashes.map((hash, i) => [hash, i]));
  // Workers AI bills padded batch tokens, so batching similar lengths keeps cost near real tokens
  const todo = [...firstByHash]
    .filter(([hash]) => !vectors.has(hash))
    .map(([, i]) => i)
    .sort((a, b) => chunks[a].content.length - chunks[b].content.length);

  const batches = Array.from({ length: Math.ceil(todo.length / BATCH_SIZE) }, (_, i) =>
    todo.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE),
  );
  let next = 0;

  const worker = async () => {
    while (next < batches.length) {
      const batch = batches[next++];
      const res = await request(`${base}/admin/embed`, key, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chunks: batch.map((i) => ({
            title: chunks[i].title,
            section: chunks[i].section,
            content: chunks[i].content,
          })),
        }),
      });

      if (res.headers.get("x-embed-config") !== config) {
        throw new Error("Worker embedding config changed mid-publish");
      }

      const buf = await res.arrayBuffer();
      const scales = new Float32Array(buf, 0, batch.length);
      const vecs = new Int8Array(buf, batch.length * 4, batch.length * dims);

      batch.forEach((chunkIndex, j) =>
        vectors.set(hashes[chunkIndex], { scale: scales[j], vec: vecs.slice(j * dims, (j + 1) * dims) }),
      );
    }
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  return todo.length;
};

const buildMeta = (
  chunks: PublishChunk[],
  hashes: string[],
  config: string,
  dims: number,
  commit: string,
): IndexMeta => {
  const titles: string[] = [];
  const paths: string[] = [];
  const vocab: string[] = [];
  const vocabIds = new Map<string, number>();

  const intern = (list: string[], value: string) => (list.includes(value) ? list.indexOf(value) : list.push(value) - 1);
  const tokenIds = (text: string) =>
    tokenize(text).map(
      (token) => vocabIds.get(token) ?? (vocabIds.set(token, vocab.push(token) - 1), vocab.length - 1),
    );

  return {
    format: 2,
    config,
    dims,
    commit,
    builtAt: new Date().toISOString(),
    titles,
    paths,
    vocab,
    chunks: chunks.map((chunk, i) => [
      intern(titles, chunk.title),
      intern(paths, chunk.path),
      chunk.section,
      chunk.anchor,
      chunk.content.slice(0, SNIPPET_CHARS),
      hashes[i],
      tokenIds(chunk.section),
      tokenIds(chunk.anchor.replace(/-/g, " ")),
    ]),
  };
};

export const publishSearchIndex = async (
  chunks: PublishChunk[],
  { url, key, commit, full = false, log = console.log }: PublishOptions,
) => {
  const base = url.replace(/\/$/, "");
  const { config, dims } = (await (await request(`${base}/health`, undefined)).json()) as {
    config: string;
    dims: number;
  };
  const hashes = chunks.map((chunk) =>
    createHash("sha256")
      .update(`${config}\0${chunk.title}\0${chunk.section}\0${chunk.content}`)
      .digest("hex")
      .slice(0, 16),
  );

  const live = full
    ? { vectors: new Map<string, StoredVector>(), commit: null }
    : await loadLiveVectors(base, key, config, dims);

  if (live.commit) {
    log(`Reusing ${live.vectors.size} vectors from live index (${live.commit.slice(0, 7)})`);
  }

  const embedded = await embedMissing(base, key, config, dims, chunks, hashes, live.vectors);

  log(embedded ? `Embedded ${embedded} new/changed chunks` : "All chunks unchanged, nothing to embed");

  const scales = new Float32Array(chunks.length);
  const vectors = new Int8Array(chunks.length * dims);

  hashes.forEach((hash, i) => {
    const { scale, vec } = live.vectors.get(hash)!;

    scales[i] = scale;
    vectors.set(vec, i * dims);
  });

  const bundle = encodeBundle(buildMeta(chunks, hashes, config, dims, commit), scales, vectors);
  const res = await request(`${base}/admin/index`, key, {
    method: "PUT",
    headers: { "Content-Type": "application/octet-stream" },
    body: bundle,
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status} ${await res.text()}`);
  }

  const { id } = (await res.json()) as { id: string };

  log(`Published ${chunks.length} chunks (${(bundle.length / 1024).toFixed(0)} KiB) as ${id}`);

  return { id, embedded, reused: chunks.length - embedded };
};
