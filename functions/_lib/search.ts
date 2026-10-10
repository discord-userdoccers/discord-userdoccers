// Semantic search is served by the userdocs-search worker (Workers AI
// embeddings). This module just proxies to it with the site's API key, so the
// key never reaches the browser.
const DEFAULT_SEARCH_API_URL = "https://userdocs-search.hoodliens.workers.dev";

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
  SEARCH_API_KEY: string;
  /** Optional override, e.g. for a staging search worker */
  SEARCH_API_URL?: string;
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

declare const globalThis: {
  __llmsPages?: Map<string, string>;
};

export async function search(query: string, env: SearchEnv, origin: string, limit = 10): Promise<ScoredResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  if (trimmed.length > 200) throw new SearchError("Query too long", 400);
  if (!env.SEARCH_API_KEY) throw new SearchError("Search not configured", 503);

  const url = new URL("/api/search", env.SEARCH_API_URL || DEFAULT_SEARCH_API_URL);
  url.searchParams.set("q", trimmed);
  url.searchParams.set("limit", String(limit));

  const res = await fetch(url, { headers: { Authorization: `Bearer ${env.SEARCH_API_KEY}` } });
  if (!res.ok) {
    throw new SearchError(`Search backend error ${res.status}: ${await res.text()}`, res.status === 400 ? 400 : 502);
  }

  const { results } = (await res.json()) as { results: (ChunkMeta & { score: number })[] };
  return results.map((r) => ({ ...r, url: `${origin}${r.anchor ? `${r.path}#${r.anchor}` : r.path}` }));
}

async function loadLlmsPages(assets: SearchAssets, origin: string): Promise<Map<string, string>> {
  if (globalThis.__llmsPages) return globalThis.__llmsPages;

  const res = await assets.fetch(`${origin}/llms.txt`);
  if (!res.ok) throw new SearchError("llms.txt unavailable", 503);
  const text = await res.text();

  const pages = new Map<string, string>();
  const sections = text.split(/(?=^# .+\nLink: )/m);
  for (const section of sections) {
    const linkMatch = section.match(/^Link:\s+https?:\/\/[^/\s]+(\/[^\s]*)$/m);
    if (!linkMatch) continue;
    const sectionPath = linkMatch[1].replace(/\/$/, "") || "/";
    pages.set(sectionPath, section.trim());
  }

  globalThis.__llmsPages = pages;
  return pages;
}

export async function fetchPage(path: string, assets: SearchAssets, origin: string): Promise<string> {
  if (!path.startsWith("/")) throw new SearchError("Path must start with /", 400);
  if (path.includes("..")) throw new SearchError("Invalid path", 400);

  const pages = await loadLlmsPages(assets, origin);
  const normalised = path.replace(/\/$/, "") || "/";
  const section = pages.get(normalised);

  if (!section) throw new SearchError(`Page not found: ${path}`, 404);
  return section;
}
