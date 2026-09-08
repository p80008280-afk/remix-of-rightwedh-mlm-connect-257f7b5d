import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Menu, X, Leaf } from "lucide-react";
const logoAsset = { url: "/logo.png" };

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/products", label: "Products" },
  { to: "/plan", label: "Business Plan" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [dashboardPath, setDashboardPath] = useState<"/dashboard" | "/admin">("/dashboard");
  useEffect(() => {
    async function syncSession(userId?: string) {
      setAuthed(Boolean(userId));
      if (!userId) {
        setDashboardPath("/dashboard");
        return;
      }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
      setDashboardPath(roles?.some((role) => role.role === "admin") ? "/admin" : "/dashboard");
    }
    supabase.auth.getUser().then(({ data }) => syncSession(data.user?.id));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => { void syncSession(session?.user.id); });
    return () => sub.subscription.unsubscribe();
  }, []);
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/90 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative h-14 w-14 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-soft ring-2 ring-gold/50">
            <img src={logoAsset.url} alt="Righvedh Sanjivni" className="h-full w-full object-cover" />
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="font-serif text-lg font-bold text-primary tracking-tight">Righvedh Sanjivni</div>
            <div className="flex items-center gap-1.5 text-[10px] tracking-[0.28em] uppercase text-gold font-semibold">
              <Leaf className="h-2.5 w-2.5" /> Pure Ayurveda
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              activeProps={{ className: "text-primary" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {authed ? (
            <Link to={dashboardPath} className="inline-flex items-center rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-semibold text-gold-foreground shadow-gold hover:opacity-90 transition">
              {dashboardPath === "/admin" ? "Admin Panel" : "My Dashboard"}
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-primary hover:text-primary-glow">Login</Link>
              <Link to="/register" className="inline-flex items-center rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-semibold text-gold-foreground shadow-gold hover:opacity-90 transition">
                Join Now
              </Link>
            </>
          )}
        </div>

        <button className="lg:hidden p-2" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/60 bg-background">
          <div className="px-6 py-4 flex flex-col gap-3">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="py-2 text-foreground/80" onClick={() => setOpen(false)}>
                {n.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-2">
              {authed ? (
                <Link to={dashboardPath} className="flex-1 text-center py-2 rounded-full bg-gradient-gold text-gold-foreground" onClick={() => setOpen(false)}>
                  {dashboardPath === "/admin" ? "Admin Panel" : "My Dashboard"}
                </Link>
              ) : (
                <>
                  <Link to="/login" className="flex-1 text-center py-2 rounded-full border border-primary text-primary" onClick={() => setOpen(false)}>Login</Link>
                  <Link to="/register" className="flex-1 text-center py-2 rounded-full bg-gradient-gold text-gold-foreground" onClick={() => setOpen(false)}>Join</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
