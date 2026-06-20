// Remote MCP server for Discord Userdoccers documentation.
// Implements the MCP Streamable HTTP transport (JSON-RPC over HTTP POST).
// Connect from any MCP client at: https://docs.discord.food/mcp
//
// Clients without native remote MCP support can use mcp-remote as a bridge:
//   npx mcp-remote https://docs.discord.food/mcp
import { fetchPage, search, SearchEnv, SearchError } from "./_lib/search";

const SERVER_INFO = { name: "discord-userdoccers", version: "1.0.0" };

const TOOLS = [
  {
    name: "search_docs",
    description:
      "Semantically search the Discord API documentation. Returns the most relevant sections based on meaning, not just keywords. Use this to find information about Discord API endpoints, data structures, Gateway events, and concepts.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "What you are looking for, in natural language. Max 200 characters.",
        },
        limit: {
          type: "number",
          description: "Maximum results to return (default 8, max 20).",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "fetch_page",
    description:
      "Fetch the full Markdown content of a Discord API documentation page. Use after search_docs to get complete details about a topic.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Page path, e.g. '/resources/user', '/authentication', '/gateway/gateway-events'.",
        },
      },
      required: ["path"],
    },
  },
];

type JsonRpcId = string | number | null;

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: JsonRpcId;
  method: string;
  params?: Record<string, unknown>;
}

function ok(id: JsonRpcId, result: unknown): unknown {
  return { jsonrpc: "2.0", id: id ?? null, result };
}

function rpcErr(id: JsonRpcId, code: number, message: string): unknown {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}

async function handle(req: JsonRpcRequest, env: SearchEnv, origin: string): Promise<unknown> {
  const id = req.id ?? null;

  switch (req.method) {
    case "initialize":
      return ok(id, {
        protocolVersion: "2024-11-05",
        serverInfo: SERVER_INFO,
        capabilities: { tools: {} },
      });

    case "notifications/initialized":
      return null; // Notifications require no response

    case "ping":
      return ok(id, {});

    case "tools/list":
      return ok(id, { tools: TOOLS });

    case "tools/call": {
      const { name, arguments: args = {} } = (req.params ?? {}) as {
        name: string;
        arguments?: Record<string, unknown>;
      };

      try {
        if (name === "search_docs") {
          const query = args.query as string | undefined;
          if (!query?.trim()) return rpcErr(id, -32602, "query is required");
          const limit = Math.min(Number(args.limit ?? 8), 20);

          const results = await search(query, env, origin, limit);
          const text =
            results.length === 0
              ? "No results found."
              : results
                  .map((r, i) => {
                    const breadcrumb = r.section !== r.title ? `${r.title} > ${r.section}` : r.title;
                    const snippet = r.content.length > 600 ? r.content.slice(0, 600) + "…" : r.content;
                    return `${i + 1}. **${breadcrumb}**\nURL: ${r.url}\n\n${snippet}`;
                  })
                  .join("\n\n---\n\n");

          return ok(id, { content: [{ type: "text", text }] });
        }

        if (name === "fetch_page") {
          const path = args.path as string | undefined;
          if (!path?.trim()) return rpcErr(id, -32602, "path is required");

          const content = await fetchPage(path, env.ASSETS, origin);
          return ok(id, { content: [{ type: "text", text: content }] });
        }

        return rpcErr(id, -32601, `Unknown tool: ${name}`);
      } catch (e) {
        if (e instanceof SearchError) return rpcErr(id, -32603, e.message);
        throw e;
      }
    }

    default:
      return rpcErr(id, -32601, `Method not found: ${req.method}`);
  }
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

export async function onRequest(context: { request: Request; env: SearchEnv }): Promise<Response> {
  const { request, env } = context;
  const origin = new URL(request.url).origin;

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: CORS });
  }

  let body: JsonRpcRequest | JsonRpcRequest[];
  try {
    body = (await request.json()) as JsonRpcRequest | JsonRpcRequest[];
  } catch {
    return Response.json(rpcErr(null, -32700, "Parse error"), {
      status: 400,
      headers: CORS,
    });
  }

  try {
    if (Array.isArray(body)) {
      const responses = (await Promise.all(body.map((req) => handle(req, env, origin)))).filter((r) => r !== null);
      return Response.json(responses, { headers: CORS });
    }

    const response = await handle(body, env, origin);
    if (response === null) {
      return new Response(null, { status: 202, headers: CORS });
    }
    return Response.json(response, { headers: CORS });
  } catch (e) {
    console.error("MCP error:", e);
    return Response.json(rpcErr(null, -32603, "Internal error"), {
      status: 500,
      headers: CORS,
    });
  }
}
