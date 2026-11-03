"use client";

import { useState } from "react";
import { ProductImage } from "./ProductImage";
import { cx } from "@/lib/format";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const gallery = images.length > 0 ? images : [""];
  const [active, setActive] = useState(0);
  const current = gallery[active] ?? gallery[0] ?? "";

  return (
    <div className="grid gap-3 sm:grid-cols-[72px_1fr] sm:items-start">
      {gallery.length > 1 && (
        <div className="hide-scrollbar order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col">
          {gallery.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1} of ${gallery.length}`}
              aria-pressed={index === active}
              className={cx(
                "h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl border bg-mist transition",
                index === active ? "border-ink" : "border-transparent hover:border-ink/30",
              )}
            >
              <ProductImage src={image} alt="" className="h-full w-full" />
            </button>
          ))}
        </div>
      )}

      <div className="order-1 overflow-hidden rounded-[1.5rem] border border-ink/10 bg-mist sm:order-2">
        <div className="aspect-square">
          <ProductImage
            key={current}
            src={current}
            alt={title}
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            imageClassName="transition duration-500"
          />
        </div>
      </div>
    </div>
  );
}
