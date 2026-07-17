import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import logoAsset from "@/assets/logo.png.asset.json";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Member Login — Righwedh Sanjivni" },
      { name: "description", content: "Righwedh Sanjivni member portal login. Access your dashboard, wallet, tree and reports." },
    ],
  }),
  component: Login,
});

function Login() {
  return (
    <SiteLayout>
      <section className="min-h-[80vh] flex items-center justify-center bg-gradient-leaf px-6 py-16">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-10 shadow-elegant">
          <div className="flex flex-col items-center">
            <img src={logoAsset.url} alt="Logo" className="h-20 w-20 object-contain" />
            <h1 className="mt-4 font-serif text-3xl text-primary">Member Login</h1>
            <p className="mt-1 text-sm text-muted-foreground">Welcome back to Righwedh Sanjivni</p>
          </div>
          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Login system agle phase mein activate hoga.");
            }}
          >
            <label className="block text-sm font-medium">
              Member ID / Email
              <input type="text" required className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-ring" />
            </label>
            <label className="block text-sm font-medium">
              Password
              <input type="password" required className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-ring" />
            </label>
            <button className="w-full rounded-full bg-gradient-gold py-3.5 font-semibold text-gold-foreground shadow-gold hover:opacity-90">
              Login
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Naye member? <Link to="/register" className="text-primary font-semibold hover:text-primary-glow">Sponsor link se register karein</Link>
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
