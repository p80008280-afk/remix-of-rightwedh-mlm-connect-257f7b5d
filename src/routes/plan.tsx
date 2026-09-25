import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Users, DollarSign, TrendingUp, Trophy, Plus, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Business Plan — Righvedh Sanjivni Binary MLM" },
      { name: "description", content: "The Righvedh Sanjivni binary MLM plan — direct sale commission, pair matching bonus, level income and rank rewards. Simple and fair." },
      { property: "og:title", content: "Business Plan — Righvedh Sanjivni" },
      { property: "og:description", content: "Fair binary plan: direct + pair + rank income." },
      { property: "og:url", content: "https://righvedhsanjivni.in/plan" },
    ],
    links: [{ rel: "canonical", href: "https://righvedhsanjivni.in/plan" }],
  }),
  component: Plan,
});

function Plan() {
  return (
    <SiteLayout>
      <section className="bg-gradient-hero text-primary-foreground py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Business Plan</div>
          <h1 className="mt-4 font-serif text-5xl md:text-6xl">Righvedh Binary Plan</h1>
          <p className="mt-6 text-primary-foreground/80 max-w-2xl mx-auto">
            A simple binary structure — two legs (Left & Right). Earn a direct commission on every
            sale and a pair bonus on every match. Grow your team at your own pace.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4 max-w-xl mx-auto">
            <PlanStat label="Product MRP" value="₹ 3,250" />
            <PlanStat label="Direct Commission" value="₹ 500" gold />
            <PlanStat label="Pair Match" value="₹ 500" gold />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">How It Works</div>
          <h2 className="mt-3 font-serif text-4xl text-primary">A simple example — A, B and C</h2>
        </div>

        <div className="mt-14 grid lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-3xl border border-border bg-card p-10 shadow-elegant">
            <TreeDemo />
          </div>
          <ol className="space-y-5">
            {[
              { s: "Step 1", t: "You are A", d: "You register using your sponsor's referral link." },
              { s: "Step 2", t: "Add B and C", d: "You place B on your left and C on your right — both are your directs." },
              { s: "Step 3", t: "Direct Commission", d: "Whenever B makes a purchase, A earns ₹500. Whenever C makes a purchase, A earns ₹500." },
              { s: "Step 4", t: "Pair Bonus", d: "When the BV of B and C matches, A earns a pair matching bonus of ₹500." },
              { s: "Step 5", t: "The chain grows", d: "B and C build their own teams below them — their pairs count for their upline, and the chain grows to infinite depth." },
              { s: "Step 6", t: "The \"+\" option", d: "Every member sees a + button on their tree — invite a new member into any empty left/right position at any time." },
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
            <h2 className="mt-3 font-serif text-4xl text-primary">Four ways to earn</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: DollarSign, t: "Direct Sale Income", d: "Earn ₹500 fixed commission for every product purchase made by your direct member." },
              { icon: Users, t: "Pair Matching Bonus", d: "Earn ₹500 every time your Left and Right legs form a matched pair in BV." },
              { icon: TrendingUp, t: "Level Income", d: "A small % commission from the generations below you — deep-team rewards." },
              { icon: Trophy, t: "Rank & Reward Bonus", d: "Silver, Gold and Diamond ranks unlock travel, gifts and cash rewards." },
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

      {/* PLAN RULES */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Plan Terms & Rules</div>
          <h2 className="mt-3 font-serif text-4xl text-primary">Fair, transparent, capped</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { t: "Joining Fee", d: "₹3,250 — one time via Ayurvedic product purchase." },
            { t: "Direct Sale Commission", d: "₹500 fixed on every direct member's purchase." },
            { t: "Pair Matching Bonus", d: "₹500 per matched pair (1 Left + 1 Right)." },
            { t: "Daily Capping", d: "Maximum 20 pairs per day, per member. Extra pairs carry no bonus." },
            { t: "Monthly Repurchase", d: "1 product repurchase per month is compulsory to keep the ID active and eligible for pair income." },
            { t: "Withdrawal", d: "Minimum ₹300 • 5% TDS deducted • 0 admin charge • paid within 7 days of admin approval." },
            { t: "Refund / Return", d: "15 days from purchase — only if the pair-matching income has not yet been distributed on your order." },
            { t: "Product Exchange", d: "Product exchange is allowed within the same 15-day window." },
            { t: "Rewards", d: "Level Income, Rank Rewards and Leadership Bonuses will be updated in future releases." },
          ].map((r) => (
            <div key={r.t} className="rounded-2xl bg-card border border-border p-6 shadow-soft">
              <div className="text-xs uppercase tracking-widest text-gold font-semibold">{r.t}</div>
              <div className="mt-2 text-sm text-primary leading-relaxed">{r.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="font-serif text-4xl text-primary">Ready to build your team?</h2>
        <p className="mt-3 text-muted-foreground">Ask your sponsor for their referral link to get started.</p>
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

function PlanStat({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className={`rounded-xl px-3 py-4 border ${gold ? "bg-gradient-gold border-gold/40 text-gold-foreground shadow-gold" : "bg-primary-foreground/10 border-primary-foreground/20"}`}>
      <div className={`text-[10px] uppercase tracking-widest font-semibold ${gold ? "text-gold-foreground/80" : "text-primary-foreground/70"}`}>{label}</div>
      <div className="mt-1 font-bold text-xl">{value}</div>
    </div>
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
        Tap the <b>+</b> on any circle to invite a new member into that position.
      </div>
    </div>
  );
}
