"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { ArrowRightIcon, MinusIcon, PlusIcon, ShieldIcon, TrashIcon, TruckIcon } from "@/components/Icons";
import { ProductImage } from "@/components/ProductImage";
import {
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING,
  cx,
  formatZar,
  shippingFor,
} from "@/lib/format";
import type { BrandConfig } from "@/lib/types";
import { whatsappLink } from "@/lib/contact";

interface CartClientProps {
  brand: BrandConfig;
}

export function CartClient({ brand }: CartClientProps) {
  const { items, hydrated, subtotal, count, setQuantity, removeItem, clear } = useCart();

  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const wa = whatsappLink(
    brand.whatsapp,
    "Hi PulseCart — I'd like to check out my cart. Could you help me complete the order?",
  );

  if (!hydrated) {
    return (
      <div className="grid gap-10 lg:grid-cols-[1.5fr_0.8fr]">
        <div className="space-y-4">
          {[0, 1].map((index) => (
            <div key={index} className="h-32 animate-pulse rounded-2xl border border-ink/10 bg-white" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl border border-ink/10 bg-white" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-ink/20 bg-white px-6 py-20 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-acid text-ink">
          <TruckIcon className="h-6 w-6" />
        </span>
        <h2 className="mt-5 font-display text-2xl font-bold">Your cart is empty.</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate">
          The next drop is only a few clicks away. Browse the current edit and add something worth
          keeping.
        </p>
        <Link href="/shop/" className="btn-primary mt-7">
          Shop the drop
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.5fr_0.8fr] lg:items-start">
      <div>
        <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-ink/10 px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate">
              {count} {count === 1 ? "item" : "items"}
            </p>
            <button
              type="button"
              onClick={clear}
              className="text-xs font-semibold text-slate underline underline-offset-4 transition hover:text-signal-deep"
            >
              Clear cart
            </button>
          </div>

          <ul className="divide-y divide-ink/10">
            {items.map((item) => (
              <li key={item.slug} className="flex gap-4 p-5">
                <Link
                  href={`/products/${item.slug}/`}
                  className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-ink/10 bg-mist sm:h-28 sm:w-28"
                >
                  <ProductImage src={item.image} alt={item.title} className="h-full w-full" />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/products/${item.slug}/`}
                        className="text-sm font-semibold leading-snug transition hover:text-signal-deep sm:text-base"
                      >
                        {item.title}
                      </Link>
                      <p className="mt-1 text-xs text-slate">{formatZar(item.priceZar)} each</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.slug)}
                      aria-label={`Remove ${item.title} from cart`}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate transition hover:bg-mist hover:text-signal-deep"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex h-10 items-center rounded-full border border-ink/15 bg-white px-1">
                      <button
                        type="button"
                        onClick={() => setQuantity(item.slug, item.quantity - 1)}
                        aria-label={`Decrease quantity of ${item.title}`}
                        className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-mist"
                      >
                        <MinusIcon className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-8 text-center text-sm font-bold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(item.slug, item.quantity + 1)}
                        aria-label={`Increase quantity of ${item.title}`}
                        className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-mist"
                      >
                        <PlusIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="font-display text-base font-bold tabular-nums">
                      {formatZar(item.priceZar * item.quantity)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 rounded-2xl border border-ink/10 bg-white p-5">
          <div className="flex items-center justify-between gap-4 text-xs font-semibold">
            <p className="text-slate">
              {remaining > 0 ? (
                <>
                  Add <span className="text-ink">{formatZar(remaining)}</span> for free delivery
                </>
              ) : (
                <span className="text-ink">Free delivery unlocked</span>
              )}
            </p>
            <p className="text-slate">{Math.round(progress)}%</p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-mist">
            <div
              className={cx(
                "h-full rounded-full transition-all duration-500",
                remaining > 0 ? "bg-signal" : "bg-ink",
              )}
              style={{ width: `${Math.max(4, progress)}%` }}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link href="/shop/" className="btn-ghost flex-1">
            Keep shopping
          </Link>
          <Link href="/checkout/" className="btn-primary flex-1">
            Checkout
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <aside className="rounded-2xl border border-ink/10 bg-white p-6 lg:sticky lg:top-40">
        <h2 className="font-display text-xl font-bold">Order summary</h2>

        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-slate">Subtotal</dt>
            <dd className="font-semibold tabular-nums">{formatZar(subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-slate">Delivery</dt>
            <dd className="font-semibold tabular-nums">
              {shipping === 0 ? (
                <span className="text-signal-deep">Free</span>
              ) : (
                formatZar(shipping)
              )}
            </dd>
          </div>
          {shipping > 0 && (
            <div className="flex items-center justify-between gap-4 text-xs text-slate">
              <dt>Standard delivery</dt>
              <dd>{formatZar(STANDARD_SHIPPING)} flat</dd>
            </div>
          )}
          <div className="flex items-center justify-between gap-4 border-t border-ink/10 pt-3">
            <dt className="font-semibold">Total</dt>
            <dd className="font-display text-2xl font-bold tabular-nums">{formatZar(total)}</dd>
          </div>
        </dl>

        <Link href="/checkout/" className="btn-signal mt-6 w-full">
          Continue to checkout
          <ArrowRightIcon className="h-4 w-4" />
        </Link>

        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost mt-3 w-full border-ink/20 text-sm"
          >
            Ask a question on WhatsApp
          </a>
        )}

        <div className="mt-6 space-y-3 border-t border-ink/10 pt-5 text-xs leading-relaxed text-slate">
          <p className="flex items-start gap-2">
            <TruckIcon className="mt-0.5 h-4 w-4 shrink-0 text-signal-deep" />
            {brand.market === "ZA" ? "Delivered nationwide in 7–14 working days." : "Tracked delivery."}
          </p>
          <p className="flex items-start gap-2">
            <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-signal-deep" />
            7-day returns on unused items in original packaging.
          </p>
        </div>

        <p className="mt-5 text-[11px] leading-relaxed text-slate">
          Prices include VAT. Delivery is calculated at checkout. Checkout is confirmed on
          WhatsApp before payment.
        </p>
      </aside>
    </div>
  );
}
