import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Payment cancelled",
  robots: { index: false, follow: false },
};

export default function CheckoutCancelPage() {
  return (
    <section className="container-page py-16 md:py-24">
      <div className="mx-auto max-w-xl rounded-[1.5rem] border border-ink/10 bg-white p-8 text-center sm:p-12">
        <p className="eyebrow justify-center text-signal-deep">No payment taken</p>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
          Payment cancelled.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate">
          You cancelled before completing payment. Your cart is still saved — you can pick up where
          you left off whenever you are ready.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/cart/" className="btn-primary">
            Back to cart
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <Link href="/shop/" className="btn-ghost">
            Keep shopping
          </Link>
        </div>
      </div>
    </section>
  );
}
