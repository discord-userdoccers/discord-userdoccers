import { createHash } from "crypto";
import { existsSync } from "fs";
import { opendir, readFile, writeFile } from "fs/promises";
import { join, sep } from "path";
import matter from "gray-matter";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-embedding-2";
const DIMS = 768;
const BATCH_SIZE = 100;
const GEMINI_BASE = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}`;
const HASH_FILE = join(process.cwd(), "public", "search-index.hash");

interface Chunk {
  title: string;
  section: string;
  path: string;
  anchor: string;
  content: string;
}

async function walk(dir: string): Promise<string[]> {
  const results: string[] = [];
  const entries = await opendir(dir);
  for await (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walk(full)));
    } else if (entry.isFile() && entry.name.endsWith(".mdx") && !entry.name.startsWith("_")) {
      results.push(full);
    }
  }
  return results;
}

function stripMdx(text: string): string {
  return (
    text
      .replace(/^---[\s\S]*?^---/m, "")
      .replace(/^import\s+.+$/gm, "")
      .replace(/^export\s+.+$/gm, "")
      // JSX tags
      .replace(/<[A-Z]\w*(?:\s[^>]*)?\/?>/g, "")
      .replace(/<\/[A-Z]\w*>/g, "")
      // HTML tags
      .replace(/<[a-z][^>]*>/g, "")
      .replace(/<\/[a-z]+>/g, "")
      // Code
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`([^`]+)`/g, "$1")
      // Markdown formatting
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/^#+\s+/gm, "")
      // Custom syntax
      .replace(/^%\s+.+$/gm, "")
      // Drop table separator rows (| --- | --- |)
      .replace(/^\|[\s-:|]+\|$/gm, "")
      // Convert table rows to tab-separated format (parseable for mini table rendering)
      .replace(/^\|.*\|$/gm, (line) => {
        const cells = line
          .split("|")
          .map((c) => c.trim())
          .filter(Boolean);
        return `\x00${cells.join("\t")}`;
      })
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

function toAnchor(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Generic sub-headings that repeat under every endpoint and shouldn't be indexed as standalone sections
const GENERIC_HEADINGS = new Set([
  "json-params",
  "query-string-params",
  "form-params",
  "response-body",
  "json-response",
  "example-response",
  "example-request",
]);

function chunkPage(raw: string, title: string, pagePath: string): Chunk[] {
  const lines = raw.split("\n");
  const chunks: Chunk[] = [];
  let section = title;
  let anchor = "";
  let parentSection = title;
  let parentAnchor = "";
  let buf: string[] = [];
  let inCode = false;
  let nextLineIsRouteHeaderName = false;

  const flush = () => {
    const text = stripMdx(buf.join("\n")).trim();
    // Merge into the last chunk if it shares the same anchor (accumulating h4+ content)
    if (text.length > 30) {
      const last = chunks[chunks.length - 1];
      if (last && last.anchor === anchor && last.content.length + text.length < 1500) {
        last.content += "\n" + text;
      } else {
        chunks.push({ title, section, path: pagePath, anchor, content: text });
      }
    }
    buf = [];
  };

  for (const line of lines) {
    if (line.startsWith("```")) inCode = !inCode;
    if (inCode) {
      buf.push(line);
      continue;
    }

    // Detect <RouteHeader> — the next non-empty line is the endpoint name
    if (line.match(/^<RouteHeader\s/)) {
      nextLineIsRouteHeaderName = true;
      continue;
    }

    // Capture the endpoint name from inside <RouteHeader>...</RouteHeader>
    if (nextLineIsRouteHeaderName) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("</RouteHeader")) {
        nextLineIsRouteHeaderName = false;
        continue;
      }
      flush();
      const name = trimmed.replace(/<\/?[^>]+>/g, "").trim();
      if (name) {
        section = name;
        anchor = toAnchor(name);
        parentSection = name;
        parentAnchor = anchor;
      }
      nextLineIsRouteHeaderName = false;
      continue;
    }

    if (line.match(/^<\/RouteHeader/)) continue;

    const m = line.match(/^(#{1,6})\s+(.+)/);
    if (m) {
      const level = m[1].length;
      const name = m[2].replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
      const headingAnchor = toAnchor(m[2]);

      if (GENERIC_HEADINGS.has(headingAnchor)) {
        section = parentSection;
        anchor = parentAnchor;
      } else {
        flush();
        section = name;
        anchor = headingAnchor;
        parentSection = name;
        parentAnchor = headingAnchor;
      }
    } else {
      buf.push(line);
    }
  }
  flush();
  return chunks;
}

async function embed(texts: string[]): Promise<number[][]> {
  const all: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const n = Math.floor(i / BATCH_SIZE) + 1;
    const total = Math.ceil(texts.length / BATCH_SIZE);
    console.log(`  Embedding batch ${n}/${total} (${batch.length} chunks)...`);

    const res = await fetch(`${GEMINI_BASE}:batchEmbedContents?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: batch.map((text) => ({
          model: `models/${MODEL}`,
          content: { parts: [{ text }] },
          outputDimensionality: DIMS,
        })),
      }),
    });

    if (res.status === 429) {
      console.warn(`    Rate limited by Gemini API, waiting 3 seconds before retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      i -= BATCH_SIZE;
      continue;
    }

    if (!res.ok) {
      throw new Error(`Gemini API error ${res.status}: ${await res.text()}`);
    }

    const json = (await res.json()) as { embeddings: { values: number[] }[] };
    if (!json.embeddings?.length) {
      throw new Error(`Gemini API returned no embeddings: ${JSON.stringify(json)}`);
    }

    all.push(...json.embeddings.map((e) => e.values));
  }
  return all;
}

if (!GEMINI_API_KEY) {
  console.warn("⚠ GEMINI_API_KEY not set, writing empty search index");
  if (!existsSync(join(process.cwd(), "public", "search-index.json"))) {
    await writeFile(join(process.cwd(), "public", "search-index.json"), "[]");
    await writeFile(join(process.cwd(), "public", "search-vectors.bin"), Buffer.alloc(0));
  }
  process.exit(0);
}

const root = join(process.cwd(), "pages");
const files = (await walk(root)).sort();
console.log(`Found ${files.length} MDX files`);

// Hash all MDX content to detect changes
const hasher = createHash("sha256");
for (const file of files) {
  hasher.update(await readFile(file));
}
const contentHash = hasher.digest("hex");

// Check if index is already up-to-date
const indexExists =
  existsSync(join(process.cwd(), "public", "search-index.json")) &&
  existsSync(join(process.cwd(), "public", "search-vectors.bin"));

if (existsSync(HASH_FILE)) {
  const oldHash = (await readFile(HASH_FILE, "utf-8")).trim();
  if (oldHash === contentHash && indexExists) {
    console.log("✓ Search index is up-to-date, skipping embedding generation");
    process.exit(0);
  }
}

const allChunks: Chunk[] = [];

for (const file of files) {
  const rel = file.slice(root.length + 1, -4).replaceAll(sep, "/");
  const pagePath = rel === "index" ? "/" : `/${rel}`;
  const raw = await readFile(file, "utf-8");
  const parsed = matter(raw);

  const title =
    parsed.data.name ??
    parsed.content
      .trim()
      .split("\n")
      .find((l: string) => l.startsWith("#"))
      ?.replace(/^#+\s+/, "") ??
    rel;

  allChunks.push(...chunkPage(parsed.content, title, pagePath));
}

console.log(`${allChunks.length} chunks from ${files.length} pages`);

// Gemini Embedding 2 asymmetric retrieval format for documents
const texts = allChunks.map((c) => `title: ${c.title} — ${c.section} | text: ${c.content}`);
console.log(`Generating embeddings (${MODEL})...`);
const embeddings = await embed(texts);
console.log(`${embeddings.length} embeddings (${embeddings[0]?.length ?? 0} dims)`);

// Write metadata (content truncated for snippet display)
const meta = allChunks.map(({ title, section, path, anchor, content }) => ({
  title,
  section,
  path,
  anchor,
  content: content.slice(0, 300),
}));
await writeFile(join(process.cwd(), "public", "search-index.json"), JSON.stringify(meta));

// Write embeddings as raw Float32
const flat = new Float32Array(embeddings.length * DIMS);
for (let i = 0; i < embeddings.length; i++) {
  flat.set(embeddings[i], i * DIMS);
}
await writeFile(join(process.cwd(), "public", "search-vectors.bin"), Buffer.from(flat.buffer));

// Write content hash for cache invalidation
await writeFile(HASH_FILE, contentHash);

console.log(`✓ search-index.json (${meta.length} chunks, ${(JSON.stringify(meta).length / 1024).toFixed(0)} KiB)`);
console.log(`✓ search-vectors.bin (${(flat.byteLength / 1024).toFixed(0)} KiB)`);
