import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CheckIcon,
  PulseIcon,
  ShieldIcon,
  SparkIcon,
  TelegramIcon,
  TruckIcon,
  WhatsAppIcon,
} from "@/components/Icons";
import { ProductCard } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";
import { categoryMeta } from "@/lib/categories";
import { contactHref, whatsappLink } from "@/lib/contact";
import { getConfig, getFeaturedProduct, getProducts, getTrendRadar } from "@/lib/data";
import { formatZar, trendSourceLabel } from "@/lib/format";

export const metadata: Metadata = {
  title: "PulseCart — What's trending. Delivered.",
  description:
    "South Africa's trend-driven store. We spot what the internet is talking about, find the product behind it, and deliver it to your door.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const site = getConfig();
  const products = getProducts();
  const featured = getFeaturedProduct();
  const allTrends = getTrendRadar(50);
  const radar = allTrends.slice(0, 6);
  const categories = Array.from(new Set(products.map((product) => product.category))).map(
    categoryMeta,
  );
  const tickerItems = [
    "Free delivery over R500",
    "New trends scanned daily",
    "7-day returns",
    "Packed in South Africa",
    ...products.map((product) => product.title),
    "Trend radar updated daily",
  ];
  const whatsapp = whatsappLink(
    site.brand.whatsapp,
    "Hi PulseCart — I'd like help choosing a product.",
  );

  if (!featured) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-4xl font-bold">The next drop is loading.</h1>
        <p className="mx-auto mt-4 max-w-md text-slate">
          Our trend engine is scanning the internet. Check back shortly, or get in touch and we
          will tell you what is coming.
        </p>
        <Link href="/contact/" className="btn-primary mt-8">
          Contact PulseCart
        </Link>
      </div>
    );
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-ink/10">
        <div className="paper-grid absolute inset-0 opacity-50" />
        <div className="absolute -left-32 top-24 h-72 w-72 rounded-full bg-acid/30 blur-3xl" />
        <div className="container-page relative grid gap-14 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div>
            <p className="eyebrow text-signal-deep">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
              </span>
              Live trend radar · South Africa
            </p>
            <h1 className="mt-5 text-[3.25rem] font-bold leading-[0.94] sm:text-6xl lg:text-7xl xl:text-[5.4rem]">
              What&apos;s
              <br />
              trending.
              <br />
              <span className="relative inline-block">
                Delivered.
                <svg
                  aria-hidden
                  viewBox="0 0 300 14"
                  className="absolute -bottom-2 left-0 w-full text-signal-deep"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 10c42-6 92-8 148-6 55 2 100 5 148 1"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="5"
                  />
                </svg>
              </span>
            </h1>
            <p className="mt-7 max-w-md text-base leading-relaxed text-slate sm:text-lg">
              We watch what South Africa is talking about, find the product behind the hype, and
              put it on your doorstep. A small, deliberate drop — never a crowded catalogue.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/shop/" className="btn-primary">
                Shop the drop
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link href="/trends/" className="btn-ghost">
                See the trend radar
              </Link>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-ink/10 pt-6">
              <Stat value={String(products.length).padStart(2, "0")} label="Live picks" />
              <Stat
                value={allTrends.length >= 40 ? "40+" : String(allTrends.length)}
                label="Signals scanned"
              />
              <Stat value="7–14" label="Days to door" />
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-[27rem] lg:max-w-none">
            <div className="absolute -inset-8 rounded-full bg-acid/50 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-ink/10 bg-mist shadow-[0_30px_80px_-30px_rgba(16,20,24,0.45)]">
              <Link
                href={`/products/${featured.slug}/`}
                className="block aspect-[4/5] overflow-hidden"
                aria-label={`View ${featured.title}`}
              >
                <ProductImage
                  src={featured.images[0] ?? ""}
                  alt={featured.title}
                  priority
                  sizes="(max-width: 1024px) 90vw, 45vw"
                  imageClassName="transition duration-700 hover:scale-[1.03]"
                />
              </Link>
              <span className="absolute left-4 top-4 rounded-full bg-ink/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-paper backdrop-blur">
                Drop 01 · {formatZar(featured.priceZar)}
              </span>
              <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/15 bg-ink/85 p-4 text-paper backdrop-blur">
                <div className="flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-acid">
                      This week&apos;s feature
                    </p>
                    <p className="mt-1 truncate font-display text-lg font-semibold">
                      {featured.title}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-acid px-3 py-1.5 text-[11px] font-bold text-ink">
                    {featured.trend.score}/100 trend
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute -right-3 top-10 hidden rounded-2xl border border-ink/10 bg-white p-4 shadow-xl shadow-ink/10 sm:block">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-acid">
                  <PulseIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate">
                    Trend score
                  </p>
                  <p className="font-display text-xl font-bold leading-none">
                    {featured.trend.score}
                    <span className="text-xs font-medium text-slate">/100</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -left-3 bottom-28 hidden max-w-[12rem] rounded-2xl border border-ink/10 bg-white p-4 shadow-xl shadow-ink/10 sm:block">
              <ShieldIcon className="h-5 w-5 text-signal-deep" />
              <p className="mt-2 text-xs font-semibold leading-snug">
                Supplier checked before it goes live
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-b border-ink bg-acid py-3 text-ink">
        <div className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap">
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.18em]"
            >
              {item}
              <SparkIcon className="h-3.5 w-3.5" />
            </span>
          ))}
        </div>
      </div>

      <section className="border-b border-ink/10">
        <div className="container-page py-16 md:py-24">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p className="eyebrow text-signal-deep">The drop</p>
              <h2 className="mt-3 text-4xl font-bold sm:text-5xl">This week&apos;s edit.</h2>
              <p className="mt-4 text-slate">
                Three picks, each with a real reason to exist. We check the supplier, the landed
                cost and the delivery window before anything goes live.
              </p>
            </div>
            <Link
              href="/shop/"
              className="inline-flex items-center gap-2 text-sm font-semibold underline decoration-2 underline-offset-4 transition hover:text-signal-deep"
            >
              Shop all products
              <ArrowUpRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map((product, index) => (
              <ProductCard key={product.id} product={product} rank={index + 1} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink text-paper">
        <div className="container-page py-16 md:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="eyebrow text-acid">How it works</p>
              <h2 className="mt-3 text-4xl font-bold sm:text-5xl">
                Signal in.
                <br />
                Product out.
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-paper/60">
                The store is the visible part. Behind it, an automated pipeline scans trends,
                checks suppliers and writes the launch copy — every day, without a team.
              </p>
              <Link href="/about/" className="btn-ghost mt-8 border-paper/30 text-paper hover:bg-paper hover:text-ink">
                How PulseCart works
              </Link>
            </div>
            <div className="grid gap-px overflow-hidden rounded-2xl border border-paper/10 bg-paper/10 sm:grid-cols-3">
              <Step
                number="01"
                title="We read the signal"
                body="Google Trends, news and marketplace demand are scanned and scored for real product momentum."
              />
              <Step
                number="02"
                title="We check the supplier"
                body="Price, shipping and stock are pulled from live product data. Low-confidence items stay in draft."
              />
              <Step
                number="03"
                title="We ship to you"
                body="Your order is confirmed on WhatsApp, then packed and sent anywhere in South Africa."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-ink/10">
        <div className="container-page py-16 md:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="eyebrow text-signal-deep">Trend radar</p>
              <h2 className="mt-3 text-4xl font-bold sm:text-5xl">
                The internet is
                <br />
                talking.
              </h2>
              <p className="mt-4 max-w-sm text-slate">
                A live look at the signals behind this week&apos;s picks. Scores combine search
                traffic, news coverage and marketplace demand.
              </p>
              <Link
                href="/trends/"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold underline decoration-2 underline-offset-4 transition hover:text-signal-deep"
              >
                Explore the full radar
                <ArrowUpRightIcon className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y divide-ink/10 border-y border-ink/10">
              {radar.map((trend, index) => (
                <div key={trend.id} className="group flex items-center gap-4 py-4">
                  <span className="w-7 shrink-0 font-display text-sm font-bold text-slate">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{trend.title}</p>
                    <p className="mt-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate">
                      <span className="h-1 w-1 rounded-full bg-signal" />
                      {trendSourceLabel(trend.source)}
                    </p>
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-mist">
                      <div
                        className="h-full rounded-full bg-ink transition-all duration-700 group-hover:bg-signal"
                        style={{ width: `${Math.min(100, Math.max(4, trend.score))}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-9 shrink-0 text-right font-display text-sm font-bold tabular-nums">
                    {Math.round(trend.score)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="border-b border-ink/10">
        <div className="container-page py-16 md:py-24">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow text-signal-deep">Browse</p>
              <h2 className="mt-3 text-4xl font-bold sm:text-5xl">By category.</h2>
            </div>
            <p className="max-w-sm text-sm text-slate">
              Every product starts with a live signal, then earns its place in one of these
              edits.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const count = products.filter((product) => product.category === category.id).length;
              return (
                <Link
                  key={category.id}
                  href={`/category/${category.id}/`}
                  className="group flex items-start justify-between gap-4 rounded-2xl border border-ink/10 bg-white p-6 transition hover:border-ink hover:shadow-lg hover:shadow-ink/5"
                >
                  <div>
                    <h3 className="text-lg font-semibold">{category.label}</h3>
                    <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-slate">
                      {category.blurb}
                    </p>
                  </div>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink/10 text-xs font-bold tabular-nums text-slate transition group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
                    {String(count).padStart(2, "0")}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-ink/10 bg-white">
        <div className="container-page grid gap-8 py-10 sm:grid-cols-3">
          <TrustItem
            icon={<TruckIcon className="h-5 w-5" />}
            title="Nationwide delivery"
            body={`${site.legal.deliveryEstimate}, tracked to your door.`}
          />
          <TrustItem
            icon={<ShieldIcon className="h-5 w-5" />}
            title={`${site.legal.returnsDays}-day returns`}
            body="Something wrong? Send it back within seven days."
          />
          <TrustItem
            icon={<CheckIcon className="h-5 w-5" />}
            title="Checked before launch"
            body="Supplier price, stock and imagery are verified first."
          />
        </div>
      </section>

      <section className="container-page py-16 md:py-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-12 text-paper sm:px-12 md:py-16">
          <div className="paper-grid absolute inset-0 opacity-20" />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-signal/30 blur-3xl" />
          <div className="relative grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <p className="eyebrow text-acid">Drop alerts</p>
              <h2 className="mt-3 max-w-xl text-4xl font-bold text-paper sm:text-5xl">
                Get the next find before it sells out.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-paper/60">
                New products are announced first on Telegram and WhatsApp. No spam, no paid ads —
                just the next thing worth knowing about.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <a
                href="https://t.me/pulsecart"
                target="_blank"
                rel="noreferrer"
                className="btn-signal"
              >
                <TelegramIcon className="h-4 w-4" />
                Join the Telegram drop
              </a>
              <a
                href={whatsapp || contactHref(site.brand)}
                target={whatsapp ? "_blank" : undefined}
                rel={whatsapp ? "noreferrer" : undefined}
                className="btn-ghost border-paper/30 text-paper hover:bg-paper hover:text-ink"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Chat on WhatsApp
              </a>
              <p className="text-center text-[11px] text-paper/60">
                Or email {site.brand.email}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{value}</dd>
      <dd className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate">
        {label}
      </dd>
    </div>
  );
}

function Step({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div className="bg-ink p-6">
      <span className="font-display text-xs font-bold tracking-[0.2em] text-acid">{number}</span>
      <h3 className="mt-4 text-lg font-semibold text-paper">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-paper/55">{body}</p>
    </div>
  );
}

function TrustItem({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-acid text-ink">
        {icon}
      </span>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate">{body}</p>
      </div>
    </div>
  );
}
