"use client";

import { useState } from "react";
import { cx } from "@/lib/format";
import { PulseIcon } from "./Icons";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
}

export function ProductImage({
  src,
  alt,
  className,
  imageClassName,
  priority = false,
  sizes,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={cx(
          "relative grid place-items-center overflow-hidden bg-ink text-paper",
          className,
        )}
        role="img"
        aria-label={alt}
      >
        <div className="paper-grid absolute inset-0 opacity-20" />
        <div className="relative flex flex-col items-center gap-2 px-6 text-center">
          <PulseIcon className="h-8 w-8 text-acid" />
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-acid">
            PulseCart
          </span>
          <span className="max-w-[14rem] text-xs leading-snug text-paper/60">{alt}</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      onError={() => setFailed(true)}
      className={cx("h-full w-full object-cover", imageClassName, className)}
    />
  );
}
