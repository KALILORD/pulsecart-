import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CheckIcon,
  PulseIcon,
  SparkIcon,
} from "@/components/Icons";
import { getAllTrends, getProducts, getTrendRadar } from "@/lib/data";
import { cx, shortDate, trendSourceLabel } from "@/lib/format";

export const metadata: Metadata = {
  title: "Trend radar",
  description:
    "A live look at the signals behind PulseCart's edit. Search spikes, news moments and marketplace demand, scored for South Africa.",
  alternates: { canonical: "/trends/" },
};

const SOURCE_ORDER = ["google-trends", "aliexpress", "google-news", "reddit", "manual"];

function sourceTone(source: string): string {
  switch (source) {
    case "aliexpress":
      return "bg-signal/10 text-signal-deep";
    case "google-trends":
      return "bg-ink text-paper";
    case "google-news":
      return "bg-acid text-ink";
    case "reddit":
      return "bg-mist text-ink";
    default:
      return "bg-mist text-slate";
  }
}

export default function TrendsPage() {
  const all = getAllTrends();
  const radar = getTrendRadar(24);
  const products = getProducts();
  const eligible = all.filter((trend) => trend.eligible !== false);
  const averageScore =
    all.length > 0 ? Math.round(all.reduce((sum, trend) => sum + trend.score, 0) / all.length) : 0;
  const sourceCounts = SOURCE_ORDER.map((source) => ({
    source,
    count: all.filter((trend) => trend.source === source).length,
  })).filter((entry) => entry.count > 0);
  const latest = all
    .map((trend) => trend.observedAt)
    .sort((a, b) => b.localeCompare(a))
    .at(0);

  const productByTrend = new Map(products.map((product) => [product.trend.id, product]));

  return (
    <>
      <section className="relative overflow-hidden border-b border-ink/10 bg-white">
        <div className="paper-grid absolute inset-0 opacity-40" />
        <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-acid/40 blur-3xl" />
        <div className="container-page relative py-12 md:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="eyebrow text-signal-deep">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
                </span>
                Live trend radar · {latest ? shortDate(latest) : "Updated daily"}
              </p>
              <h1 className="mt-5 text-4xl font-bold leading-[1.02] sm:text-5xl lg:text-6xl">
                The signal before
                <br />
                the product.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate">
                Every PulseCart product starts here. We scan search spikes, news moments and
                marketplace demand, then score the signals that actually look like a product people
                want to buy.
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10 sm:grid-cols-4 lg:grid-cols-2">
              <Stat value={String(all.length)} label="Signals scanned" />
              <Stat value={String(eligible.length)} label="Product-ready" />
              <Stat value={String(averageScore)} label="Average score" />
              <Stat value={`${sourceCounts.length}`} label="Live sources" />
            </dl>
          </div>
        </div>
      </section>

      <section className="container-page py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_0.8fr] lg:items-start">
          <div>
            <div className="flex flex-col gap-4 border-b border-ink/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow text-signal-deep">The ranking</p>
                <h2 className="mt-2 text-3xl font-bold sm:text-4xl">What is climbing.</h2>
              </div>
              <p className="max-w-xs text-xs leading-relaxed text-slate">
                Scores are relative to the current scan. Anything below our threshold stays out of
                the shop.
              </p>
            </div>

            {radar.length > 0 ? (
              <ol className="divide-y divide-ink/10">
                {radar.map((trend, index) => {
                  const product = productByTrend.get(trend.id);
                  return (
                    <li key={trend.id} className="group py-5">
                      <div className="flex items-start gap-4">
                        <span className="mt-0.5 w-8 shrink-0 font-display text-sm font-bold text-slate">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={cx(
                                "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
                                sourceTone(trend.source),
                              )}
                            >
                              {trendSourceLabel(trend.source)}
                            </span>
                            {trend.traffic && (
                              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate">
                                {trend.traffic}
                              </span>
                            )}
                            {product ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-acid px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-ink">
                                <CheckIcon className="h-3 w-3" />
                                In the drop
                              </span>
                            ) : (
                              <span className="rounded-full border border-ink/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate">
                                Watching
                              </span>
                            )}
                          </div>

                          <h3 className="mt-2 text-base font-semibold leading-snug sm:text-lg">
                            {trend.title}
                          </h3>
                          <p className="mt-1 text-xs text-slate">
                            {trend.query} · {trend.category}
                          </p>

                          <div className="mt-3 flex items-center gap-3">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-mist">
                              <div
                                className={cx(
                                  "h-full rounded-full transition-all duration-700",
                                  product ? "bg-signal" : "bg-ink/60 group-hover:bg-signal",
                                )}
                                style={{ width: `${Math.min(100, Math.max(4, trend.score))}%` }}
                              />
                            </div>
                            <span className="w-9 text-right font-display text-sm font-bold tabular-nums">
                              {Math.round(trend.score)}
                            </span>
                          </div>

                          {product && (
                            <Link
                              href={`/products/${product.slug}/`}
                              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] underline underline-offset-4 transition hover:text-signal-deep"
                            >
                              Shop {product.title}
                              <ArrowUpRightIcon className="h-3.5 w-3.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="mt-8 rounded-2xl border border-dashed border-ink/20 px-6 py-14 text-center">
                <p className="font-display text-xl font-semibold">The radar is warming up.</p>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate">
                  The next scan is on its way. In the meantime, browse the current edit.
                </p>
                <Link href="/shop/" className="btn-primary mt-6">
                  Shop the drop
                </Link>
              </div>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-40">
            <div className="rounded-2xl border border-ink/10 bg-white p-6">
              <div className="flex items-center gap-2 text-signal-deep">
                <SparkIcon className="h-4 w-4" />
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]">How scoring works</p>
              </div>
              <h2 className="mt-3 font-display text-xl font-bold">Signal, not hype.</h2>
              <ul className="mt-4 space-y-4 text-sm leading-relaxed text-slate">
                <ScoreItem
                  number="01"
                  title="Search momentum"
                  body="Google Trends tells us what South Africa is searching for more often than usual."
                />
                <ScoreItem
                  number="02"
                  title="Marketplace demand"
                  body="Live marketplace listings show whether people are already buying, and at what price."
                />
                <ScoreItem
                  number="03"
                  title="News + community"
                  body="News coverage and community chatter add context, or flag something that is only a headline."
                />
              </ul>
              <p className="mt-5 border-t border-ink/10 pt-4 text-xs leading-relaxed text-slate">
                We penalise informational noise, once-off news events and anything we cannot source
                confidently. A high score is a reason to research — not a reason to publish
                automatically.
              </p>
            </div>

            <div className="rounded-2xl border border-ink/10 bg-ink p-6 text-paper">
              <div className="flex items-center gap-2 text-acid">
                <PulseIcon className="h-4 w-4" />
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]">Source mix</p>
              </div>
              <ul className="mt-4 space-y-2.5">
                {sourceCounts.map((entry) => (
                  <li key={entry.source} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-paper/70">{trendSourceLabel(entry.source)}</span>
                    <span className="font-display font-bold tabular-nums">{entry.count}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-paper/10 pt-4 text-[11px] leading-relaxed text-paper/60">
                Reddit and news sources are optional. The pipeline degrades gracefully when a source
                is unavailable.
              </p>
            </div>

            <Link
              href="/shop/"
              className="group flex items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-white p-5 transition hover:border-ink"
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate">
                  Already live
                </p>
                <p className="mt-1 font-display text-lg font-semibold">Shop the current drop</p>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-acid text-ink transition group-hover:bg-ink group-hover:text-acid">
                <ArrowRightIcon className="h-4 w-4" />
              </span>
            </Link>
          </aside>
        </div>
      </section>

      <section className="border-t border-ink/10 bg-white">
        <div className="container-page py-14 md:py-20">
          <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div>
              <p className="eyebrow text-signal-deep">Behind the radar</p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                A human check before anything goes live.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate">
                A trend is only the beginning. We confirm the supplier, the landed cost and the
                delivery window before a product earns a place in the shop. If the numbers do not
                work, it stays in draft.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
              <Link href="/about/" className="btn-ghost">
                How PulseCart works
              </Link>
              <Link href="/shop/" className="btn-primary">
                Shop the drop
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
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
      <dd className="font-display text-3xl font-bold tracking-tight">{value}</dd>
      <dd className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate">{label}</dd>
    </div>
  );
}

function ScoreItem({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <li className="flex gap-3">
      <span className="font-display text-xs font-bold text-signal-deep">{number}</span>
      <div>
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-slate">{body}</p>
      </div>
    </li>
  );
}
