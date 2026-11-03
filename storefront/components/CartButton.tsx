"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { CartIcon } from "./Icons";
import { cx } from "@/lib/format";

export function CartButton({ className }: { className?: string }) {
  const { count, hydrated } = useCart();

  return (
    <Link
      href="/cart/"
      aria-label={`Cart ${hydrated ? count : 0} item${(hydrated ? count : 0) === 1 ? "" : "s"}`}
      className={cx(
        "relative inline-flex h-11 items-center gap-2 rounded-full border border-ink/15 bg-white/70 px-4 text-sm font-semibold text-ink transition hover:border-ink hover:bg-white",
        className,
      )}
    >
      <CartIcon className="h-[18px] w-[18px]" />
      <span className="hidden sm:inline">Cart</span>{" "}
      <span
        className={cx(
          "grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-bold tabular-nums",
          hydrated && count > 0 ? "bg-signal text-ink" : "bg-mist text-slate",
        )}
      >
        {hydrated ? count : 0}
      </span>
    </Link>
  );
}
