import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Leaf, Star, ShieldCheck, ShoppingBag } from "lucide-react";
import capsuleAsset from "@/assets/aaurva-capsule.png.asset.json";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products — Righwedh Sanjivni Ayurveda Range" },
      { name: "description", content: "Pure Ayurvedic products by Righwedh Sanjivni — Aaurva capsule, immunity, detox and wellness. Every product earns you commission." },
      { property: "og:title", content: "Products — Righwedh Sanjivni" },
      { property: "og:description", content: "Premium Ayurveda products with business volume rewards." },
    ],
  }),
  component: Products,
});

type Product = {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  description: string;
  ingredients: string[];
  benefits: string[];
  mrp: number;
  direct: number;
  pair: number;
  rating: number;
  reviews: number;
  badge?: string;
};

const PRODUCTS: Product[] = [
  {
    slug: "aaurva-capsule",
    name: "Aaurva Capsule",
    tagline: "Ayurvedic Weight & Natural Power",
    category: "Wellness",
    description:
      "A herbal weight-gain and strength formula crafted with 10+ powerful Ayurvedic herbs. Supports healthy weight, stamina, muscle mass and overall vitality — safe for daily use with no known side effects.",
    ingredients: ["Ashwagandha", "Shatavari", "Safed Musli", "Kaunch Beej", "Vidarikand", "Gokshura", "Shilajit", "Amla", "Giloy", "Yashtimadhu"],
    benefits: ["Healthy weight gain", "Boosts stamina & strength", "Improves appetite", "Supports muscle growth", "100% Ayurvedic formula", "GMP certified"],
    mrp: 3250,
    direct: 900,
    pair: 300,
    rating: 4.9,
    reviews: 2314,
    badge: "BESTSELLER",
  },
  {
    slug: "immuno-shakti",
    name: "Immuno Shakti Syrup",
    tagline: "Daily Immunity Booster",
    category: "Immunity",
    description:
      "A powerful Ayurvedic tonic combining Giloy, Tulsi and Amla to strengthen the body's natural defence system. Ideal for the whole family to stay strong through changing seasons.",
    ingredients: ["Giloy", "Tulsi", "Amla", "Ginger", "Honey", "Black Pepper"],
    benefits: ["Boosts immunity", "Fights seasonal infections", "Rich in Vitamin C", "Safe for all ages"],
    mrp: 850,
    direct: 240,
    pair: 80,
    rating: 4.8,
    reviews: 612,
  },
  {
    slug: "detox-plus",
    name: "Detox Plus Churna",
    tagline: "Natural Cleanse & Digestion",
    category: "Detox",
    description:
      "Traditional Ayurvedic churna that gently detoxifies the liver, improves digestion and relieves constipation — helping you feel light, active and refreshed every day.",
    ingredients: ["Triphala", "Sonamukhi", "Saunf", "Ajwain", "Kala Namak", "Mulethi"],
    benefits: ["Cleanses digestive tract", "Relieves constipation", "Supports liver health", "Reduces bloating"],
    mrp: 650,
    direct: 180,
    pair: 60,
    rating: 4.7,
    reviews: 402,
  },
  {
    slug: "kesh-vardhak",
    name: "Kesh Vardhak Hair Oil",
    tagline: "Ayurvedic Hair Growth Oil",
    category: "Hair Care",
    description:
      "A nourishing blend of Bhringraj, Amla and Brahmi that revitalises the scalp, reduces hairfall and promotes thick, shiny, healthy hair naturally.",
    ingredients: ["Bhringraj", "Amla", "Brahmi", "Coconut Oil", "Jatamansi", "Neem"],
    benefits: ["Reduces hairfall", "Prevents premature greying", "Deep scalp nourishment", "Promotes new hair growth"],
    mrp: 550,
    direct: 150,
    pair: 50,
    rating: 4.6,
    reviews: 298,
  },
  {
    slug: "twak-glow",
    name: "Twak Glow Face Cream",
    tagline: "Ayurvedic Radiance Cream",
    category: "Skin Care",
    description:
      "Enriched with Kumkumadi, Saffron and Aloe Vera to brighten skin tone, reduce dark spots and give a natural, healthy Ayurvedic glow.",
    ingredients: ["Kumkumadi Tailam", "Saffron", "Aloe Vera", "Sandalwood", "Manjistha", "Vitamin E"],
    benefits: ["Brightens complexion", "Reduces dark spots", "Anti-ageing", "Deep hydration"],
    mrp: 950,
    direct: 270,
    pair: 90,
    rating: 4.7,
    reviews: 356,
  },
  {
    slug: "joint-relief",
    name: "Joint Relief Oil",
    tagline: "Ayurvedic Pain Relief Oil",
    category: "Joint Care",
    description:
      "A warming Ayurvedic oil with Mahanarayan, Nirgundi and Gandhapura that eases joint pain, muscle stiffness and back pain — perfect for daily massage.",
    ingredients: ["Mahanarayan Tailam", "Nirgundi", "Gandhapura", "Kapoor", "Pudina", "Sesame Oil"],
    benefits: ["Relieves joint pain", "Reduces stiffness", "Improves mobility", "Soothes muscle fatigue"],
    mrp: 720,
    direct: 200,
    pair: 70,
    rating: 4.8,
    reviews: 471,
  },
];

