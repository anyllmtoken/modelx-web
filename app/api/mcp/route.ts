import { Hono } from "hono";
import { handleMcp } from "../v1/mcp";

// Create a small Hono app for the MCP endpoint (route paths are relative)
const app = new Hono();

app.all("/", async (c) => {
  const result = await handleMcp(c);
  return result ?? c.body(null, 204);
});

// Strip /api/mcp prefix before passing to Hono (Hono routes are relative)
function stripPrefix(req: Request): Request {
  const url = new URL(req.url);
  const stripped = url.pathname.replace(/^\/api\/mcp/, "") || "/";
  const newUrl = new URL(stripped, url.origin);
  newUrl.search = url.search;
  return new Request(newUrl.toString(), req);
}

export const GET = (req: Request) => app.fetch(stripPrefix(req));
export const POST = (req: Request) => app.fetch(stripPrefix(req));
export const DELETE = (req: Request) => app.fetch(stripPrefix(req));
