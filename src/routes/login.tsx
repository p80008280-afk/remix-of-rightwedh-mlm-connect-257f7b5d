import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
const logoAsset = { url: "/logo.png" };

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Righwedh Sanjivni" },
      { name: "description", content: "Login to your Righwedh Sanjivni member or admin account." },
      { property: "og:title", content: "Login — Righwedh Sanjivni" },
      { property: "og:description", content: "Secure member and admin login for Righwedh Sanjivni." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

// Mobile numbers (and legacy usernames) are converted to a synthetic email so
// many accounts can share one real email address.
function identifierToEmail(identifier: string) {
  return `${identifier.trim().toLowerCase().replace(/\s/g, "")}@rs.local`;
}

function Login() {
  const nav = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    // Admin still logs in with their real email; members use username.
    try {
      const email = identifier.includes("@") ? identifier.trim().toLowerCase() : usernameToEmail(identifier);
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err || !data.user) {
        setError("Login failed. Members must use their Login Username; the admin uses the admin email. Check the password and try again.");
        return;
      }
      const { data: roles, error: roleError } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
      if (roleError) throw roleError;
      const isAdmin = roles?.some((r) => r.role === "admin");
      await nav({ to: isAdmin ? "/admin" : "/dashboard", replace: true });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login could not be completed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteLayout>
      <section className="min-h-[80vh] flex items-center justify-center bg-gradient-leaf px-6 py-16">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-10 shadow-elegant">
          <div className="flex flex-col items-center">
            <div className="h-20 w-20 rounded-full overflow-hidden bg-white flex items-center justify-center ring-2 ring-gold/50 shadow-soft">
              <img src={logoAsset.url} alt="Logo" className="h-full w-full object-cover" />
            </div>
            <h1 className="mt-4 font-serif text-3xl text-primary">Login</h1>
            <p className="mt-1 text-sm text-muted-foreground">Members login with username. Admin can use email.</p>
          </div>
          <form className="mt-8 space-y-4" onSubmit={submit}>
            <label className="block text-sm font-medium">
              Username or Admin Email
              <input
                type="text"
                required
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="member username or admin email"
                className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="block text-sm font-medium">
              Password
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-ring"
              />
            </label>
            {error && <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3">{error}</div>}
            <button
              disabled={loading}
              className="w-full rounded-full bg-gradient-gold py-3.5 font-semibold text-gold-foreground shadow-gold hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Use the unique username created during registration; the same email can be reused for many accounts.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
