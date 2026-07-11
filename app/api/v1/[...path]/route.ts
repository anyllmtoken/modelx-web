// Handles GET /api/v1/{path} (catch-all for sub-routes like /api/v1/stats, /api/v1/models)
// Strips /api/v1 prefix from the URL path before passing to the Hono app,
// since the Hono app defines routes as relative paths (e.g. /stats, /models).
import { app } from "../app";

function stripPrefix(req: Request): Request {
  const url = new URL(req.url);
  // Remove /api/v1 prefix from the pathname
  const stripped = url.pathname.replace(/^\/api\/v1/, "") || "/";
  const newUrl = new URL(stripped, url.origin);
  // Preserve search params
  newUrl.search = url.search;
  return new Request(newUrl.toString(), req);
}

export const GET = (req: Request) => app.fetch(stripPrefix(req));
export const POST = (req: Request) => app.fetch(stripPrefix(req));
export const PUT = (req: Request) => app.fetch(stripPrefix(req));
export const DELETE = (req: Request) => app.fetch(stripPrefix(req));
