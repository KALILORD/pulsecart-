"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { AddToCart } from "./AddToCart";
import { MailIcon, MinusIcon, PlusIcon, WhatsAppIcon } from "./Icons";
import { formatZar } from "@/lib/format";
import { whatsappLink } from "@/lib/contact";

interface ProductBuyBoxProps {
  product: Product;
  whatsapp: string;
  email: string;
  domain: string;
}

export function ProductBuyBox({ product, whatsapp, email, domain }: ProductBuyBoxProps) {
  const [quantity, setQuantity] = useState(1);
  const total = product.priceZar * quantity;
  const productUrl = `${domain.replace(/\/+$/, "")}/products/${product.slug}/`;

  const message = [
    `Hi PulseCart — I'd like to order:`,
    ``,
    `${quantity} × ${product.title}`,
    `Total: ${formatZar(total)}`,
    ``,
    productUrl,
  ].join("\n");

  const wa = whatsappLink(whatsapp, message);
  const orderHref =
    wa ||
    `mailto:${email}?subject=${encodeURIComponent(`Order: ${product.title}`)}&body=${encodeURIComponent(message)}`;

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

      <a
        href={orderHref}
        target={wa ? "_blank" : undefined}
        rel={wa ? "noreferrer" : undefined}
        className="btn-ghost mt-3 h-12 w-full border-ink/20 text-sm"
      >
        {wa ? <WhatsAppIcon className="h-4 w-4" /> : <MailIcon className="h-4 w-4" />}
        {wa ? "Order on WhatsApp" : "Order by email"}
      </a>

      <p className="mt-3 text-center text-[11px] leading-relaxed text-slate sm:text-left">
        {wa
          ? "Checkout is confirmed on WhatsApp. We check stock, then send a secure payment link."
          : "Checkout is confirmed by email. We check stock, then send a secure payment link."}
      </p>
    </div>
  );
}
