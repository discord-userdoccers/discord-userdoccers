// Chunks the docs and publishes them to the userdocs-search worker, which embeds
// changed chunks with Workers AI. Unchanged chunks reuse their existing vectors,
// so a typical deploy costs only a few neurons.
import { execSync } from "child_process";
import { opendir, readFile } from "fs/promises";
import { join, sep } from "path";
import matter from "gray-matter";
import { publishSearchIndex } from "./searchPublisher.ts";

const SEARCH_API_URL = process.env.SEARCH_API_URL || "https://userdocs-search.hoodliens.workers.dev";
const SEARCH_PUBLISH_KEY = process.env.SEARCH_PUBLISH_KEY;

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
  "json-body",
  "jsonform-params",
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

if (!SEARCH_PUBLISH_KEY) {
  console.warn("⚠ SEARCH_PUBLISH_KEY not set, skipping search index publish");
  process.exit(0);
}

const root = join(process.cwd(), "pages");
const files = (await walk(root)).sort();
console.log(`Found ${files.length} MDX files`);

const chunks: Chunk[] = [];
for (const file of files) {
  const rel = file.slice(root.length + 1, -4).replaceAll(sep, "/");
  const pagePath = rel === "index" ? "/" : `/${rel}`;
  const parsed = matter(await readFile(file, "utf-8"));
  const title =
    parsed.data.name ??
    parsed.content
      .trim()
      .split("\n")
      .find((l: string) => l.startsWith("#"))
      ?.replace(/^#+\s+/, "") ??
    rel;
  chunks.push(...chunkPage(parsed.content, title, pagePath));
}
console.log(`${chunks.length} chunks`);

const commit = process.env.GITHUB_SHA || execSync("git rev-parse HEAD").toString().trim();
await publishSearchIndex(chunks, { url: SEARCH_API_URL, key: SEARCH_PUBLISH_KEY, commit });
