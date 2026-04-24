import { search, SearchEnv, SearchError } from "../_lib/search";

export async function onRequest(context: { request: Request; env: SearchEnv }): Promise<Response> {
  const url = new URL(context.request.url);
  const query = url.searchParams.get("q")?.trim();

  if (!query) return Response.json({ results: [] });

  try {
    const scored = await search(query, context.env, url.origin);
    // Strip the absolute `url` field for backward compatibility with the existing UI
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const results = scored.map(({ url: _url, ...rest }) => rest);
    return Response.json({ results }, { headers: { "Cache-Control": "public, max-age=60" } });
  } catch (err) {
    if (err instanceof SearchError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    console.error("Search error:", err);
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}
