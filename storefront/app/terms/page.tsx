import type { Metadata } from "next";
import Link from "next/link";
import { getConfig } from "@/lib/data";
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING, formatZar } from "@/lib/format";

export const metadata: Metadata = {
  title: "Terms of sale",
  description:
    "The terms that apply when you order from PulseCart, including pricing, payment, delivery, returns and your consumer rights.",
  alternates: { canonical: "/terms/" },
};

const EFFECTIVE_DATE = "2 November 2026";

export default function TermsPage() {
  const site = getConfig();
  const contact = site.brand.email;

  return (
    <>
      <section className="border-b border-ink/10 bg-white">
        <div className="container-page py-12 md:py-16">
          <p className="eyebrow text-signal-deep">The fine print</p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Terms of sale.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate">
            These terms apply when you browse or order from PulseCart. They are written to be read,
            not to hide behind. Nothing here takes away rights you have under South African consumer
            law.
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate">
            Effective {EFFECTIVE_DATE}
          </p>
        </div>
      </section>

      <section className="container-page py-10 md:py-14">
        <div className="prose-page mx-auto max-w-3xl">
          <h2 className="mt-0">1. Who you are dealing with</h2>
          <p>
            PulseCart is operated by {site.legal.companyName}, based in {site.legal.address}, South
            Africa. You can contact us at <a href={`mailto:${contact}`}>{contact}</a>. When you
            place an order, you are making an offer to buy from us on these terms.
          </p>

          <h2>2. Products and availability</h2>
          <p>
            We keep a small, changing edit of products. Stock is checked after you submit an order
            and before you pay. If an item is unavailable, we will tell you and offer a refund,
            replacement or the option to cancel. Product photos are representative; colours and
            finishes can vary slightly between batches.
          </p>
          <p>
            We describe products as accurately as we can, but we do not guarantee that every detail
            on a supplier specification is error-free. If a product is materially different from its
            description, you may return it under our{" "}
            <Link href="/shipping/">returns policy</Link>.
          </p>

          <h2>3. Pricing and currency</h2>
          <p>
            All prices are shown in South African rand (ZAR) and include VAT where applicable.
            Delivery is calculated at checkout. A product is only reserved once you have paid.
          </p>
          <p>
            We may correct an obvious pricing error before accepting an order. If the correct price
            is higher than the price you saw, we will ask whether you want to continue at the correct
            price or cancel for a full refund. We will not charge you more without your agreement.
          </p>

          <h2>4. Orders and acceptance</h2>
          <p>
            Submitting the checkout form creates an order request. The order is accepted when we
            confirm stock and send you payment instructions. We may decline an order if the product
            is unavailable, the delivery address is outside our courier network, the order looks
            fraudulent, or there has been a pricing or description error.
          </p>
          <p>
            You are responsible for giving us accurate contact and delivery details. If a parcel is
            returned because of an incorrect address or because you did not collect it, the courier
            fee may be deducted from any refund.
          </p>

          <h2>5. Payment</h2>
          <p>
            We accept payment by secure card link or EFT, as confirmed on your order thread. We do
            not store full card numbers. Payment providers may apply their own terms and security
            checks. Please use the order reference we give you so we can match your payment.
          </p>
          <p>
            We do not charge a surcharge for card payments. Bank fees charged by your own bank are
            your responsibility.
          </p>

          <h2>6. Delivery</h2>
          <p>
            Standard tracked delivery costs {formatZar(STANDARD_SHIPPING)} and is free on orders
            over {formatZar(FREE_SHIPPING_THRESHOLD)}. The usual delivery window is{" "}
            {site.legal.deliveryEstimate} after
            dispatch, but courier delays can happen. We will share tracking information when the
            parcel ships.
          </p>
          <p>
            Risk in the products passes to you on delivery to the address you gave us. Please check
            the parcel on arrival and report damage or missing items within 48 hours.
          </p>

          <h2>7. Returns, refunds and your consumer rights</h2>
          <p>
            Our returns process is set out in the{" "}
            <Link href="/shipping/">shipping &amp; returns policy</Link>. In short: tell us within{" "}
            {site.legal.returnsDays} days of delivery, keep the item unused and in its original
            packaging, and wait for our return confirmation before sending it back.
          </p>
          <p>
            Nothing in these terms limits your rights under the Consumer Protection Act 68 of 2008,
            including your right to receive goods that are safe, of good quality and fit for their
            intended purpose. If a product is defective, you may be entitled to a repair,
            replacement or refund even outside the change-of-mind window.
          </p>

          <h2>8. Promotions and drop alerts</h2>
          <p>
            Any promotion is subject to its own conditions and applies while stock lasts. We do not
            invent countdowns or fake scarcity. If you sign up for drop alerts, you can opt out at
            any time by replying to the message or emailing us.
          </p>

          <h2>9. Acceptable use</h2>
          <p>
            You may not use this site to break the law, interfere with its security, scrape it at a
            volume that affects other customers, or submit false order information. We may suspend
            access where we reasonably believe there is abuse.
          </p>

          <h2>10. Intellectual property</h2>
          <p>
            The PulseCart name, logo, site design and written content belong to us or our licensors.
            Product photographs may belong to suppliers and are used to describe the products we
            sell. You may not copy or reuse our branding or content for a commercial purpose without
            permission.
          </p>

          <h2>11. Liability</h2>
          <p>
            We are responsible for loss or damage that is a foreseeable result of our own failure to
            meet these terms. We are not responsible for indirect loss, loss of profit, or delays
            caused by events outside our reasonable control, such as courier strikes, load shedding,
            or severe weather.
          </p>
          <p>
            Nothing in this section excludes liability that cannot lawfully be excluded, including
            liability for death or personal injury caused by negligence, fraud, or your
            non-excludable consumer rights.
          </p>

          <h2>12. Privacy</h2>
          <p>
            We handle personal information in line with our{" "}
            <Link href="/privacy/">privacy policy</Link>, which forms part of these terms.
          </p>

          <h2>13. Changes to these terms</h2>
          <p>
            We may update these terms when our products, payment methods or legal obligations
            change. The version that applies to your order is the one in force when you place it. The
            effective date at the top of this page shows when the current version started.
          </p>

          <h2>14. Governing law</h2>
          <p>
            These terms are governed by the laws of the Republic of South Africa. If a dispute
            cannot be resolved informally, the courts of South Africa will have jurisdiction, subject
            to any consumer forum or ombudsman that applies to your complaint.
          </p>

          <h2>15. Contact</h2>
          <p>
            Questions about these terms or an order? Email{" "}
            <a href={`mailto:${contact}`}>{contact}</a> or use the{" "}
            <Link href="/contact/">contact page</Link>. We would rather fix a problem than argue
            about one.
          </p>

          <div className="mt-10 rounded-2xl border border-ink/10 bg-white p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate">
              Also worth reading
            </p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
              <Link href="/shipping/" className="text-ink underline underline-offset-4">
                Shipping &amp; returns
              </Link>
              <Link href="/privacy/" className="text-ink underline underline-offset-4">
                Privacy policy
              </Link>
              <Link href="/contact/" className="text-ink underline underline-offset-4">
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
