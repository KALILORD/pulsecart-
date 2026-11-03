import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { ArrowRightIcon, MailIcon, ShieldIcon, TelegramIcon, TruckIcon, WhatsAppIcon } from "@/components/Icons";
import { getConfig } from "@/lib/data";
import { whatsappLink } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact PulseCart for order help, product questions, returns or wholesale enquiries. Email or WhatsApp us directly.",
  alternates: { canonical: "/contact/" },
};

const FAQ = [
  {
    question: "Where is my order?",
    answer:
      "Send us your order name or the reference we gave you on WhatsApp. We will check the courier status and reply with the latest update.",
  },
  {
    question: "Can I change my address after ordering?",
    answer:
      "If the parcel has not been handed to the courier yet, yes. Message us as soon as possible with the order details and the correct address.",
  },
  {
    question: "Can I pay on delivery?",
    answer:
      "Not right now. Orders are confirmed first, then paid by secure card link or EFT. This protects both sides while we verify stock.",
  },
  {
    question: "Do you ship outside South Africa?",
    answer:
      "The store is built for South African delivery. For a neighbouring country, message us before ordering and we will confirm whether we can quote a courier.",
  },
];

export default function ContactPage() {
  const site = getConfig();
  const wa = whatsappLink(
    site.brand.whatsapp,
    "Hi PulseCart — I need help with an order.",
  );

  return (
    <>
      <section className="border-b border-ink/10 bg-white">
        <div className="container-page py-12 md:py-16">
          <p className="eyebrow text-signal-deep">
            <span className="h-1.5 w-1.5 rounded-full bg-signal" />
            Talk to a human
          </p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Contact PulseCart.</h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate">
            Order questions, sizing, delivery, returns — message us and we will help. We are a small
            team, so replies are personal rather than scripted.
          </p>
        </div>
      </section>

      <section className="container-page py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="space-y-4">
            <a
              href={wa || `mailto:${site.brand.email}`}
              target={wa ? "_blank" : undefined}
              rel={wa ? "noreferrer" : undefined}
              className="group block rounded-2xl border border-ink/10 bg-ink p-6 text-paper transition hover:border-signal"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-acid text-ink">
                  <WhatsAppIcon className="h-5 w-5" />
                </span>
                <ArrowRightIcon className="h-4 w-4 text-paper/40 transition group-hover:translate-x-1 group-hover:text-acid" />
              </span>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-acid">
                Fastest reply
              </p>
              <p className="mt-1 font-display text-xl font-semibold">WhatsApp</p>
              <p className="mt-1 text-sm text-paper/60">
                {site.brand.whatsapp || "Message us and we will reply with the active number."}
              </p>
            </a>

            <a
              href={`mailto:${site.brand.email}`}
              className="group block rounded-2xl border border-ink/10 bg-white p-6 transition hover:border-ink"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-mist text-ink">
                  <MailIcon className="h-5 w-5" />
                </span>
                <ArrowRightIcon className="h-4 w-4 text-slate transition group-hover:translate-x-1" />
              </span>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-slate">
                Email
              </p>
              <p className="mt-1 font-display text-xl font-semibold">{site.brand.email}</p>
              <p className="mt-1 text-sm text-slate">Usually within one business day.</p>
            </a>

            <div className="rounded-2xl border border-ink/10 bg-white p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate">
                Follow the drops
              </p>
              <a
                href="https://t.me/pulsecart"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold transition hover:text-signal-deep"
              >
                <TelegramIcon className="h-4 w-4" />
                t.me/pulsecart
              </a>
              <p className="mt-3 text-xs leading-relaxed text-slate">
                New products and restocks are announced here first.
              </p>
            </div>

            <div className="rounded-2xl border border-ink/10 bg-paper p-6">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate">
                <TruckIcon className="h-4 w-4 text-signal-deep" />
                Delivery window
              </p>
              <p className="mt-2 font-display text-lg font-semibold">
                {site.legal.deliveryEstimate}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate">
                Tracked nationwide. You get an update when the parcel ships.
              </p>
            </div>

            <div className="rounded-2xl border border-ink/10 bg-paper p-6">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate">
                <ShieldIcon className="h-4 w-4 text-signal-deep" />
                Returns
              </p>
              <p className="mt-2 font-display text-lg font-semibold">
                {site.legal.returnsDays}-day returns
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate">
                Unused items in original packaging. Read the{" "}
                <Link href="/shipping/" className="font-semibold text-ink underline underline-offset-2">
                  returns policy
                </Link>
                .
              </p>
            </div>
          </div>

          <ContactForm brand={site.brand} />
        </div>
      </section>

      <section className="border-t border-ink/10 bg-white">
        <div className="container-page py-14 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="eyebrow text-signal-deep">Quick answers</p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Before you message.</h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate">
                The most common questions, answered. If yours is not here, the form above is the
                fastest way to reach us.
              </p>
            </div>
            <div className="divide-y divide-ink/10 border-y border-ink/10">
              {FAQ.map((entry) => (
                <details key={entry.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
                    {entry.question}
                    <span className="text-lg text-slate transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="pt-3 text-sm leading-relaxed text-slate">{entry.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
