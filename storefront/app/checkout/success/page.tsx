import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon, MailIcon } from "@/components/Icons";
import { getConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: "Order received",
  description: "Your PulseCart order has been submitted.",
  robots: { index: false, follow: false },
};

export default function CheckoutSuccessPage() {
  const site = getConfig();

  return (
    <section className="container-page py-16 md:py-24">
      <div className="mx-auto max-w-xl rounded-[1.5rem] border border-ink/10 bg-white p-8 text-center sm:p-12">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-acid text-ink">
          <CheckIcon className="h-8 w-8" />
        </span>
        <p className="eyebrow mt-6 justify-center text-signal-deep">Payment complete</p>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Thank you.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate">
          Your payment has been received. We will confirm stock and email your tracking details to
          the address you provided at checkout.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/shop/" className="btn-primary">
            Continue shopping
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <Link href="/contact/" className="btn-ghost">
            Need help?
          </Link>
        </div>
        <p className="mt-6 text-[11px] leading-relaxed text-slate">
          Questions? Email{" "}
          <a href={`mailto:${site.brand.email}`} className="font-semibold text-ink underline underline-offset-2">
            {site.brand.email}
          </a>
          .
        </p>
      </div>
    </section>
  );
}
