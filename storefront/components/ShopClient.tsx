"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { cx } from "@/lib/format";

interface ShopClientProps {
  products: Product[];
  categories: Array<{ id: string; label: string; count: number }>;
}

type SortKey = "trending" | "price-asc" | "price-desc" | "newest";

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "trending", label: "Trending first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "newest", label: "Newest first" },
];

export function ShopClient({ products, categories }: ShopClientProps) {
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortKey>("trending");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const inCategory = category === "all" || product.category === category;
      if (!inCategory) return false;
      if (!needle) return true;
      const haystack = [product.title, product.tagline, ...product.tags].join(" ").toLowerCase();
      return haystack.includes(needle);
    });

    return filtered.sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.priceZar - b.priceZar;
        case "price-desc":
          return b.priceZar - a.priceZar;
        case "newest":
          return b.createdAt.localeCompare(a.createdAt);
        default:
          return (b.trend?.score ?? 0) - (a.trend?.score ?? 0);
      }
    });
  }, [products, category, sort, query]);

  return (
    <div>
      <div className="flex flex-col gap-5 border-b border-ink/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
          <FilterPill
            active={category === "all"}
            onClick={() => setCategory("all")}
            label="All"
            count={products.length}
          />
          {categories.map((entry) => (
            <FilterPill
              key={entry.id}
              active={category === entry.id}
              onClick={() => setCategory(entry.id)}
              label={entry.label}
              count={entry.count}
            />
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block">
            <span className="sr-only">Search products</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search the drop…"
              className="field-input w-full pl-9 sm:w-56"
              type="search"
            />
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m16.5 16.5 4 4" strokeLinecap="round" />
            </svg>
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate">
            <span className="whitespace-nowrap">Sort</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="field-input w-full py-2.5 sm:w-44"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-slate">
        {visible.length} {visible.length === 1 ? "product" : "products"}
        {category !== "all" ? " in this category" : ""}
      </p>

      {visible.length > 0 ? (
        <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-2xl border border-dashed border-ink/20 px-6 py-16 text-center">
          <h2 className="font-display text-xl font-semibold">Nothing matches that search.</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate">
            Try a different category or clear the search. New products land as the trend radar
            picks them up.
          </p>
          <button
            type="button"
            onClick={() => {
              setCategory("all");
              setQuery("");
            }}
            className="btn-ghost mt-6"
          >
            Clear filters
          </button>
          <Link href="/trends/" className="ml-3 inline-block text-sm font-semibold underline underline-offset-4">
            See the radar
          </Link>
        </div>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition",
        active
          ? "border-ink bg-ink text-paper"
          : "border-ink/15 bg-white/60 text-slate hover:border-ink hover:text-ink",
      )}
    >
      {label}
      <span
        className={cx(
          "grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] tabular-nums",
          active ? "bg-acid text-ink" : "bg-mist text-slate",
        )}
      >
        {count}
      </span>
    </button>
  );
}
