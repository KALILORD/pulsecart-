import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/Icons";
import { CartClient } from "@/components/CartClient";
import { getConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: "Your cart",
  description: "Review your PulseCart order and continue to checkout.",
  robots: { index: false, follow: true },
};

export default function CartPage() {
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
            <span className="text-ink">Cart</span>
          </nav>
          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow text-signal-deep">Almost yours</p>
              <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Your cart.</h1>
            </div>
            <Link
              href="/shop/"
              className="inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4"
            >
              Continue shopping
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-10 md:py-14">
        <CartClient brand={site.brand} />
      </section>
    </>
  );
}
