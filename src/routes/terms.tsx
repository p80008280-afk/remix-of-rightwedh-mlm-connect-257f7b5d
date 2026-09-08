import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Righvedh Sanjivni" },
      { name: "description", content: "The terms and conditions that govern membership, purchases and commissions on Righvedh Sanjivni." },
      { property: "og:title", content: "Terms & Conditions — Righvedh Sanjivni" },
      { property: "og:description", content: "Membership, purchase and commission terms." },
      { property: "og:url", content: "https://righvedhsanjivni.in/terms" },
    ],
    links: [{ rel: "canonical", href: "https://righvedhsanjivni.in/terms" }],
  }),
  component: Terms,
});

function Terms() {
  return (
    <SiteLayout>
      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Legal</div>
          <h1 className="mt-3 font-serif text-5xl">Terms & Conditions</h1>
          <p className="mt-4 text-primary-foreground/80">Please read carefully before joining or purchasing.</p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-6 py-16 space-y-8 text-[15px] leading-relaxed text-primary">
        <Block title="1. Acceptance">
          By registering as a member, purchasing a product or using this website, you agree to these Terms & Conditions and to our Privacy Policy, Refund Policy and Income Disclaimer.
        </Block>
        <Block title="2. Membership">
          Membership requires a one-time joining product purchase of ₹3,250. Every member is placed in a binary tree structure (Left / Right leg) under the sponsor who invited them.
        </Block>
        <Block title="3. Commissions & Income">
          Members earn a ₹900 direct commission on every direct member's product purchase and a ₹300 pair-matching bonus for each matched pair (subject to a daily cap of 20 pairs per member). Level income, rank rewards and leadership bonuses may be introduced in future updates.
        </Block>
        <Block title="4. Monthly Repurchase">
          To remain active and eligible for pair matching income, every member must purchase at least one product per month.
        </Block>
        <Block title="5. Withdrawals">
          Minimum withdrawal is ₹300. A 5% TDS is deducted from every withdrawal. Approved withdrawals are paid to the member's registered UPI within 7 days.
        </Block>
        <Block title="6. Product Return & Exchange">
          Products may be returned or exchanged within 15 days of purchase — provided the pair-matching income for that order has not yet been distributed. Once income is distributed the order is final.
        </Block>
        <Block title="7. Prohibited Conduct">
          Fake registrations, fraudulent payments, misleading claims about income, and misuse of the referral system may result in account suspension and forfeiture of pending income.
        </Block>
        <Block title="8. Modifications">
          Righvedh Sanjivni reserves the right to update these terms, product prices, commission structures and rewards at any time. Continued use of the platform after changes indicates acceptance.
        </Block>
        <Block title="9. Contact">
          For any query please write to <a className="text-primary underline" href="mailto:righvedhsanjivni@gmail.com">righvedhsanjivni@gmail.com</a> or call +91 86199 90944.
        </Block>
        <p className="text-xs text-muted-foreground pt-4 border-t border-border">A downloadable PDF version of these terms will be provided by the company on request.</p>
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
