import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Leaf, ShieldCheck, Users, TrendingUp, Award, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import logoAsset from "@/assets/logo.png.asset.json";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="absolute inset-0 opacity-[0.08]" style={{
          backgroundImage: "radial-gradient(circle at 20% 20%, oklch(0.75 0.13 85) 0%, transparent 40%), radial-gradient(circle at 80% 70%, oklch(0.5 0.13 150) 0%, transparent 40%)",
        }} />
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-medium text-gold uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" /> Ayurveda · Wealth · Wellness
            </div>
            <h1 className="mt-6 font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05]">
              Nature ki shakti,<br />
              <span className="text-gold">aapke jeevan mein.</span>
            </h1>
            <p className="mt-6 text-lg text-primary-foreground/80 max-w-xl leading-relaxed">
              Righwedh Sanjivni laata hai shuddh Ayurvedic products aur ek shandaar business
              opportunity — jahan har sale, har pair aapko income aur pehchaan deta hai.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-8 py-4 text-base font-semibold text-gold-foreground shadow-gold hover:opacity-90 transition"
              >
                Join The Family <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/plan"
                className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-8 py-4 text-base font-semibold text-primary-foreground hover:bg-gold/10 transition"
              >
                View Business Plan
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg">
              {[
                { n: "10K+", l: "Members" },
                { n: "50+", l: "Products" },
                { n: "24/7", l: "Support" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-serif text-3xl text-gold font-bold">{s.n}</div>
                  <div className="text-xs uppercase tracking-widest text-primary-foreground/60 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="absolute inset-0 bg-gold/20 blur-3xl rounded-full" />
            <div className="relative bg-background/95 rounded-full p-8 shadow-elegant border-4 border-gold/40">
              <img src={logoAsset.url} alt="Righwedh Sanjivni" className="h-72 w-72 md:h-96 md:w-96 object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Why Righwedh Sanjivni</div>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl text-primary">Ek platform, anek avsar.</h2>
          <p className="mt-4 text-muted-foreground">
            Purity of Ayurveda, transparency of technology, aur ek fair binary income plan — sab kuch ek jagah.
          </p>
        </div>
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Leaf, title: "100% Ayurveda", desc: "Shuddh jadi-bootiyon se banaye gaye premium products." },
            { icon: ShieldCheck, title: "Trusted Quality", desc: "GMP, ISO certified manufacturing standards." },
            { icon: Users, title: "Binary Team Plan", desc: "Left & right leg build karke pair income kamayein." },
            { icon: TrendingUp, title: "Unlimited Growth", desc: "Direct + pair + rank bonus — kamai ki koi seema nahi." },
          ].map((f) => (
            <div key={f.title} className="group relative rounded-2xl border border-border bg-card p-8 shadow-soft hover:shadow-elegant transition">
              <div className="h-14 w-14 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
                <f.icon className="h-7 w-7 text-gold-foreground" />
              </div>
              <h3 className="mt-6 font-serif text-xl text-primary">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLAN TEASER */}
      <section className="bg-gradient-leaf">
        <div className="mx-auto max-w-7xl px-6 py-24 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Business Plan</div>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl text-primary">Simple Binary — Powerful Income.</h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Aap A hain. Aap do log jodte hain — B aur C. Jab bhi B ya C sale karta hai, aapko direct
              commission milta hai. Aur jab B aur C ka pair banta hai, upar wale ko pair bonus milta hai.
              Har member ke paas apna "+" option hai — team apni marzi se badhaein.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Direct sponsor commission on every sale",
                "Pair matching bonus for every left-right match",
                "Level & rank rewards for growing leaders",
                "Real-time genealogy tree with plus-position invites",
              ].map((i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-gold shrink-0" /> <span>{i}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/plan"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary-glow transition"
            >
              Full Plan Explore Karein <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Tree diagram */}
          <div className="relative">
            <div className="rounded-3xl border border-border bg-card p-10 shadow-elegant">
              <BinaryTreePreview />
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT TEASER */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Featured</div>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl text-primary">Premium Ayurveda Range</h2>
          </div>
          <Link to="/products" className="text-primary font-semibold hover:text-primary-glow inline-flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { n: "Sanjivni Immunity Booster", p: "₹ 799", bv: 40 },
            { n: "Ayur Detox Green Blend", p: "₹ 649", bv: 32 },
            { n: "Ojas Wellness Tonic", p: "₹ 1,199", bv: 60 },
          ].map((p) => (
            <div key={p.n} className="group rounded-2xl border border-border bg-card overflow-hidden shadow-soft hover:shadow-elegant transition">
              <div className="aspect-[4/3] bg-gradient-leaf flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gold/5" />
                <Leaf className="h-24 w-24 text-primary/40" />
                <div className="absolute top-4 right-4 rounded-full bg-primary text-primary-foreground text-xs px-3 py-1 font-semibold">
                  BV {p.bv}
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-serif text-lg text-primary">{p.n}</h3>
                <div className="mt-2 flex items-center justify-between">
                  <div className="font-bold text-xl text-primary">{p.p}</div>
                  <Award className="h-5 w-5 text-gold" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-12 md:p-16 text-center text-primary-foreground shadow-elegant">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at center, oklch(0.75 0.13 85) 0%, transparent 60%)" }} />
          <div className="relative">
            <h2 className="font-serif text-4xl md:text-5xl">Apni journey aaj shuru karein.</h2>
            <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
              Sirf sponsor ke referral link se register karke Righwedh Sanjivni family ka hissa banein.
            </p>
            <Link
              to="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-gold px-8 py-4 text-base font-semibold text-gold-foreground shadow-gold hover:opacity-90"
            >
              Register Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function TreePill({ label, tone = "primary" }: { label: string; tone?: "primary" | "gold" }) {
  const cls =
    tone === "gold"
      ? "bg-gradient-gold text-gold-foreground shadow-gold"
      : "bg-primary text-primary-foreground shadow-soft";
  return (
    <div className={`w-16 h-16 rounded-full flex items-center justify-center font-serif text-xl font-bold ${cls}`}>
      {label}
    </div>
  );
}

function BinaryTreePreview() {
  return (
    <div className="flex flex-col items-center gap-6">
      <TreePill label="A" tone="gold" />
      <div className="w-full flex justify-between max-w-xs">
        <div className="w-px h-6 bg-border" />
        <div className="w-px h-6 bg-border" />
      </div>
      <div className="w-full flex justify-between max-w-xs">
        <TreePill label="B" />
        <TreePill label="C" />
      </div>
      <div className="w-full flex justify-between max-w-xs mt-2">
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-3">
            <TreePill label="D" />
            <TreePill label="E" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-3">
            <TreePill label="F" />
            <TreePill label="+" tone="gold" />
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-4 text-center max-w-xs">
        Har node par "+" button — apni left ya right position par naya member add karein.
      </p>
    </div>
  );
}
