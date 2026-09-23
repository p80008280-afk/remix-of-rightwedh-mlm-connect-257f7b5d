import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Leaf, ShieldCheck, Users, TrendingUp, Award, Sparkles, ArrowRight, CheckCircle2, Star, ShoppingBag, Upload, UserCheck, Smartphone, Download } from "lucide-react";
const capsuleAsset = { url: "/aaurva-capsule.png" };

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Righvedh Sanjivni — Pure Ayurveda & Binary Business Opportunity" },
      { name: "description", content: "Righvedh Sanjivni offers 100% pure Ayurvedic wellness products and a transparent binary MLM plan. Earn direct sale commission and pair matching bonus." },
      { property: "og:title", content: "Righvedh Sanjivni — Ayurveda & Income Opportunity" },
      { property: "og:description", content: "Pure Ayurveda products with a fair binary income plan." },
      { property: "og:url", content: "https://righvedhsanjivni.in/" },
    ],
    links: [{ rel: "canonical", href: "https://righvedhsanjivni.in/" }],
  }),
  component: Home,
});

function Home() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="absolute inset-0 opacity-[0.12]" style={{
          backgroundImage: "radial-gradient(circle at 15% 20%, oklch(0.75 0.13 85) 0%, transparent 45%), radial-gradient(circle at 85% 75%, oklch(0.5 0.13 150) 0%, transparent 45%)",
        }} />
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-28 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-medium text-gold uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" /> Ayurveda · Wealth · Wellness
            </div>
            <h1 className="mt-6 font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05]">
              The power of nature,<br />
              <span className="text-gold">in your life.</span>
            </h1>
            <p className="mt-6 text-lg text-primary-foreground/80 max-w-xl leading-relaxed">
              Righvedh Sanjivni brings you pure Ayurvedic products and a rewarding business
              opportunity — where every sale and every pair builds real income and recognition.
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
            <a
              href="/righvedh-sanjivni.apk"
              download="Righvedh-Sanjivni.apk"
              className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-gold/40 bg-primary-foreground/10 px-5 py-3 hover:bg-gold/10 transition"
            >
              <Smartphone className="h-6 w-6 text-gold" />
              <span className="text-left leading-tight">
                <span className="block text-[11px] uppercase tracking-widest text-primary-foreground/70">Free Android App</span>
                <span className="block text-sm font-semibold">Download APK <Download className="inline h-3.5 w-3.5 ml-1" /></span>
              </span>
            </a>
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg">
              {[
                { n: "₹900", l: "Direct Commission" },
                { n: "₹300", l: "Pair Matching" },
                { n: "24/7", l: "Support" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-serif text-3xl text-gold font-bold">{s.n}</div>
                  <div className="text-xs uppercase tracking-widest text-primary-foreground/60 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* HERO PRODUCT CARD (real product image, no floating logo) */}
          <div className="relative">
            <div className="absolute -inset-6 bg-gold/15 blur-3xl rounded-3xl" />
            <div className="relative rounded-3xl overflow-hidden border border-gold/30 bg-background shadow-elegant">
              <div className="relative aspect-[4/5]">
                <img src={capsuleAsset.url} alt="Aaurva Ayurvedic Weight Natural Power capsule" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute top-4 left-4 rounded-full bg-gold text-gold-foreground text-[11px] px-3 py-1 font-bold shadow-gold">
                  BESTSELLER
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/85 via-black/50 to-transparent text-white">
                  <div className="text-[11px] uppercase tracking-[0.25em] text-gold">Aaurva Capsule</div>
                  <div className="font-serif text-2xl mt-1">Ayurvedic Weight Natural Power</div>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <div className="text-xs text-white/70">MRP</div>
                      <div className="font-bold text-2xl">₹ 3,250</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-white/70">Earn per sale</div>
                      <div className="font-bold text-xl text-gold">₹ 900</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Why Righvedh Sanjivni</div>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl text-primary">One platform, endless opportunity.</h2>
          <p className="mt-4 text-muted-foreground">
            The purity of Ayurveda, the transparency of technology, and a fair binary income plan — all in one place.
          </p>
        </div>
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Leaf, title: "100% Ayurveda", desc: "Premium products made from pure, natural herbs." },
            { icon: ShieldCheck, title: "Trusted Quality", desc: "Manufactured to GMP & ISO certified standards." },
            { icon: Users, title: "Binary Team Plan", desc: "Build left & right legs and earn pair income." },
            { icon: TrendingUp, title: "Unlimited Growth", desc: "Direct + pair + rank bonus — no earning cap." },
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
              You are A. You bring in two people — B and C. Whenever B or C makes a sale, you earn
              a direct commission. And when B and C form a matching pair, you earn a pair bonus.
              Every member has their own "+" option to invite new members into any empty position.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "₹900 direct sponsor commission on every product sale",
                "₹300 pair matching bonus on every left-right match",
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
              Explore The Full Plan <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-border bg-card p-10 shadow-elegant">
              <BinaryTreePreview />
            </div>
          </div>
        </div>
      </section>

      {/* FLAGSHIP PRODUCT */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Flagship Product</div>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl text-primary">Aaurva — Weight Natural Power</h2>
          </div>
          <Link to="/products" className="text-primary font-semibold hover:text-primary-glow inline-flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid lg:grid-cols-2 gap-10 items-center">
          <div className="relative rounded-3xl overflow-hidden border border-border shadow-elegant bg-gradient-leaf">
            <img src={capsuleAsset.url} alt="Aaurva capsule bottle" className="w-full aspect-square object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-1 text-gold">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              <span className="ml-2 text-xs text-muted-foreground">Trusted by 10,000+ customers</span>
            </div>
            <h3 className="mt-4 font-serif text-3xl text-primary">Ayurvedic Weight Natural Power</h3>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              A 100% pure herbal weight gain formula with 10+ powerful Ayurvedic ingredients.
              60 capsules per bottle — crafted for natural strength, stamina and vitality.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <Stat label="MRP" value="₹ 3,250" />
              <Stat label="Direct Commission" value="₹ 900" accent />
              <Stat label="Pair Matching" value="₹ 300" accent />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-glow">
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/plan" className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/5">
                Earning Details
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BUYING FLOW */}
      <section className="bg-gradient-leaf py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Secure Checkout</div>
            <h2 className="mt-3 font-serif text-4xl text-primary">QR appears only during product checkout.</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Members choose a product, pay from the dashboard checkout, upload the payment screenshot, and admin approves it from the Orders tab.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: ShoppingBag, title: "Add to cart", desc: "Member opens dashboard shop and selects the product." },
              { icon: Upload, title: "Pay & upload", desc: "Checkout shows the current admin QR/UPI and asks for payment proof." },
              { icon: UserCheck, title: "Admin approval", desc: "Admin verifies the screenshot, then approves or rejects the order." },
            ].map((step) => (
              <div key={step.title} className="rounded-2xl border border-border bg-card p-7 shadow-soft text-center">
                <div className="mx-auto h-14 w-14 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
                  <step.icon className="h-7 w-7 text-gold-foreground" />
                </div>
                <h3 className="mt-5 font-serif text-xl text-primary">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24 pt-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-12 md:p-16 text-center text-primary-foreground shadow-elegant">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at center, oklch(0.75 0.13 85) 0%, transparent 60%)" }} />
          <div className="relative">
            <h2 className="font-serif text-4xl md:text-5xl">Start your journey today.</h2>
            <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
              Join the Righvedh Sanjivni family through your sponsor's referral link.
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

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl p-4 border ${accent ? "bg-gradient-gold border-gold/40 text-gold-foreground shadow-gold" : "bg-card border-border"}`}>
      <div className={`text-[10px] uppercase tracking-widest font-semibold ${accent ? "text-gold-foreground/80" : "text-muted-foreground"}`}>{label}</div>
      <div className={`mt-1 font-bold text-lg ${accent ? "" : "text-primary"}`}>{value}</div>
    </div>
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
        <div className="flex gap-3">
          <TreePill label="D" />
          <TreePill label="E" />
        </div>
        <div className="flex gap-3">
          <TreePill label="F" />
          <TreePill label="+" tone="gold" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-4 text-center max-w-xs">
        Tap the "+" on any node to invite a new member into that left or right position.
      </p>
    </div>
  );
}
