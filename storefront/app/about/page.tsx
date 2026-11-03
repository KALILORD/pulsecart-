import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  CheckIcon,
  PulseIcon,
  ShieldIcon,
  SparkIcon,
  TruckIcon,
} from "@/components/Icons";
import { getAllTrends, getConfig, getProducts } from "@/lib/data";
import { contactHref, whatsappLink } from "@/lib/contact";

export const metadata: Metadata = {
  title: "About",
  description:
    "PulseCart is a South African trend-driven store. We scan what the internet is talking about, verify the supplier, and deliver the product to your door.",
  alternates: { canonical: "/about/" },
};

export default function AboutPage() {
  const site = getConfig();
  const products = getProducts();
  const trends = getAllTrends();
  const wa = whatsappLink(
    site.brand.whatsapp,
    "Hi PulseCart — I have a question about how you source products.",
  );

  return (
    <>
      <section className="relative overflow-hidden border-b border-ink/10 bg-white">
        <div className="paper-grid absolute inset-0 opacity-40" />
        <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-signal/15 blur-3xl" />
        <div className="container-page relative py-14 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="eyebrow text-signal-deep">
                <PulseIcon className="h-3.5 w-3.5" />
                About PulseCart
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-[1.02] sm:text-5xl lg:text-6xl">
                Trends move.
                <br />
                We move with them.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate">
                PulseCart is a small, automated store for the products South Africa is already
                talking about. We watch the signal, check the supplier, and bring the shortlist to
                your door — without a warehouse full of things nobody asked for.
              </p>
            </div>

            <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10">
              <Stat value={String(products.length).padStart(2, "0")} label="Live picks" />
              <Stat value={String(trends.length)} label="Signals scanned" />
              <Stat value="7–14" label="Days to door" />
            </dl>
          </div>
        </div>
      </section>

      <section className="border-b border-ink/10">
        <div className="container-page py-14 md:py-20">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="eyebrow text-signal-deep">Why we exist</p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                The internet finds it first.
                <br />
                We make it buyable.
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate">
                A product can go from a niche search spike to a mainstream want in a week. Most
                stores are still deciding what to stock. PulseCart is built to notice sooner, verify
                faster, and keep the catalogue deliberately small.
              </p>
            </div>

            <div className="space-y-8">
              <p className="text-lg leading-relaxed text-ink/80">
                We are not trying to be the biggest shop in South Africa. We are trying to be the
                one that already has the thing you saw on your feed — with a real price in rand, a
                real delivery window, and a real person to message if something goes wrong.
              </p>
              <p className="text-sm leading-relaxed text-slate">
                Every product starts with a signal, not a supplier catalogue. That means we are
                just as likely to skip a trend that looks like hype as we are to chase one that
                looks like genuine demand.
              </p>

              <div className="grid gap-4 sm:grid-cols-3">
                <Principle
                  icon={<SparkIcon className="h-5 w-5" />}
                  title="Signal-led"
                  body="Search, news and marketplace data decide what we look at."
                />
                <Principle
                  icon={<ShieldIcon className="h-5 w-5" />}
                  title="Verified"
                  body="Supplier price, stock and imagery are checked before launch."
                />
                <Principle
                  icon={<TruckIcon className="h-5 w-5" />}
                  title="Delivered"
                  body="Tracked nationwide delivery, with a human on WhatsApp."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink text-paper">
        <div className="container-page py-14 md:py-20">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="eyebrow text-acid">The machine</p>
              <h2 className="mt-3 text-3xl font-bold text-paper sm:text-4xl">
                A pipeline, not a
                <br />
                buying team.
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper/60">
                The store is the visible part. Behind it, a scheduled pipeline runs the same loop
                every day — and stops when the numbers do not make sense.
              </p>
            </div>

            <ol className="space-y-5">
              <PipelineStep
                number="01"
                title="Scan the signal"
                body="Google Trends, Google News and marketplace demand are collected for South Africa, normalised and scored."
              />
              <PipelineStep
                number="02"
                title="Research the product"
                body="The strongest signals are matched to real listings. We pull live price, shipping cost and delivery estimates."
              />
              <PipelineStep
                number="03"
                title="Write the listing"
                body="Copy is generated from the product data, with a deterministic fallback so the pipeline still works without an API key."
              />
              <PipelineStep
                number="04"
                title="Publish with a gate"
                body="A product only goes live when supplier confidence and margin pass the threshold. Everything else stays in draft."
              />
            </ol>
          </div>
        </div>
      </section>

      <section className="border-b border-ink/10">
        <div className="container-page py-14 md:py-20">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <p className="eyebrow text-signal-deep">What we will not do</p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                No fake urgency.
                <br />
                No invented reviews.
              </h2>
              <ul className="mt-6 space-y-3">
                {[
                  "We do not invent stock counts, discounts or countdown timers.",
                  "We do not publish reviews we did not receive.",
                  "We do not hide the real delivery window behind vague promises.",
                  "We do not sell a product we cannot source confidently.",
                  "We do not spam your inbox or sell your details.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-acid text-ink">
                      <CheckIcon className="h-3 w-3" />
                    </span>
                    <span className="text-ink/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-ink/10 bg-white p-7">
              <p className="eyebrow text-signal-deep">The short version</p>
              <h2 className="mt-3 font-display text-2xl font-bold">Built for the way you shop now.</h2>
              <div className="mt-5 space-y-4 text-sm leading-relaxed text-slate">
                <p>
                  You see something online. You want it. You do not want to wait three weeks to find
                  out it is a scam, or pay double because a reseller marked it up.
                </p>
                <p>
                  PulseCart is the shortcut: a small edit of products with the supplier work already
                  done, a price in rand, and a delivery estimate you can plan around.
                </p>
                <p>
                  If something is not right, you message a real inbox and we sort it out. That is the
                  whole promise.
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/shop/" className="btn-primary flex-1">
                  Shop the drop
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <a
                  href={wa || contactHref(site.brand)}
                  target={wa ? "_blank" : undefined}
                  rel={wa ? "noreferrer" : undefined}
                  className="btn-ghost flex-1"
                >
                  Talk to us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-14 md:py-20">
        <div className="rounded-[2rem] bg-ink px-6 py-12 text-paper sm:px-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <p className="eyebrow text-acid">Stay in the loop</p>
              <h2 className="mt-3 max-w-xl text-3xl font-bold text-paper sm:text-4xl">
                The next find, before it sells out.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-paper/60">
                Drop alerts go out first on Telegram and WhatsApp. No paid ads, no daily noise —
                only the products that earn a place in the edit.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/trends/" className="btn-signal">
                See the trend radar
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <a
                href={`mailto:${site.brand.email}`}
                className="btn-ghost border-paper/30 text-paper hover:bg-paper hover:text-ink"
              >
                Email {site.brand.email}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-paper p-5">
      <dt className="sr-only">{label}</dt>
      <dd className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{value}</dd>
      <dd className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-slate sm:text-[10px]">
        {label}
      </dd>
    </div>
  );
}

function Principle({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white p-4">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-acid text-ink">{icon}</span>
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate">{body}</p>
    </div>
  );
}

function PipelineStep({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-5 border-t border-paper/10 pt-5 first:border-t-0 first:pt-0">
      <span className="font-display text-xs font-bold tracking-[0.16em] text-acid">{number}</span>
      <div>
        <h3 className="text-lg font-semibold text-paper">{title}</h3>
        <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-paper/55">{body}</p>
      </div>
    </li>
  );
}
