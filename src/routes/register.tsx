import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import logoAsset from "@/assets/logo.png.asset.json";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Join Righwedh Sanjivni — Register" },
      { name: "description", content: "Righwedh Sanjivni family ka hissa banein. Apne sponsor ke referral link se register karein aur Ayurveda business shuru karein." },
    ],
  }),
  component: Register,
});

function Register() {
  return (
    <SiteLayout>
      <section className="min-h-[80vh] flex items-center justify-center bg-gradient-leaf px-6 py-16">
        <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-10 shadow-elegant">
          <div className="flex flex-col items-center">
            <img src={logoAsset.url} alt="Logo" className="h-20 w-20 object-contain" />
            <h1 className="mt-4 font-serif text-3xl text-primary">Join Our Family</h1>
            <p className="mt-1 text-sm text-muted-foreground text-center">
              Sponsor ke referral link se register karein.
            </p>
          </div>
          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Registration system agle phase mein activate hoga.");
            }}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full Name" name="name" />
              <Field label="Sponsor ID" name="sponsor" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Phone" name="phone" type="tel" />
              <Field label="Email" name="email" type="email" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Position" name="position" placeholder="Left or Right" />
              <Field label="Password" name="password" type="password" />
            </div>
            <button className="w-full rounded-full bg-gradient-gold py-3.5 font-semibold text-gold-foreground shadow-gold hover:opacity-90">
              Register
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already a member? <Link to="/login" className="text-primary font-semibold hover:text-primary-glow">Login</Link>
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ label, name, type = "text", placeholder }: { label: string; name: string; type?: string; placeholder?: string }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required
        className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}