function Products() {
  const hero = PRODUCTS[0];
  const rest = PRODUCTS.slice(1);

  return (
    <SiteLayout>
      <section className="bg-gradient-hero text-primary-foreground py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Our Range</div>
          <h1 className="mt-4 font-serif text-5xl md:text-6xl">Ayurveda Products</h1>
          <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
            Every purchase generates income for you and your team through our fair binary plan.
          </p>
        </div>
      </section>

      {/* FLAGSHIP */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="relative rounded-3xl overflow-hidden border border-border shadow-elegant">
            <img src={capsuleAsset.url} alt={hero.name} className="w-full aspect-square object-cover" />
            {hero.badge && (
              <div className="absolute top-4 left-4 rounded-full bg-gold text-gold-foreground text-[11px] px-3 py-1 font-bold shadow-gold">
                {hero.badge}
              </div>
            )}
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Flagship Product</div>
            <h2 className="mt-3 font-serif text-4xl text-primary">{hero.name}</h2>
            <div className="mt-1 text-lg text-muted-foreground">{hero.tagline}</div>

            <div className="mt-4 flex items-center gap-1 text-gold">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              <span className="ml-2 text-xs text-muted-foreground">{hero.rating} / 5 · {hero.reviews.toLocaleString()}+ reviews</span>
            </div>

            <p className="mt-5 text-muted-foreground leading-relaxed">{hero.description}</p>

            <ul className="mt-5 grid sm:grid-cols-2 gap-3 text-sm">
              {hero.benefits.map((i) => (
                <li key={i} className="flex gap-2 text-muted-foreground">
                  <Leaf className="h-4 w-4 text-primary shrink-0 mt-0.5" /> {i}
                </li>
              ))}
            </ul>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <PriceBox label="MRP" value={`₹ ${hero.mrp.toLocaleString()}`} />
              <PriceBox label="Direct Commission" value={`₹ ${hero.direct}`} gold />
              <PriceBox label="Pair Matching" value={`₹ ${hero.pair}`} gold />
            </div>

            <Link
              to={"/_authenticated/dashboard" as any}
              search={{ tab: "shop" } as any}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-gold px-7 py-3.5 text-sm font-semibold text-gold-foreground shadow-gold hover:opacity-90"
            >
              <ShoppingBag className="h-4 w-4" /> Add to Cart / Buy Now
            </Link>
          </div>
        </div>
      </section>

      {/* Full range */}
      <section className="bg-gradient-leaf py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Complete Range</div>
            <h2 className="mt-3 font-serif text-4xl text-primary">All Ayurveda Products</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Each product carries its own Direct Sale Commission and Pair Matching bonus. Sell any product, earn on every order.
            </p>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((p) => (
              <div key={p.slug} className="rounded-2xl border border-border bg-card p-6 shadow-soft flex flex-col">
                <div className="h-40 rounded-xl bg-gradient-to-br from-primary/10 to-gold/20 flex items-center justify-center">
                  <ShieldCheck className="h-14 w-14 text-primary/70" />
                </div>
                <div className="mt-4 text-[10px] uppercase tracking-widest text-gold font-semibold">{p.category}</div>
                <div className="mt-1 font-serif text-xl text-primary">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.tagline}</div>
                <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{p.description}</p>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg border border-border bg-background py-2">
                    <div className="text-[9px] uppercase tracking-widest text-muted-foreground">MRP</div>
                    <div className="text-sm font-bold text-primary">₹{p.mrp}</div>
                  </div>
                  <div className="rounded-lg bg-gradient-gold text-gold-foreground py-2 shadow-gold">
                    <div className="text-[9px] uppercase tracking-widest">Direct</div>
                    <div className="text-sm font-bold">₹{p.direct}</div>
                  </div>
                  <div className="rounded-lg bg-primary text-primary-foreground py-2">
                    <div className="text-[9px] uppercase tracking-widest text-gold">Pair</div>
                    <div className="text-sm font-bold">₹{p.pair}</div>
                  </div>
                </div>
                <Link
                  to={"/_authenticated/dashboard" as any}
                  search={{ tab: "shop" } as any}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-glow"
                >
                  <ShoppingBag className="h-4 w-4" /> Buy Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function PriceBox({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className={`rounded-xl p-3 border text-center ${gold ? "bg-gradient-gold border-gold/40 text-gold-foreground shadow-gold" : "bg-card border-border"}`}>
      <div className={`text-[10px] uppercase tracking-widest font-semibold ${gold ? "text-gold-foreground/80" : "text-muted-foreground"}`}>{label}</div>
      <div className={`mt-1 font-bold text-base ${gold ? "" : "text-primary"}`}>{value}</div>
    </div>
  );
}
