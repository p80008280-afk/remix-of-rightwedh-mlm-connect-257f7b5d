import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { registerMember } from "@/lib/mlm.functions";
import { useServerFn } from "@tanstack/react-start";
const logoAsset = { url: "/logo.png" };

const search = z.object({ ref: z.string().optional(), pos: z.enum(["left", "right"]).optional() });

export const Route = createFileRoute("/register")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Register — Righwedh Sanjivni" },
      { name: "description", content: "Join Righwedh Sanjivni. Register with your sponsor's referral code." },
    ],
  }),
  component: Register,
});

function usernameToEmail(username: string) {
  return `${username.trim().toLowerCase()}@rs.local`;
}

function Register() {
  const nav = useNavigate();
  const createMember = useServerFn(registerMember);
  const s = useSearch({ from: "/register" });
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    sponsor_code: s.ref?.toUpperCase() || "",
    position: s.pos || "left",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function up<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const uname = form.username.trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,24}$/.test(uname)) {
      setError("Username must be 3-24 chars: letters, numbers, . _ -");
      return;
    }
    setLoading(true);
    try {
      await createMember({ data: {
        fullName: form.full_name.trim(),
        username: uname,
        realEmail: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        sponsorCode: form.sponsor_code.trim().toUpperCase(),
        position: form.position,
      } });
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: usernameToEmail(uname),
        password: form.password,
      });
      if (loginError) throw loginError;
      await nav({ to: "/dashboard", search: { tab: "shop" } as any, replace: true });
    } catch (registrationError) {
      const message = registrationError instanceof Error ? registrationError.message : "Registration failed";
      setError(message.toLowerCase().includes("already") || message.toLowerCase().includes("unique") ? "Username already taken" : message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteLayout>
      <section className="min-h-[80vh] flex items-center justify-center bg-gradient-leaf px-6 py-16">
        <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-10 shadow-elegant">
          <div className="flex flex-col items-center">
            <div className="h-20 w-20 rounded-full overflow-hidden bg-white flex items-center justify-center ring-2 ring-gold/50 shadow-soft">
              <img src={logoAsset.url} alt="Logo" className="h-full w-full object-cover" />
            </div>
            <h1 className="mt-4 font-serif text-3xl text-primary">Join Our Family</h1>
            <p className="mt-1 text-sm text-muted-foreground text-center">
              Register using your sponsor's referral code. Login will use the unique username, not the full name.
            </p>
          </div>
          <form className="mt-8 space-y-4" onSubmit={submit}>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full Name" value={form.full_name} onChange={(v) => up("full_name", v)} />
              <Field
                label="Login Username"
                value={form.username}
                onChange={(v) => up("username", v.toLowerCase())}
                placeholder="e.g. ramesh01"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field
                label="Sponsor Code"
                value={form.sponsor_code}
                onChange={(v) => up("sponsor_code", v.toUpperCase())}
                placeholder="e.g. RSABC123"
                required={false}
              />
              <Field label="Phone" type="tel" value={form.phone} onChange={(v) => up("phone", v)} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Email" type="email" value={form.email} onChange={(v) => up("email", v)} required={false} />
              <label className="block text-sm font-medium">
                Position
                <select
                  value={form.position}
                  onChange={(e) => up("position", e.target.value as "left" | "right")}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-ring"
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </label>
            </div>
            <Field label="Password" type="password" value={form.password} onChange={(v) => up("password", v)} />
            {error && <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3">{error}</div>}
            <button
              disabled={loading}
              className="w-full rounded-full bg-gradient-gold py-3.5 font-semibold text-gold-foreground shadow-gold hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Register"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already a member?{" "}
            <Link to="/login" className="text-primary font-semibold hover:text-primary-glow">
              Login
            </Link>
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}


function Field({
  label, value, onChange, type = "text", placeholder, required = true,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean; }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}
