import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRightIcon,
  CheckIcon,
  PulseIcon,
  ShieldIcon,
  SparkIcon,
  TruckIcon,
} from "@/components/Icons";
import { ProductBuyBox } from "@/components/ProductBuyBox";
import { ProductCard } from "@/components/ProductCard";
import { ProductGallery } from "@/components/ProductGallery";
import { categoryLabel } from "@/lib/categories";
import { getConfig, getProductBySlug, getProductSlugs, getRelatedProducts } from "@/lib/data";
import { deliveryWindow, formatZar, shortDate, trendSourceLabel } from "@/lib/format";
import type { Product } from "@/lib/types";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getProductSlugs().map((slug) => ({ slug }));
}

function absoluteImage(domain: string, image: string): string {
  if (!image) return `${domain.replace(/\/+$/, "")}/og.png`;
  if (image.startsWith("http")) return image;
  return `${domain.replace(/\/+$/, "")}${image}`;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};

  const site = getConfig();
  const image = absoluteImage(site.brand.domain, product.images[0] ?? "");

  return {
    title: product.title,
    description: product.seo.description || product.tagline,
    keywords: product.seo.keywords,
    alternates: { canonical: `/products/${product.slug}/` },
    openGraph: {
      type: "website",
      title: product.title,
      description: product.seo.description || product.tagline,
      url: absoluteImage(site.brand.domain, `/products/${product.slug}/`),
      images: [{ url: image, alt: product.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.seo.description || product.tagline,
      images: [image],
    },
  };
}

function productJsonLd(product: Product, domain: string) {
  const url = absoluteImage(domain, `/products/${product.slug}/`);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.seo.description || product.tagline,
    image: product.images.map((image) => absoluteImage(domain, image)),
    sku: product.id,
    category: categoryLabel(product.category),
    brand: { "@type": "Brand", name: "PulseCart" },
    offers: {
      "@type": "Offer",
      priceCurrency: "ZAR",
      price: product.priceZar.toFixed(2),
      availability: product.supplier.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url,
      seller: { "@type": "Organization", name: "PulseCart" },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "ZA" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: product.supplier.deliveryDays[0],
            maxValue: product.supplier.deliveryDays[1],
            unitCode: "DAY",
          },
        },
      },
    },
  };
}

