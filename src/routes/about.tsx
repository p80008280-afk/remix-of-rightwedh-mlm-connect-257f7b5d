import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Leaf, Heart, Target, Award } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Righwedh Sanjivni" },
      { name: "description", content: "Righwedh Sanjivni ki kahani — Ayurveda ki paramparaa aur ek fair business opportunity ka sangam. Founded by Kartik Tirgar." },
      { property: "og:title", content: "About Righwedh Sanjivni" },
      { property: "og:description", content: "Ayurveda ki paramparaa aur modern MLM opportunity." },
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
            Ayurveda ki 5000 saal purani vidya ko har ghar tak pahuchana — yehi humara sapna hai.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Vision</div>
          <h2 className="mt-3 font-serif text-4xl text-primary">Har ghar Ayurveda, har haath rozgar.</h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            Righwedh Sanjivni ki sthapna Shri <b>Kartik Tirgar</b> ji ne ki, is vishwas ke saath ki
            achhi sehat aur behtar aajivika dono ek saath sambhav hain. Hum Rajasthan ke Pratapgarh,
            Chhoti Sadri se apna kaarya sanchalit karte hain, aur poore Bharat mein apne parivaar
            ko badhate ja rahe hain.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Har product certified hai, har member ko fair opportunity milti hai, aur har payout
            transparent hota hai.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {[
            { icon: Leaf, t: "Purity", d: "Shuddh, jadi-booti aadhaarit formulations." },
            { icon: Heart, t: "Trust", d: "Har member ke saath imandaar rishta." },
            { icon: Target, t: "Growth", d: "Fair binary plan sabke liye." },
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
          <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Founder</div>
          <h2 className="mt-3 font-serif text-4xl text-primary">Kartik Tirgar</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Ayurveda ke prati samarpit aur network marketing mein vishwas rakhne wale Kartik ji ka
            sapna hai — ek aisa manch banana jahan achhi sehat aur achhi income sab ke liye
            sulabh ho.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
