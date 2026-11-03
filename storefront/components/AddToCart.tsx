"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { useCart } from "./CartProvider";
import { CheckIcon, PlusIcon } from "./Icons";
import { cx } from "@/lib/format";

interface AddToCartProps {
  product: Product;
  quantity?: number;
  variant?: "full" | "compact" | "icon";
  className?: string;
}

export function AddToCart({ product, quantity = 1, variant = "full", className }: AddToCartProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const snapshot = {
    slug: product.slug,
    title: product.title,
    priceZar: product.priceZar,
    image: product.images[0] ?? "/placeholder.svg",
  };

  function handleAdd() {
    addItem(snapshot, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleAdd}
        aria-label={`Add ${product.title} to cart`}
        className={cx(
          "grid h-10 w-10 place-items-center rounded-full bg-ink text-paper transition hover:bg-signal",
          className,
        )}
      >
        {added ? <CheckIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
      </button>
    );
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleAdd}
        className={cx(
          "inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-xs font-semibold text-paper transition hover:bg-signal",
          className,
        )}
      >
        {added ? <CheckIcon className="h-3.5 w-3.5" /> : <PlusIcon className="h-3.5 w-3.5" />}
        {added ? "Added" : "Add"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={cx("btn-signal w-full sm:w-auto", className)}
    >
      {added ? <CheckIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
      {added ? "Added to cart" : "Add to cart"}
    </button>
  );
}