function breadcrumbJsonLd(product: Product, domain: string) {
  const base = domain.replace(/\/+$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${base}/shop/` },
      {
        "@type": "ListItem",
        position: 3,
        name: categoryLabel(product.category),
        item: `${base}/category/${product.category}/`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.title,
        item: `${base}/products/${product.slug}/`,
      },
    ],
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const site = getConfig();
  const related = getRelatedProducts(product, 3);
  const jsonLd = productJsonLd(product, site.brand.domain);
  const breadcrumb = breadcrumbJsonLd(product, site.brand.domain);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <div className="border-b border-ink/10 bg-white">
        <div className="container-page py-4">
          <nav aria-label="Breadcrumb" className="hide-scrollbar flex items-center gap-2 overflow-x-auto text-xs text-slate">
            <Link href="/" className="whitespace-nowrap transition hover:text-ink">
              Home
            </Link>
            <span aria-hidden>/</span>
            <Link href="/shop/" className="whitespace-nowrap transition hover:text-ink">
              Shop
            </Link>
            <span aria-hidden>/</span>
            <Link
              href={`/category/${product.category}/`}
              className="whitespace-nowrap transition hover:text-ink"
            >
              {categoryLabel(product.category)}
            </Link>
            <span aria-hidden>/</span>
            <span className="truncate text-ink">{product.title}</span>
          </nav>
        </div>
      </div>

      <section className="container-page py-8 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-14">
          <ProductGallery images={product.images} title={product.title} />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-paper">
                <span className="h-1.5 w-1.5 rounded-full bg-acid" />
                Trending
              </span>
              <Link
                href="/trends/"
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate transition hover:border-ink hover:text-ink"
              >
                <PulseIcon className="h-3.5 w-3.5" />
                Trend score {product.trend.score}/100
              </Link>
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate">
                {categoryLabel(product.category)}
              </span>
            </div>

            <h1 className="mt-4 text-4xl font-bold leading-[1.02] sm:text-5xl">{product.title}</h1>
            <p className="mt-3 text-lg text-slate">{product.tagline}</p>

            <div className="mt-6 flex flex-wrap items-end gap-x-3 gap-y-1">
              <p className="font-display text-3xl font-bold tracking-tight">
                {formatZar(product.priceZar)}
              </p>
              <p className="pb-1 text-xs font-medium uppercase tracking-wide text-slate">
                Incl. VAT · Free delivery over R500
              </p>
            </div>

            <ul className="mt-6 space-y-2.5">
              {product.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5 text-sm leading-relaxed">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-acid text-ink">
                    <CheckIcon className="h-3 w-3" />
                  </span>
                  <span className="text-ink/80">{bullet}</span>
                </li>
              ))}
            </ul>

            <ProductBuyBox product={product} />

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <MiniTrust
                icon={<TruckIcon className="h-4 w-4" />}
                title="Delivery"
                body={deliveryWindow(product.supplier)}
              />
              <MiniTrust
                icon={<ShieldIcon className="h-4 w-4" />}
                title="Returns"
                body={`${site.legal.returnsDays} days`}
              />
              <MiniTrust
                icon={<CheckIcon className="h-4 w-4" />}
                title="Checked"
                body={shortDate(product.supplier.checkedAt)}
              />
            </div>

            <div className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
              <details className="group py-4" open>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
                  Delivery & returns
                  <span className="text-slate transition group-open:rotate-45">+</span>
                </summary>
                <div className="pt-3 text-sm leading-relaxed text-slate">
                  <p>
                    Orders are packed and dispatched from our South African hub. This item
                    typically arrives in {deliveryWindow(product.supplier)}. You will receive a
                    tracking update on WhatsApp as soon as it ships.
                  </p>
                  <p className="mt-2">
                    Not right? Send it back within {site.legal.returnsDays} days of delivery in its
                    original condition and we will arrange a refund or exchange.
                  </p>
                </div>
              </details>
              <details className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
                  Sourcing & quality
                  <span className="text-slate transition group-open:rotate-45">+</span>
                </summary>
                <div className="pt-3 text-sm leading-relaxed text-slate">
                  <p>
                    We source this product from a vetted supplier and check the live price, stock
                    and product imagery before it goes live. Supplier details stay internal so our
                    sourcing stays protected.
                  </p>
                  <p className="mt-2">
                    Product colours and finishes can vary slightly between batches. If you need a
                    specific shade or size, message us before ordering and we will confirm.
                  </p>
                </div>
              </details>
              <details className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
                  What you get
                  <span className="text-slate transition group-open:rotate-45">+</span>
                </summary>
                <div className="pt-3 text-sm leading-relaxed text-slate">
                  <p>1 × {product.title}, securely packed for transit.</p>
                  <p className="mt-2">
                    Questions about sizing, compatibility or delivery? Email {site.brand.email} or
                    message us on WhatsApp.
                  </p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-white">
        <div className="container-page grid gap-10 py-12 md:py-16 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="eyebrow text-signal-deep">The story</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Why this made the edit.</h2>
            <div className="mt-5 max-w-2xl space-y-4 text-base leading-relaxed text-slate">
              {product.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-paper p-6">
            <div className="flex items-center gap-2 text-signal-deep">
              <SparkIcon className="h-4 w-4" />
              <p className="text-[10px] font-bold uppercase tracking-[0.16em]">On the radar</p>
            </div>
            <p className="mt-4 font-display text-lg font-semibold leading-snug">
              “{product.trend.title}”
            </p>
            <p className="mt-2 text-xs text-slate">
              Detected via {trendSourceLabel(product.trend.source)}
            </p>
            <div className="mt-5">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.14em] text-slate">
                <span>Trend momentum</span>
                <span>{product.trend.score}/100</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-mist">
                <div
                  className="h-full rounded-full bg-signal"
                  style={{ width: `${Math.min(100, Math.max(4, product.trend.score))}%` }}
                />
              </div>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-slate">
              We score signals on search traffic, news coverage and marketplace demand. Anything
              below our confidence threshold stays in draft.
            </p>
            <Link
              href="/trends/"
              className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] underline underline-offset-4"
            >
              Explore the radar
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-page py-14 md:py-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-signal-deep">Keep looking</p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">More from the edit.</h2>
            </div>
            <Link
              href="/shop/"
              className="hidden items-center gap-2 text-sm font-semibold underline underline-offset-4 sm:inline-flex"
            >
              Shop all
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((entry) => (
              <ProductCard key={entry.id} product={entry} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function MiniTrust({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white px-3 py-3">
      <div className="flex items-center gap-1.5 text-signal-deep">{icon}</div>
      <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate">{title}</p>
      <p className="mt-0.5 text-xs font-semibold leading-snug text-ink">{body}</p>
    </div>
  );
}
