import Link from "next/link";
import { ArrowRightIcon, PulseIcon, SparkIcon } from "@/components/Icons";
import { getProducts } from "@/lib/data";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  const products = getProducts().slice(0, 3);

  return (
    <section className="relative overflow-hidden">
      <div className="paper-grid absolute inset-0 opacity-40" />
      <div className="container-page relative py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-ink">
            <PulseIcon className="h-8 w-8 text-acid" />
          </span>
          <p className="eyebrow mt-6 justify-center text-signal-deep">
            <SparkIcon className="h-3.5 w-3.5" />
            Error 404
          </p>
          <h1 className="mt-3 text-5xl font-bold sm:text-6xl">This drop moved on.</h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-slate">
            The page you are looking for is not here. It may have sold out, been renamed, or never
            existed. The current edit is still worth a look.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/shop/" className="btn-primary">
              Shop the drop
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link href="/" className="btn-ghost">
              Back home
            </Link>
          </div>
        </div>

        {products.length > 0 && (
          <div className="mx-auto mt-16 max-w-3xl">
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.16em] text-slate">
              Still live
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}/`}
                  className="group rounded-xl border border-ink/10 bg-white p-4 transition hover:border-ink"
                >
                  <p className="text-sm font-semibold leading-snug transition group-hover:text-signal-deep">
                    {product.title}
                  </p>
                  <p className="mt-1 text-xs text-slate">View product</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
