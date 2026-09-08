import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Righwedh Sanjivni" },
      { name: "description", content: "How Righwedh Sanjivni collects, uses and protects your personal information." },
      { property: "og:title", content: "Privacy Policy — Righwedh Sanjivni" },
      { property: "og:description", content: "How we handle your data." },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <SiteLayout>
      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Legal</div>
          <h1 className="mt-3 font-serif text-5xl">Privacy Policy</h1>
          <p className="mt-4 text-primary-foreground/80">Your data. Our responsibility.</p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-6 py-16 space-y-8 text-[15px] leading-relaxed text-primary">
        <Block title="1. Information We Collect">
          When you register or purchase, we collect your name, email, phone number, UPI ID, payment screenshot and referral relationships. We do not collect passwords in plain text or store your card details.
        </Block>
        <Block title="2. How We Use Your Information">
          We use your information to create your account, place you in the binary tree, verify payments, credit commissions, process withdrawals to your UPI, and to contact you about your account, orders and rewards.
        </Block>
        <Block title="3. Sharing">
          We do not sell your data. Limited data is shared with (a) our payment processor for UPI verification, (b) our upline sponsor for team visibility (name, referral code, active status only) and (c) government / regulatory authorities if legally required.
        </Block>
        <Block title="4. Data Retention">
          Account, order and commission records are retained for as long as your account is active and for a further period required for tax and legal compliance.
        </Block>
        <Block title="5. Security">
          Your data is stored on encrypted infrastructure. Payment screenshots are stored in a private bucket accessible only to you and the admin. Withdrawal UPI is only visible to you and the admin.
        </Block>
        <Block title="6. Your Rights">
          You may request access to, correction of, or deletion of your personal data at any time by writing to <a className="text-primary underline" href="mailto:righvedhsanjivni@gmail.com">righvedhsanjivni@gmail.com</a>. Deletion of an active MLM account will result in forfeiture of un-withdrawn income.
        </Block>
        <Block title="7. Cookies">
          We use only essential cookies required to keep you signed in. We do not use third-party advertising cookies.
        </Block>
        <Block title="8. Changes">
          This policy may be updated from time to time. The latest version will always be available on this page.
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
