import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Leaf, Heart, Target, Award } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Righwedh Sanjivni" },
      { name: "description", content: "The story of Righwedh Sanjivni — where the tradition of Ayurveda meets a fair business opportunity." },
      { property: "og:title", content: "About Righwedh Sanjivni" },
      { property: "og:description", content: "Ayurvedic tradition meets a modern income opportunity." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <section className="bg-gradient-hero text-primary-foreground py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Our Story</div>
          <h1 className="mt-4 font-serif text-5xl md:text-6xl">About Righwedh Sanjivni</h1>
          <p className="mt-6 text-lg text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Bringing 5,000 years of Ayurvedic wisdom to every home — that is our dream.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Vision</div>
          <h2 className="mt-3 font-serif text-4xl text-primary">Ayurveda in every home, livelihood in every hand.</h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            Righwedh Sanjivni is built on a simple belief: good health and a better livelihood can
            go hand in hand. We operate from Scheme No. 136-A, Indore, MP and are growing our family
            across India.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Every product is certified, every member gets a fair opportunity, and every payout is
            fully transparent.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {[
            { icon: Leaf, t: "Purity", d: "Pure, herb-based formulations." },
            { icon: Heart, t: "Trust", d: "An honest relationship with every member." },
            { icon: Target, t: "Growth", d: "A fair binary plan for everyone." },
            { icon: Award, t: "Excellence", d: "Global standards, Indian roots." },
          ].map((v) => (
            <div key={v.t} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="h-12 w-12 rounded-lg bg-gradient-gold flex items-center justify-center">
                <v.icon className="h-6 w-6 text-gold-foreground" />
              </div>
              <div className="mt-4 font-serif text-xl text-primary">{v.t}</div>
              <div className="mt-1 text-sm text-muted-foreground">{v.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-leaf py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Reach Us</div>
          <h2 className="mt-3 font-serif text-4xl text-primary">Righwedh Sanjivni</h2>
          <p className="mt-4 text-muted-foreground">Scheme No. 136-A, Indore, MP, India</p>
          <a href="mailto:righvedhsanjivni@gmail.com" className="mt-2 inline-block text-primary font-semibold hover:text-primary-glow">
            righvedhsanjivni@gmail.com
          </a>
        </div>
      </section>
    </SiteLayout>
  );
}
