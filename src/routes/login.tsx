import { PasswordInput } from "@/components/ui/password-input";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
const logoAsset = { url: "/logo.png" };

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Righvedh Sanjivni" },
      { name: "description", content: "Login to your Righvedh Sanjivni member or admin account." },
      { property: "og:title", content: "Login — Righvedh Sanjivni" },
      { property: "og:description", content: "Secure member and admin login for Righvedh Sanjivni." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: "https://righvedhsanjivni.in/login" },
    ],
    links: [{ rel: "canonical", href: "https://righvedhsanjivni.in/login" }],
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
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    // Admin logs in with their real email; members use their mobile number.
    try {
      const email = identifier.includes("@") ? identifier.trim().toLowerCase() : identifierToEmail(identifier);
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err || !data.user) {
        setError("Login failed. Members must use their registered mobile number; the admin uses the admin email. Check the password and try again.");
        return;
      }
      const { data: acct } = await supabase.from("profiles").select("account_status").eq("id", data.user.id).maybeSingle();
      const blocked = acct?.account_status && acct.account_status !== "active";
      if (blocked) {
        await supabase.auth.signOut();
        setError(`Your account is ${acct.account_status}. Please contact the company office.`);
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
            <p className="mt-1 text-sm text-muted-foreground">Members login with mobile number. Admin can use email.</p>
          </div>
          <form className="mt-8 space-y-4" onSubmit={submit}>
            <label className="block text-sm font-medium">
              Mobile Number or Admin Email
              <input
                type="text"
                required
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="10-digit mobile number or admin email"
                className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="block text-sm font-medium">
              Password
              <PasswordInput value={password} onChange={setPassword} />
            </label>
            {error && <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3">{error}</div>}
            <button
              type="submit"
              disabled={loading || !ready}
              className="w-full rounded-full bg-gradient-gold py-3.5 font-semibold text-gold-foreground shadow-gold hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Logging in..." : !ready ? "Please wait..." : "Login"}
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Use the mobile number given at registration; the same email can be reused for many accounts.
          </p>

        </div>
      </section>
    </SiteLayout>
  );
}
