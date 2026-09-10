import { PasswordInput } from "@/components/ui/password-input";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout } from "@/components/site/SiteLayout";
import { resetMemberPassword } from "@/lib/mlm.functions";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — Righvedh Sanjivni" },
      { name: "description", content: "Reset your Righvedh Sanjivni member account password using your registered mobile number, email and date of birth." },
      { property: "og:title", content: "Reset Password — Righvedh Sanjivni" },
      { property: "og:description", content: "Recover access to your Righvedh Sanjivni member account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: "https://righvedhsanjivni.in/forgot-password" },
    ],
    links: [{ rel: "canonical", href: "https://righvedhsanjivni.in/forgot-password" }],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const nav = useNavigate();
  const reset = useServerFn(resetMemberPassword);
  const [f, setF] = useState({ mobile: "", email: "", dob: "", newPassword: "", confirm: "" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setMsg("");
    if (f.newPassword !== f.confirm) { setError("Both passwords must match."); return; }
    setBusy(true);
    try {
      await reset({ data: { mobile: f.mobile.trim(), email: f.email, dob: f.dob, newPassword: f.newPassword } });
      setMsg("Password updated. You can login now with your mobile number and new password.");
      setTimeout(() => { void nav({ to: "/login" }); }, 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset the password.");
    } finally { setBusy(false); }
  }

  return (
    <SiteLayout>
      <section className="min-h-[80vh] flex items-center justify-center bg-gradient-leaf px-6 py-16">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-10 shadow-elegant">
          <h1 className="font-serif text-3xl text-primary text-center">Forgot Password</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Verify the details you gave at registration to set a new password.
          </p>
          <form className="mt-8 space-y-4" onSubmit={submit}>
            <Field label="Registered Mobile Number" value={f.mobile} onChange={(v) => setF({ ...f, mobile: v })} placeholder="10-digit mobile" />
            <Field label="Registered Email" type="email" value={f.email} onChange={(v) => setF({ ...f, email: v })} />
            <Field label="Date of Birth" type="date" value={f.dob} onChange={(v) => setF({ ...f, dob: v })} />
            <Field label="New Password" type="password" value={f.newPassword} onChange={(v) => setF({ ...f, newPassword: v })} />
            <Field label="Confirm New Password" type="password" value={f.confirm} onChange={(v) => setF({ ...f, confirm: v })} />
            {error && <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3">{error}</div>}
            {msg && <div className="rounded-lg bg-primary/10 text-primary text-sm p-3">{msg}</div>}
            <button type="submit" disabled={busy || !ready} className="w-full rounded-full bg-gradient-gold py-3.5 font-semibold text-gold-foreground shadow-gold disabled:opacity-60">
              {busy ? "Updating..." : !ready ? "Please wait..." : "Reset Password"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remembered it? <Link to="/login" className="text-primary hover:underline">Back to login</Link>
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  if (type === "password") {
    return (
      <label className="block text-sm font-medium">
        {label}
        <PasswordInput value={value} onChange={onChange} placeholder={placeholder} autoComplete="new-password" />
      </label>
    );
  }
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        type={type}
        required
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}
