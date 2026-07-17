import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logoAsset from "@/assets/logo.png.asset.json";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/products", label: "Products" },
  { to: "/plan", label: "Business Plan" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-background/85 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-3 group">
          <img src={logoAsset.url} alt="Righwedh Sanjivni logo" className="h-14 w-14 object-contain" />
          <div className="hidden sm:block leading-tight">
            <div className="font-serif text-lg font-bold text-primary">Righwedh Sanjivni</div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-gold">Ayurveda · Wellness</div>
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
          <Link
            to="/login"
            className="text-sm font-medium text-primary hover:text-primary-glow"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-semibold text-gold-foreground shadow-gold hover:opacity-90 transition"
          >
            Join Now
          </Link>
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
              <Link to="/login" className="flex-1 text-center py-2 rounded-full border border-primary text-primary">
                Login
              </Link>
              <Link to="/register" className="flex-1 text-center py-2 rounded-full bg-gradient-gold text-gold-foreground">
                Join
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
