import Link from "next/link";
import type { Product } from "@/lib/types";
import { categoryLabel } from "@/lib/categories";
import { cx, formatZar } from "@/lib/format";
import { AddToCart } from "./AddToCart";
import { ProductImage } from "./ProductImage";

interface ProductCardProps {
  product: Product;
  rank?: number;
  className?: string;
  priority?: boolean;
}

export function ProductCard({ product, rank, className, priority }: ProductCardProps) {
  return (
    <article className={cx("group", className)}>
      <div className="relative overflow-hidden rounded-[1.4rem] border border-ink/10 bg-mist">
        <Link
          href={`/products/${product.slug}/`}
          className="block aspect-square overflow-hidden"
          aria-label={product.title}
        >
          <ProductImage
            src={product.images[0] ?? ""}
            alt={product.title}
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            imageClassName="transition duration-700 ease-out group-hover:scale-[1.04]"
          />
        </Link>

        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-paper backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-acid" />
            Trending
          </span>
          {rank !== undefined && (
            <span className="grid h-6 min-w-6 place-items-center rounded-full bg-acid px-1.5 text-[10px] font-bold tabular-nums text-ink">
              #{rank}
            </span>
          )}
        </div>

        <div className="absolute bottom-3 right-3">
          <AddToCart product={product} variant="icon" className="shadow-lg shadow-ink/20" />
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-signal-deep">
            {categoryLabel(product.category)}
          </p>
          <h3 className="mt-1.5 text-[1.05rem] font-semibold leading-snug">
            <Link href={`/products/${product.slug}/`} className="transition hover:text-signal-deep">
              {product.title}
            </Link>
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate">{product.tagline}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-lg font-bold tracking-tight">{formatZar(product.priceZar)}</p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate">
            Incl. VAT
          </p>
        </div>
      </div>
    </article>
  );
}
