import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Leaf, Award } from "lucide-react";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products — Righwedh Sanjivni Ayurveda Range" },
      { name: "description", content: "Righwedh Sanjivni ke shuddh Ayurvedic products — immunity, detox, wellness, energy. Har product par BV commission." },
      { property: "og:title", content: "Products — Righwedh Sanjivni" },
      { property: "og:description", content: "Premium Ayurveda products with business volume rewards." },
    ],
  }),
  component: Products,
});

const CATALOG = [
  { n: "Sanjivni Immunity Booster", cat: "Immunity", p: 799, bv: 40, d: "Giloy, Ashwagandha & Tulsi ka shakti sansaar." },
  { n: "Ayur Detox Green Blend", cat: "Detox", p: 649, bv: 32, d: "Rozana subah ke liye herbal detox drink." },
  { n: "Ojas Wellness Tonic", cat: "Wellness", p: 1199, bv: 60, d: "Sampoorna energy aur vitality ke liye." },
  { n: "Chyawan Gold Rasayan", cat: "Immunity", p: 899, bv: 45, d: "Traditional Chyawanprash with saffron." },
  { n: "Shudh Triphala Churna", cat: "Digestion", p: 349, bv: 18, d: "Pachan tantra ke liye shuddh triphala." },
  { n: "Kesh Amrit Hair Oil", cat: "Beauty", p: 549, bv: 28, d: "Bhringraj aur Amla ka poshak tel." },
  { n: "Joint Care Balm", cat: "Pain Relief", p: 299, bv: 15, d: "Nirgundi & Mahanarayan taila blend." },
  { n: "Nari Shakti Tonic", cat: "Women", p: 999, bv: 50, d: "Mahilaon ke liye Shatavari-based tonic." },
  { n: "Aloe Neem Face Wash", cat: "Beauty", p: 249, bv: 12, d: "Aloe vera aur neem ka daily glow." },
];

function Products() {
  return (
    <SiteLayout>
      <section className="bg-gradient-hero text-primary-foreground py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Our Range</div>
          <h1 className="mt-4 font-serif text-5xl md:text-6xl">Ayurveda Products</h1>
          <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
            Har product ke saath jude BV points — jinse aapki income calculate hoti hai.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATALOG.map((p) => (
            <div key={p.n} className="group rounded-2xl border border-border bg-card overflow-hidden shadow-soft hover:shadow-elegant transition">
              <div className="aspect-[4/3] bg-gradient-leaf flex items-center justify-center relative">
                <Leaf className="h-24 w-24 text-primary/40 group-hover:scale-110 transition" />
                <div className="absolute top-4 left-4 rounded-full bg-background/90 backdrop-blur text-xs px-3 py-1 font-medium text-primary">
                  {p.cat}
                </div>
                <div className="absolute top-4 right-4 rounded-full bg-primary text-primary-foreground text-xs px-3 py-1 font-semibold">
                  BV {p.bv}
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-serif text-lg text-primary">{p.n}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{p.d}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="font-bold text-xl text-primary">₹ {p.p.toLocaleString("en-IN")}</div>
                  <Award className="h-5 w-5 text-gold" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          * Ordering & wallet checkout member dashboard mein activate hoga.
        </p>
      </section>
    </SiteLayout>
  );
}
