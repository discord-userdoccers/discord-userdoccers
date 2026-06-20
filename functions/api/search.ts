import { search, SearchEnv, SearchError } from "../_lib/search";

export async function onRequest(context: {
  request: Request;
  env: SearchEnv;
  waitUntil: (p: Promise<unknown>) => void;
}): Promise<Response> {
  const url = new URL(context.request.url);
  const query = url.searchParams.get("q")?.trim();

  if (!query) return Response.json({ results: [] });

  // Check the CF edge cache first; cache key is the canonical request URL so
  // every worker instance on the same edge node shares hits
  const cache = (caches as unknown as { default: Cache }).default;
  const cacheKey = new Request(`${url.origin}/api/search?q=${encodeURIComponent(query)}`);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  try {
    const scored = await search(query, context.env, url.origin);
    // Strip the absolute `url` field for backward compatibility with the existing UI
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const results = scored.map(({ url: _url, ...rest }) => rest);
    const response = Response.json({ results }, { headers: { "Cache-Control": "public, max-age=300" } });
    // Store in CF edge cache without blocking the response
    context.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch (err) {
    if (err instanceof SearchError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    console.error("Search error:", err);
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}
