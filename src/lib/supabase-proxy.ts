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

let installed = false;
export function installSupabaseProxy() {
  if (installed || !shouldProxy()) return;
  installed = true;
  const original = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (SB_HOST_RE.test(url)) {
        const next = proxiedUrl(url);
        if (typeof input === "string" || input instanceof URL) return original(next, init);
        return original(new Request(next, input), init);
      }
    } catch {
      /* fall through */
    }
    return original(input, init);
  };
}

installSupabaseProxy();
