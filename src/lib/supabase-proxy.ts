// Routes browser database calls through our own domain (/sbp/...) so the app
// keeps working on Indian ISPs that block *.supabase.co. Enabled on the real
// site (custom domain / Hostinger / app); skipped in the editor preview and
// localhost unless localStorage "rs-sb-proxy" = "1" (for testing).
const SB_HOST_RE = /^https:\/\/[a-z0-9]+\.supabase\.co\//i;

function shouldProxy(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (localStorage.getItem("rs-sb-proxy") === "1") return true;
    if (localStorage.getItem("rs-sb-proxy") === "0") return false;
  } catch {
    /* ignore */
  }
  const h = window.location.hostname;
  if (h === "localhost" || h === "127.0.0.1") return false;
  if (h.endsWith("lovable.app") || h.endsWith("lovableproject.com") || h.endsWith("lovable.dev")) return false;
  return true;
}

export function proxiedUrl(url: string): string {
  if (!shouldProxy() || !SB_HOST_RE.test(url)) return url;
  return url.replace(SB_HOST_RE, `${window.location.origin}/sbp/`);
}

// Hostinger's CDN answers 404 to POST/PUT on URLs that end in a file
// extension (.jpg, .png...), which broke QR/photo/payment-proof uploads.
// Move the real path into a query param for write requests.
const EXT_RE = /\.[a-z0-9]{2,5}$/i;
function writeSafe(url: string, method: string): string {
  if (method === "GET" || method === "HEAD") return url;
  const u = new URL(url);
  const prefix = "/sbp/";
  if (!u.pathname.startsWith(prefix) || !EXT_RE.test(u.pathname)) return url;
  const real = decodeURIComponent(u.pathname.slice(prefix.length));
  const out = new URL(`${u.origin}/sbp/_x`);
  out.searchParams.set("__p", real);
  u.searchParams.forEach((v, k) => out.searchParams.append(k, v));
  return out.href;
}

let installed = false;
export function installSupabaseProxy() {
  if (installed || !shouldProxy()) return;
  installed = true;
  const original = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (SB_HOST_RE.test(url)) {
        const method = (init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
        const next = writeSafe(proxiedUrl(url), method);
        if (typeof input === "string" || input instanceof URL) return original(next, init);
        return original(new Request(next, input), init);
      }
    } catch {
      /* fall through */
    }
    return original(input, init);
  };

  // Photos, payment proofs and QR images are also served from the blocked
  // domain; rewrite <img src> to go through the same relay.
  const setAttr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name: string, value: string) {
    if (name === "src" && typeof value === "string" && SB_HOST_RE.test(value)) value = proxiedUrl(value);
    return setAttr.call(this, name, value);
  };
  const desc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "src");
  if (desc?.set && desc.get) {
    Object.defineProperty(HTMLImageElement.prototype, "src", {
      ...desc,
      set(value: string) {
        desc.set!.call(this, typeof value === "string" ? proxiedUrl(value) : value);
      },
    });
  }
}

installSupabaseProxy();
