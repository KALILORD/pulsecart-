import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Payment error",
  robots: { index: false, follow: false },
};

export default function CheckoutErrorPage() {
  return (
    <section className="container-page py-16 md:py-24">
      <div className="mx-auto max-w-xl rounded-[1.5rem] border border-ink/10 bg-white p-8 text-center sm:p-12">
        <p className="eyebrow justify-center text-signal-deep">Something went wrong</p>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
          Payment could not be completed.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate">
          The payment service could not process your request. No money has been taken. Please try
          again or contact us if the problem continues.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/checkout/" className="btn-primary">
            Try again
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <Link href="/contact/" className="btn-ghost">
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
}
