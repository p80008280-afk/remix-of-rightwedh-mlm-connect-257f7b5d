import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

// Same-origin relay to the database API. Some Indian ISPs (Jio, Airtel, ACT)
// block *.supabase.co at DNS level, so browsers on those networks hang on
// login/data calls. The browser calls /sbp/... on our own domain instead and
// this server forwards it. Only the project's own API paths are allowed.
const FALLBACK_URL = "https://pyarcaxdnxnzedprfvyx.supabase.co";
const ALLOWED = /^(auth|rest|storage|functions)\/v1(\/|$)/;
const DROP_REQ = new Set(["host", "cookie", "connection", "content-length", "accept-encoding", "origin", "referer", "expect", "keep-alive", "upgrade", "te", "trailer"]);
const DROP_RES = new Set(["content-encoding", "content-length", "transfer-encoding", "connection", "set-cookie"]);

async function relay({ request, params }: { request: Request; params: { _splat?: string } }) {
  const path = params._splat ?? "";
  if (!ALLOWED.test(path)) return new Response("Not found", { status: 404 });
  const base = (process.env["SUPABASE_URL"] || FALLBACK_URL).replace(/\/$/, "");
  const target = new URL(`${base}/${path}`);
  target.search = new URL(request.url).search;

  const headers = new Headers();
  request.headers.forEach((v, k) => {
    if (!DROP_REQ.has(k.toLowerCase()) && !k.toLowerCase().startsWith("x-forwarded")) headers.set(k, v);
  });

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    redirect: "manual",
  });

  const out = new Headers();
  upstream.headers.forEach((v, k) => {
    if (!DROP_RES.has(k.toLowerCase())) out.set(k, v);
  });
  out.set("Cache-Control", "no-store");
  return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers: out });
}

export const Route = createFileRoute("/sbp/$")({
  server: {
    handlers: {
      GET: relay,
      POST: relay,
      PUT: relay,
      PATCH: relay,
      DELETE: relay,
      HEAD: relay,
      OPTIONS: relay,
    },
  },
});
