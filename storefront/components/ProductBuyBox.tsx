"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { AddToCart } from "./AddToCart";
import { MinusIcon, PlusIcon } from "./Icons";
import { formatZar } from "@/lib/format";

interface ProductBuyBoxProps {
  product: Product;
}

export function ProductBuyBox({ product }: ProductBuyBoxProps) {
  const [quantity, setQuantity] = useState(1);
  const total = product.priceZar * quantity;

  return (
    <div className="mt-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="inline-flex h-12 items-center justify-between rounded-full border border-ink/15 bg-white px-2 sm:w-36">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            aria-label="Decrease quantity"
            className="grid h-8 w-8 place-items-center rounded-full text-ink transition hover:bg-mist"
          >
            <MinusIcon className="h-4 w-4" />
          </button>
          <span className="min-w-7 text-center text-sm font-bold tabular-nums">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(20, value + 1))}
            aria-label="Increase quantity"
            className="grid h-8 w-8 place-items-center rounded-full text-ink transition hover:bg-mist"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>

        <AddToCart product={product} quantity={quantity} className="h-12 flex-1" />
      </div>

      <p className="mt-3 text-center text-[11px] leading-relaxed text-slate sm:text-left">
        Add to cart, then checkout to place your order. We will confirm stock and send payment
        instructions.
      </p>
    </div>
  );
}
