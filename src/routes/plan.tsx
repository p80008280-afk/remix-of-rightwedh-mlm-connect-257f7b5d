import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Users, DollarSign, TrendingUp, Trophy, Plus, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Business Plan — Righwedh Sanjivni Binary MLM" },
      { name: "description", content: "Righwedh Sanjivni ka binary MLM plan — direct sale commission, pair matching bonus, level income aur rank rewards. Simple aur fair." },
      { property: "og:title", content: "Business Plan — Righwedh Sanjivni" },
      { property: "og:description", content: "Fair binary plan: direct + pair + rank income." },
    ],
  }),
  component: Plan,
});

function Plan() {
  return (
    <SiteLayout>
      <section className="bg-gradient-hero text-primary-foreground py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Business Plan</div>
          <h1 className="mt-4 font-serif text-5xl md:text-6xl">Righwedh Binary Plan</h1>
          <p className="mt-6 text-primary-foreground/80 max-w-2xl mx-auto">
            Ek simple binary structure — do legs (Left & Right). Har sale par direct commission,
            aur har match par pair bonus. Team apni marzi se badhaayein.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">How It Works</div>
          <h2 className="mt-3 font-serif text-4xl text-primary">Simple example — A, B aur C</h2>
        </div>

        <div className="mt-14 grid lg:grid-cols-2 gap-12 items-center">
          {/* Tree */}
          <div className="rounded-3xl border border-border bg-card p-10 shadow-elegant">
            <TreeDemo />
          </div>
          {/* Steps */}
          <ol className="space-y-5">
            {[
              { s: "Step 1", t: "Aap = A", d: "Aap register karte hain sponsor ke referral link se." },
              { s: "Step 2", t: "B aur C jodo", d: "Aap apne left par B aur right par C ko join karte hain — dono aapke direct." },
              { s: "Step 3", t: "Direct Commission", d: "Jab B kuch bhi purchase karta hai — A ko direct commission. Jab C purchase karta hai — A ko commission." },
              { s: "Step 4", t: "Pair Bonus", d: "Jab B aur C dono ka BV match hota hai — A ko pair matching bonus milta hai." },
              { s: "Step 5", t: "Neeche wali line", d: "B aur C bhi apne neeche apni team banate hain — unka pair unke upar chalta hai, aur infinite depth tak chain badhti hai." },
              { s: "Step 6", t: "\"+\" Option", d: "Har member ke tree me + button — kabhi bhi apni left/right empty position par naya member invite karein." },
            ].map((s, i) => (
              <li key={i} className="relative rounded-2xl border border-border bg-card p-6 pl-16 shadow-soft">
                <div className="absolute left-4 top-6 h-10 w-10 rounded-full bg-gradient-gold flex items-center justify-center text-gold-foreground font-serif font-bold text-lg shadow-gold">
                  {i + 1}
                </div>
                <div className="text-xs uppercase tracking-widest text-gold font-semibold">{s.s}</div>
                <div className="font-serif text-xl text-primary mt-1">{s.t}</div>
                <div className="mt-1 text-sm text-muted-foreground leading-relaxed">{s.d}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* INCOME TYPES */}
      <section className="bg-gradient-leaf py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Income Streams</div>
            <h2 className="mt-3 font-serif text-4xl text-primary">4 tarah ki income</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: DollarSign, t: "Direct Sale Income", d: "Har direct member ke purchase par fixed % commission aapke wallet mein." },
              { icon: Users, t: "Pair Matching Bonus", d: "Left aur Right leg ka BV match hone par upar wale ko pair bonus." },
              { icon: TrendingUp, t: "Level Income", d: "Neeche ki generations par bhi small % commission — deep team rewards." },
              { icon: Trophy, t: "Rank & Reward Bonus", d: "Silver, Gold, Diamond ranks — travel, gifts aur cash rewards." },
            ].map((f) => (
              <div key={f.t} className="rounded-2xl bg-card p-8 shadow-soft border border-border">
                <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center">
                  <f.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="mt-5 font-serif text-xl text-primary">{f.t}</div>
                <div className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="font-serif text-4xl text-primary">Ready to build your team?</h2>
        <p className="mt-3 text-muted-foreground">Register hone ke liye apne sponsor se referral link maangein.</p>
        <Link
          to="/register"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-gold px-8 py-4 text-base font-semibold text-gold-foreground shadow-gold hover:opacity-90"
        >
          Join Now <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </SiteLayout>
  );
}

function Node({ label, tone = "primary", plus }: { label: string; tone?: "primary" | "gold" | "muted"; plus?: boolean }) {
  const tones = {
    primary: "bg-primary text-primary-foreground",
    gold: "bg-gradient-gold text-gold-foreground shadow-gold",
    muted: "bg-muted text-muted-foreground border border-dashed border-border",
  } as const;
  return (
    <div className="relative">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center font-serif text-xl font-bold ${tones[tone]}`}>
        {label}
      </div>
      {plus && (
        <div className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-gold flex items-center justify-center shadow-gold">
          <Plus className="h-4 w-4 text-gold-foreground" />
        </div>
      )}
    </div>
  );
}

function TreeDemo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Node label="A" tone="gold" plus />
      <div className="w-64 flex justify-between">
        <div className="w-px h-6 bg-border" /><div className="w-px h-6 bg-border" />
      </div>
      <div className="w-64 flex justify-between">
        <Node label="B" plus />
        <Node label="C" plus />
      </div>
      <div className="w-full max-w-md grid grid-cols-4 gap-2 mt-4 justify-items-center">
        <Node label="D" tone="muted" />
        <Node label="+" tone="muted" />
        <Node label="F" tone="muted" />
        <Node label="+" tone="muted" />
      </div>
      <div className="mt-4 text-xs text-muted-foreground text-center max-w-sm">
        Har circle par <b>+</b> ka option — us position par naya member invite karein.
      </div>
    </div>
  );
}
