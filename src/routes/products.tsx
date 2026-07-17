import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Leaf, Award, Star, ShieldCheck } from "lucide-react";
import capsuleAsset from "@/assets/aaurva-capsule.png.asset.json";
import qrAsset from "@/assets/phonepe-qr.png.asset.json";

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

function Products() {
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
            <img src={capsuleAsset.url} alt="Aaurva Ayurvedic Weight Natural Power" className="w-full aspect-square object-cover" />
            <div className="absolute top-4 left-4 rounded-full bg-gold text-gold-foreground text-[11px] px-3 py-1 font-bold shadow-gold">
              BESTSELLER
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Flagship Product</div>
            <h2 className="mt-3 font-serif text-4xl text-primary">Aaurva Capsule</h2>
            <div className="mt-1 text-lg text-muted-foreground">Ayurvedic Weight Natural Power</div>

            <div className="mt-4 flex items-center gap-1 text-gold">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              <span className="ml-2 text-xs text-muted-foreground">4.9 / 5 · 2,300+ reviews</span>
            </div>

            <p className="mt-5 text-muted-foreground leading-relaxed">
              A herbal weight gain formula crafted with 10+ powerful Ayurvedic ingredients. Each
              bottle contains 60 capsules of pure, natural strength — designed to support stamina,
              muscle mass and overall vitality.
            </p>

            <ul className="mt-5 grid sm:grid-cols-2 gap-3 text-sm">
              {[
                "100% pure & natural formula",
                "10+ powerful herbal ingredients",
                "60 capsules per bottle",
                "GMP certified manufacturing",
              ].map((i) => (
                <li key={i} className="flex gap-2 text-muted-foreground">
                  <Leaf className="h-4 w-4 text-primary shrink-0 mt-0.5" /> {i}
                </li>
              ))}
            </ul>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <PriceBox label="MRP" value="₹ 3,250" />
              <PriceBox label="Direct Commission" value="₹ 900" gold />
              <PriceBox label="Pair Matching" value="₹ 300" gold />
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-widest text-gold font-semibold">To Order</div>
              <div className="mt-2 text-sm text-muted-foreground">
                Pay <b>₹ 3,250</b> to UPI ID <span className="text-primary font-semibold select-all">kartiktirgar@ybl</span> or scan the QR below,
                then share the payment screenshot on WhatsApp <a className="text-primary font-semibold" href="tel:+918619990944">+91 86199 90944</a> along with your Member ID and delivery address.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coming soon range */}
      <section className="bg-gradient-leaf py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Coming Soon</div>
            <h2 className="mt-3 font-serif text-4xl text-primary">More products on the way</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Our Ayurvedic range is expanding. New products will be launched here — full details will be
              added once shared by the company.
            </p>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {["Immunity", "Detox", "Wellness", "Hair Care", "Skin Care", "Joint Care"].map((cat) => (
              <div key={cat} className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center">
                <ShieldCheck className="h-10 w-10 text-gold mx-auto" />
                <div className="mt-3 font-serif text-xl text-primary">{cat}</div>
                <div className="mt-1 text-xs text-muted-foreground">Launching soon</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QR block */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="rounded-3xl border border-border bg-card p-10 shadow-elegant flex flex-col md:flex-row gap-8 items-center">
          <img src={qrAsset.url} alt="PhonePe QR" className="w-56 rounded-2xl" />
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Payment</div>
            <h3 className="mt-2 font-serif text-3xl text-primary">Scan & Pay</h3>
            <p className="mt-2 text-muted-foreground">Use PhonePe, Google Pay, Paytm or any UPI app to place your order instantly.</p>
            <div className="mt-4 rounded-xl bg-background border border-border px-4 py-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">UPI ID</div>
              <div className="font-serif text-xl text-primary select-all">kartiktirgar@ybl</div>
            </div>
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
