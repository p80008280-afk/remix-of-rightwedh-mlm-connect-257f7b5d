import { PasswordInput } from "@/components/ui/password-input";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { registerMember } from "@/lib/mlm.functions";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Copy } from "lucide-react";
const logoAsset = { url: "/logo.png" };

const search = z.object({ ref: z.string().optional(), pos: z.enum(["left", "right"]).optional() });

export const Route = createFileRoute("/register")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Register — Righvedh Sanjivni" },
      { name: "description", content: "Join Righvedh Sanjivni. Register with your mobile number and your sponsor's referral code." },
      { property: "og:title", content: "Register — Righvedh Sanjivni" },
      { property: "og:description", content: "Create a Righvedh Sanjivni member account with a sponsor referral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: "https://righvedhsanjivni.in/register" },
    ],
    links: [{ rel: "canonical", href: "https://righvedhsanjivni.in/register" }],
  }),
  component: Register,
});

function mobileToEmail(mobile: string) {
  return `${mobile.trim()}@rs.local`;
}

function Register() {
  const nav = useNavigate();
  const createMember = useServerFn(registerMember);
  const s = useSearch({ from: "/register" });
  const [form, setForm] = useState({
    full_name: "",
    mobile: "",
    email: "",
    dob: "",
    password: "",
    sponsor_code: s.ref?.toUpperCase() || "",
    position: s.pos || "left",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ memberCode: string; mobile: string; password: string } | null>(null);

  function up<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const mobile = form.mobile.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    setLoading(true);
    try {
      const res = await createMember({ data: {
        fullName: form.full_name.trim(),
        mobile,
        realEmail: form.email.trim(),
        dob: form.dob,
        password: form.password,
        sponsorCode: form.sponsor_code.trim().toUpperCase(),
        position: form.position,
      } });
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: mobileToEmail(mobile),
        password: form.password,
      });
      if (loginError) throw loginError;
      setSuccess({ memberCode: res.memberCode, mobile, password: form.password });
    } catch (registrationError) {
      const message = registrationError instanceof Error ? registrationError.message : "Registration failed";
      setError(message.toLowerCase().includes("already") ? "This mobile number is already registered." : message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <SiteLayout>
        <section className="min-h-[80vh] flex items-center justify-center bg-gradient-leaf px-6 py-16">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-10 shadow-elegant text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
            <div className="mt-4 text-xs uppercase tracking-[0.3em] text-gold font-semibold">Registration Success</div>
            <h1 className="mt-3 font-serif text-2xl text-primary">Your User ID</h1>
            <div className="mt-2 font-serif text-4xl font-bold text-primary tracking-wide">{success.memberCode}</div>

            <div className="mt-8 rounded-2xl border border-border bg-muted/40 p-5 text-left text-sm space-y-2">
              <Row label="Login Mobile" value={success.mobile} />
              <Row label="Password" value={success.password} />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Take a screenshot of this screen. Login with your mobile number and this password.
            </p>

            <button
              onClick={() => nav({ to: "/dashboard", replace: true })}
              className="mt-6 w-full rounded-full bg-gradient-gold py-3.5 font-semibold text-gold-foreground shadow-gold hover:opacity-90"
            >
              Go to My Dashboard
            </button>
            <button
              onClick={() => navigator.clipboard?.writeText(`User ID: ${success.memberCode}\nMobile: ${success.mobile}\nPassword: ${success.password}`)}
              className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:text-primary-glow"
            >
              <Copy className="h-4 w-4" /> Copy details
            </button>
          </div>
        </section>
      </SiteLayout>
    );
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
              Register with your sponsor's ID. Your mobile number becomes your login ID.
            </p>
          </div>
          <form className="mt-8 space-y-4" onSubmit={submit}>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full Name" value={form.full_name} onChange={(v) => up("full_name", v)} />
              <Field
                label="Mobile Number (Login ID)"
                type="tel"
                value={form.mobile}
                onChange={(v) => up("mobile", v.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit mobile"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Email" type="email" value={form.email} onChange={(v) => up("email", v)} />
              <Field label="Date of Birth" type="date" value={form.dob} onChange={(v) => up("dob", v)} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field
                label="Sponsor ID"
                value={form.sponsor_code}
                onChange={(v) => up("sponsor_code", v.toUpperCase())}
                placeholder="e.g. RSABC123"
                required={false}
              />
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-primary">{value}</span>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder, required = true,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean; }) {
  if (type === "password") {
    return (
      <label className="block text-sm font-medium">
        {label}
        <PasswordInput value={value} onChange={onChange} required={required} placeholder={placeholder} autoComplete="new-password" />
      </label>
    );
  }
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
