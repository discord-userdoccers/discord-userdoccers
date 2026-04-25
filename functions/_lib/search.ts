const MODEL = "gemini-embedding-2";
export const DIMS = 768;
const GEMINI_BASE = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}`;

// When any term appears in the query, all others are appended to pull the
// embedding vector toward the full concept cluster
const SYNONYMS: string[][] = [
  ["server", "guild"],
  ["dm", "direct message"],
  ["authentication", "credentials", "auth"],
  ["nitro", "premium", "boost"],
  ["pomelo", "unique username"],
  ["client", "user"],
];

export interface ChunkMeta {
  title: string;
  section: string;
  path: string;
  anchor: string;
  content: string;
}

export interface ScoredResult extends ChunkMeta {
  score: number;
  url: string;
}

export interface SearchAssets {
  fetch(input: string | Request): Promise<Response>;
}

export interface SearchEnv {
  GEMINI_API_KEY: string;
  ASSETS: SearchAssets;
}

export class SearchError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "SearchError";
    this.status = status;
  }
}

function expandQuery(query: string): string {
  const lower = query.toLowerCase();
  const expansions = new Set<string>();

  for (const group of SYNONYMS) {
    for (const term of group) {
      if (lower.includes(term)) {
        for (const synonym of group) {
          if (!lower.includes(synonym)) expansions.add(synonym);
        }
        break;
      }
    }
  }

  if (expansions.size === 0) return query;
  return `${query} ${[...expansions].join(" ")}`;
}

function cosine(query: number[], vectors: Float32Array, offset: number, dims: number): number {
  let dot = 0;
  let nq = 0;
  let nv = 0;
  for (let i = 0; i < dims; i++) {
    const q = query[i];
    const v = vectors[offset + i];
    dot += q * v;
    nq += q * q;
    nv += v * v;
  }
  return dot / (Math.sqrt(nq) * Math.sqrt(nv));
}

async function embedQuery(text: string, apiKey: string): Promise<number[]> {
  // Asymmetric retrieval format for queries
  const formatted = `task: search result | query: ${expandQuery(text)}`;

  const res = await fetch(`${GEMINI_BASE}:embedContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: `models/${MODEL}`,
      content: { parts: [{ text: formatted }] },
      outputDimensionality: DIMS,
    }),
  });

  if (!res.ok) {
    throw new SearchError(`Gemini API error ${res.status}: ${await res.text()}`, 502);
  }

  const json = (await res.json()) as { embedding: { values: number[] } };
  return json.embedding.values;
}

interface IndexCache {
  chunks: ChunkMeta[];
  vectors: Float32Array;
  dims: number;
}

// CF Workers reuse V8 isolates between requests on the same edge node
// Caching the parsed index in globalThis avoids re-fetching and re-parsing
// the ~10 MB vectors binary on every request
declare const globalThis: { __searchIndex?: IndexCache };

async function loadIndex(assets: SearchAssets, origin: string): Promise<IndexCache> {
  if (globalThis.__searchIndex) return globalThis.__searchIndex;

  const [metaRes, vecRes] = await Promise.all([
    assets.fetch(`${origin}/search-index.json`),
    assets.fetch(`${origin}/search-vectors.bin`),
  ]);

  if (!metaRes.ok || !vecRes.ok) {
    throw new SearchError("Search index unavailable", 503);
  }

  const chunks = (await metaRes.json()) as ChunkMeta[];
  if (!chunks.length) return { chunks: [], vectors: new Float32Array(0), dims: 0 };

  const vectorBuffer = await vecRes.arrayBuffer();
  const vectors = new Float32Array(vectorBuffer);
  const dims = vectors.length / chunks.length;

  if (dims === 0 || !Number.isInteger(dims)) {
    throw new SearchError("Search index corrupt", 503);
  }

  globalThis.__searchIndex = { chunks, vectors, dims };
  return globalThis.__searchIndex;
}

export async function search(query: string, env: SearchEnv, origin: string, limit = 10): Promise<ScoredResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  if (trimmed.length > 200) throw new SearchError("Query too long", 400);
  if (!env.GEMINI_API_KEY) throw new SearchError("Search not configured", 503);

  const [{ chunks, vectors, dims }, qvec] = await Promise.all([
    loadIndex(env.ASSETS, origin),
    embedQuery(trimmed, env.GEMINI_API_KEY),
  ]);

  if (!chunks.length) return [];

  if (qvec.length !== dims) {
    throw new SearchError(`Dimension mismatch: query=${qvec.length}, index=${dims}. Index rebuild required.`, 503);
  }

  const scored: ScoredResult[] = chunks.map((chunk, i) => {
    const pathWithAnchor = chunk.anchor ? `${chunk.path}#${chunk.anchor}` : chunk.path;
    return {
      ...chunk,
      score: cosine(qvec, vectors, i * dims, dims),
      url: `${origin}${pathWithAnchor}`,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

export async function fetchPage(path: string, assets: SearchAssets, origin: string): Promise<string> {
  if (!path.startsWith("/")) throw new SearchError("Path must start with /", 400);
  if (path.includes("..")) throw new SearchError("Invalid path", 400);

  const res = await assets.fetch(`${origin}/llms.txt`);
  if (!res.ok) throw new SearchError("llms.txt unavailable", 503);
  const text = await res.text();

  // Each page section in llms.txt starts with "# Title\nLink: <url>" and ends
  // just before the next such block (or end-of-file)
  const sections = text.split(/(?=^# .+\nLink: )/m);
  const normalised = path.replace(/\/$/, "") || "/";

  const section = sections.find((s) => {
    const linkMatch = s.match(/^Link:\s+https?:\/\/[^/\s]+(\/[^\s]*)$/m);
    if (!linkMatch) return false;
    const sectionPath = linkMatch[1].replace(/\/$/, "") || "/";
    return sectionPath === normalised;
  });

  if (!section) throw new SearchError(`Page not found: ${path}`, 404);
  return section.trim();
}
