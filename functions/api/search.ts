const MODEL = "gemini-embedding-2";
const DIMS = 768;
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

interface Env {
  GEMINI_API_KEY: string;
  ASSETS: {
    fetch(input: string | Request): Promise<Response>;
  };
}

interface ChunkMeta {
  title: string;
  section: string;
  path: string;
  anchor: string;
  content: string;
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
    throw new Error(`Gemini API error ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as { embedding: { values: number[] } };
  return json.embedding.values;
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const url = new URL(context.request.url);
  const query = url.searchParams.get("q")?.trim();

  if (!query) return Response.json({ results: [] });
  if (query.length > 200) return Response.json({ error: "Query too long" }, { status: 400 });

  if (!context.env.GEMINI_API_KEY) {
    return Response.json({ error: "Search not configured" }, { status: 503 });
  }

  try {
    const base = url.origin;
    const [metaRes, vecRes] = await Promise.all([
      context.env.ASSETS.fetch(`${base}/search-index.json`),
      context.env.ASSETS.fetch(`${base}/search-vectors.bin`),
    ]);

    if (!metaRes.ok || !vecRes.ok) {
      return Response.json({ error: "Search index unavailable" }, { status: 503 });
    }

    const chunks: ChunkMeta[] = await metaRes.json();
    if (!chunks.length) return Response.json({ results: [] });

    const vectorBuffer = await vecRes.arrayBuffer();
    const vectors = new Float32Array(vectorBuffer);
    const dims = vectors.length / chunks.length;

    if (dims === 0 || !Number.isInteger(dims)) {
      return Response.json({ error: "Search index corrupt" }, { status: 503 });
    }

    const qvec = await embedQuery(query, context.env.GEMINI_API_KEY);

    if (qvec.length !== dims) {
      return Response.json(
        { error: `Dimension mismatch: query=${qvec.length}, index=${dims}. Index rebuild required.` },
        { status: 503 },
      );
    }

    const scored = chunks.map((chunk, i) => ({
      ...chunk,
      score: cosine(qvec, vectors, i * dims, dims),
    }));

    scored.sort((a, b) => b.score - a.score);

    return Response.json({ results: scored.slice(0, 10) }, { headers: { "Cache-Control": "public, max-age=60" } });
  } catch (err) {
    console.error("Search error:", err);
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}
