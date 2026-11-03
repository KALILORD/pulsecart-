import type { Metadata } from "next";
import Link from "next/link";
import { ShopClient } from "@/components/ShopClient";
import { SparkIcon } from "@/components/Icons";
import { CATEGORIES } from "@/lib/categories";
import { getProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Shop the drop",
  description:
    "Shop PulseCart's current edit of trending products, delivered nationwide across South Africa. Prices in ZAR.",
  alternates: { canonical: "/shop/" },
};

export default function ShopPage() {
  const products = getProducts();
  const categories = CATEGORIES.map((category) => ({
    id: category.id,
    label: category.label,
    count: products.filter((product) => product.category === category.id).length,
  })).filter((category) => category.count > 0);

  return (
    <>
      <section className="border-b border-ink/10 bg-white">
        <div className="container-page py-12 md:py-16">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow text-signal-deep">
                <SparkIcon className="h-3.5 w-3.5" />
                The full edit
              </p>
              <h1 className="mt-3 text-4xl font-bold sm:text-5xl lg:text-6xl">
                Shop the drop.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate">
                Every product here started as a live signal — a search spike, a news moment or a
                marketplace surge. We check the supplier, then bring it to you in rand.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm text-slate md:text-right">
              <p>
                <span className="font-display text-2xl font-bold text-ink">{products.length}</span>{" "}
                live {products.length === 1 ? "pick" : "picks"}
              </p>
              <p>Free delivery over R500</p>
              <Link href="/trends/" className="font-semibold text-ink underline underline-offset-4">
                See what is trending
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-10 md:py-14">
        <ShopClient products={products} categories={categories} />
      </section>
    </>
  );
}
