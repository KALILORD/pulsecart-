import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon } from "@/components/Icons";
import { ProductCard } from "@/components/ProductCard";
import { categoryMeta } from "@/lib/categories";
import { getProducts } from "@/lib/data";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  const ids = Array.from(new Set(getProducts().map((product) => product.category)));
  return ids.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = categoryMeta(slug);
  return {
    title: meta.label,
    description: `${meta.blurb} Shop ${meta.label.toLowerCase()} picks from PulseCart, delivered across South Africa.`,
    alternates: { canonical: `/category/${slug}/` },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const meta = categoryMeta(slug);
  const products = getProducts().filter((product) => product.category === slug);

  if (products.length === 0) notFound();

  return (
    <>
      <section className="border-b border-ink/10 bg-white">
        <div className="container-page py-12 md:py-16">
          <Link
            href="/shop/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate transition hover:text-ink"
          >
            <ArrowRightIcon className="h-3.5 w-3.5 rotate-180" />
            Back to shop
          </Link>
          <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow text-signal-deep">Category edit</p>
              <h1 className="mt-3 text-4xl font-bold sm:text-5xl">{meta.label}</h1>
              <p className="mt-4 max-w-xl text-slate">{meta.blurb}</p>
            </div>
            <p className="text-sm font-semibold text-slate">
              {products.length} {products.length === 1 ? "product" : "products"}
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-12 md:py-16">
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}
