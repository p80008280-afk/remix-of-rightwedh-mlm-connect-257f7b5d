import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: "Refund & Return Policy — Righwedh Sanjivni" },
      { name: "description", content: "15-day product return and exchange window at Righwedh Sanjivni." },
      { property: "og:title", content: "Refund & Return Policy — Righwedh Sanjivni" },
      { property: "og:description", content: "15-day return / exchange window." },
    ],
  }),
  component: Refund,
});

function Refund() {
  return (
    <SiteLayout>
      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Legal</div>
          <h1 className="mt-3 font-serif text-5xl">Refund & Return Policy</h1>
          <p className="mt-4 text-primary-foreground/80">15-day return / exchange window.</p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-6 py-16 space-y-8 text-[15px] leading-relaxed text-primary">
        <Block title="1. 15-Day Window">
          Products purchased on Righwedh Sanjivni may be returned within 15 days from the date of purchase, provided the item is unused, in its original packaging and in re-sellable condition.
        </Block>
        <Block title="2. Income-Distributed Orders Are Final">
          If the pair-matching income or direct commission on your order has already been distributed to the upline, that order is no longer eligible for refund. Product exchange may still be offered at the company's discretion.
        </Block>
        <Block title="3. Product Exchange">
          Within the 15-day window you may exchange the product for another Righwedh Sanjivni product of equal value at no extra cost. Difference in price (if any) is payable / refundable.
        </Block>
        <Block title="4. How To Request">
          Write to <a className="text-primary underline" href="mailto:righvedhsanjivni@gmail.com">righvedhsanjivni@gmail.com</a> with your order date, member ID and reason. Our team will respond within 48 hours with return instructions.
        </Block>
        <Block title="5. Refund Method">
          Approved refunds are paid to your registered UPI ID within 7 working days after we receive and inspect the returned product.
        </Block>
        <Block title="6. Non-Refundable">
          Joining fees where the commission has been distributed, monthly repurchase products consumed by the member, and shipping charges are non-refundable.
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
