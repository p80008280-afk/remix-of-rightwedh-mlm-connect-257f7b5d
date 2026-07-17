import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Mail, Phone, MapPin, Clock, User, Wallet } from "lucide-react";
import qrAsset from "@/assets/phonepe-qr.png.asset.json";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Righwedh Sanjivni" },
      { name: "description", content: "Get in touch with Righwedh Sanjivni — Pratapgarh, Chhoti Sadri. Phone: +91 86199 90944. 24 hour support available." },
      { property: "og:title", content: "Contact Righwedh Sanjivni" },
      { property: "og:description", content: "24 hour Ayurveda & business support." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <SiteLayout>
      <section className="bg-gradient-hero text-primary-foreground py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Contact</div>
          <h1 className="mt-4 font-serif text-5xl md:text-6xl">Get in touch</h1>
          <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
            Product, membership or business enquiry — we're available 24 hours a day.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 grid lg:grid-cols-2 gap-10">
        <div className="space-y-5">
          {[
            { icon: User, t: "Founder", d: "Kartik Tirgar" },
            { icon: Phone, t: "Phone", d: "+91 86199 90944", href: "tel:+918619990944" },
            { icon: Mail, t: "Email", d: "kartik.tirgar14@gmail.com", href: "mailto:kartik.tirgar14@gmail.com" },
            { icon: MapPin, t: "Address", d: "Pratapgarh, Chhoti Sadri, Rajasthan, India" },
            { icon: Clock, t: "Support Hours", d: "24 hours, 7 days a week" },
            { icon: Wallet, t: "UPI ID", d: "kartiktirgar@ybl" },
          ].map((i) => (
            <div key={i.t} className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="h-12 w-12 rounded-lg bg-gradient-gold flex items-center justify-center shrink-0">
                <i.icon className="h-6 w-6 text-gold-foreground" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-gold font-semibold">{i.t}</div>
                {i.href ? (
                  <a href={i.href} className="font-serif text-lg text-primary hover:text-primary-glow">{i.d}</a>
                ) : (
                  <div className="font-serif text-lg text-primary">{i.d}</div>
                )}
              </div>
            </div>
          ))}

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="text-xs uppercase tracking-widest text-gold font-semibold mb-3">PhonePe QR</div>
            <img src={qrAsset.url} alt="PhonePe QR code" className="w-48 rounded-xl mx-auto" />
            <div className="mt-3 text-center text-sm text-muted-foreground">Scan & Pay — KARTIK TIRGAR</div>
          </div>
        </div>

        <form
          className="rounded-3xl border border-border bg-card p-8 shadow-elegant space-y-4 h-fit"
          onSubmit={(e) => {
            e.preventDefault();
            alert("Thank you! We will contact you shortly.");
          }}
        >
          <h2 className="font-serif text-2xl text-primary">Send us a message</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Name" name="name" />
            <Field label="Phone" name="phone" type="tel" />
          </div>
          <Field label="Email" name="email" type="email" />
          <Field label="Message" name="message" textarea />
          <button
            type="submit"
            className="w-full rounded-full bg-gradient-gold py-3.5 font-semibold text-gold-foreground shadow-gold hover:opacity-90"
          >
            Send Message
          </button>
        </form>
      </section>
    </SiteLayout>
  );
}

function Field({ label, name, type = "text", textarea }: { label: string; name: string; type?: string; textarea?: boolean }) {
  const cls =
    "mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
  return (
    <label className="block text-sm font-medium text-foreground">
      {label}
      {textarea ? (
        <textarea name={name} rows={4} className={cls} required />
      ) : (
        <input name={name} type={type} className={cls} required />
      )}
    </label>
  );
}
