import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Income Disclaimer — Righvedh Sanjivni" },
      { name: "description", content: "Income earned through Righvedh Sanjivni depends entirely on individual effort. No income is guaranteed." },
      { property: "og:title", content: "Income Disclaimer — Righvedh Sanjivni" },
      { property: "og:description", content: "No income is guaranteed." },
      { property: "og:url", content: "https://righvedhsanjivni.in/disclaimer" },
    ],
    links: [{ rel: "canonical", href: "https://righvedhsanjivni.in/disclaimer" }],
  }),
  component: Disclaimer,
});

function Disclaimer() {
  return (
    <SiteLayout>
      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Legal</div>
          <h1 className="mt-3 font-serif text-5xl">Income Disclaimer</h1>
          <p className="mt-4 text-primary-foreground/80">Effort based. No guaranteed income.</p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-6 py-16 space-y-8 text-[15px] leading-relaxed text-primary">
        <Block title="1. No Guaranteed Income">
          Righvedh Sanjivni is a direct-selling / MLM opportunity. Any income figure or example shown on this website, in printed material, or during training sessions is for illustration only. Actual income depends entirely on the member's own selling effort, team building activity and market conditions.
        </Block>
        <Block title="2. Not an Investment Scheme">
          Righvedh Sanjivni is <b>not</b> a money-circulation, chit-fund, deposit-taking or investment scheme. Income is earned only through genuine product sales and team building. No income is generated merely by signing up or by paying money to the company.
        </Block>
        <Block title="3. Individual Results Vary">
          Some members earn substantially, many earn modest amounts, and some may earn nothing at all. Past results of any individual member are not a guarantee of future performance.
        </Block>
        <Block title="4. Tax Responsibility">
          Members are solely responsible for reporting their MLM income to tax authorities and paying all applicable taxes. Righvedh Sanjivni will deduct 5% TDS on withdrawals as required by law and issue relevant statements.
        </Block>
        <Block title="5. No Employment">
          Membership does not create an employer-employee relationship. Members act as independent distributors.
        </Block>
        <Block title="6. Product Claims">
          Ayurvedic products are traditional wellness supplements, not a substitute for prescribed medical treatment. Consult a qualified physician before use if you are pregnant, on medication, or have a medical condition.
        </Block>
      </article>
    </SiteLayout>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-serif text-xl text-primary mb-2">{title}</h2>
      <p className="text-muted-foreground">{children}</p>
    </div>
  );
}
