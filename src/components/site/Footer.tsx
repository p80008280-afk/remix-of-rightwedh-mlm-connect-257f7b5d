import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Clock, Leaf } from "lucide-react";
import logoAsset from "@/assets/logo.png.asset.json";

export function Footer() {
  return (
    <footer className="mt-24 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-background/10 ring-2 ring-gold/40 flex items-center justify-center">
              <img src={logoAsset.url} alt="Logo" className="h-10 w-10 object-contain" />
            </div>
            <div>
              <div className="font-serif text-lg font-bold">Righwedh Sanjivni</div>
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-gold">
                <Leaf className="h-2.5 w-2.5" /> Pure Ayurveda
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-primary-foreground/70 leading-relaxed">
            Ancient Ayurveda wisdom meets a modern income opportunity. Build health, wealth and a
            trusted community with Righwedh Sanjivni.
          </p>
        </div>

        <div>
          <h4 className="font-serif text-gold text-lg mb-4">Explore</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li><Link to="/about" className="hover:text-gold">About Us</Link></li>
            <li><Link to="/products" className="hover:text-gold">Products</Link></li>
            <li><Link to="/plan" className="hover:text-gold">Business Plan</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-gold text-lg mb-4">Account</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li><Link to="/login" className="hover:text-gold">Member Login</Link></li>
            <li><Link to="/register" className="hover:text-gold">Join Us</Link></li>
            <li><Link to="/admin" className="hover:text-gold">Admin Panel</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-gold text-lg mb-4">Reach Us</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/80">
            <li className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 text-gold shrink-0" /> Pratapgarh, Chhoti Sadri, Rajasthan</li>
            <li className="flex gap-2"><Phone className="h-4 w-4 mt-0.5 text-gold shrink-0" /> +91 86199 90944</li>
            <li className="flex gap-2"><Mail className="h-4 w-4 mt-0.5 text-gold shrink-0" /> kartik.tirgar14@gmail.com</li>
            <li className="flex gap-2"><Clock className="h-4 w-4 mt-0.5 text-gold shrink-0" /> Support: 24 hours</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto max-w-7xl px-6 py-5 text-xs text-primary-foreground/60 flex flex-col md:flex-row justify-between gap-2">
          <div>© {new Date().getFullYear()} Righwedh Sanjivni. All rights reserved.</div>
          <div>Founder: Kartik Tirgar</div>
        </div>
      </div>
    </footer>
  );
}
