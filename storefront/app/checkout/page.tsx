import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutClient } from "@/components/CheckoutClient";
import { getConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your PulseCart order. Delivery nationwide across South Africa.",
  robots: { index: false, follow: true },
};

export default function CheckoutPage() {
  const site = getConfig();

  return (
    <>
      <section className="border-b border-ink/10 bg-white">
        <div className="container-page py-10 md:py-14">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate">
            <Link href="/" className="transition hover:text-ink">
              Home
            </Link>
            <span aria-hidden>/</span>
            <Link href="/cart/" className="transition hover:text-ink">
              Cart
            </Link>
            <span aria-hidden>/</span>
            <span className="text-ink">Checkout</span>
          </nav>
          <div className="mt-5">
            <p className="eyebrow text-signal-deep">Last step</p>
            <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Checkout.</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate">
              Tell us where it is going. We will check stock, confirm the total and send a secure
              payment link — no card details needed here.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-10 md:py-14">
        <CheckoutClient brand={site.brand} legal={site.legal} />
      </section>
    </>
  );
}
