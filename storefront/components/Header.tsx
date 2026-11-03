import Link from "next/link";
import { CartButton } from "./CartButton";
import { Logo } from "./Logo";

const NAV = [
  { href: "/shop/", label: "Shop" },
  { href: "/trends/", label: "Trend radar" },
  { href: "/about/", label: "About" },
  { href: "/contact/", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/90 backdrop-blur-md">
      <div className="bg-ink text-paper">
        <div className="container-page flex h-9 items-center justify-between gap-4 text-[11px] font-medium tracking-wide">
          <p className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-acid" />
            <span className="hidden sm:inline">Free delivery on orders over R500</span>
            <span className="sm:hidden">Free delivery over R500</span>
          </p>
          <p className="hidden text-paper/60 md:block">Trend found today. Packed in South Africa.</p>
          <p className="text-paper/80">7-day returns</p>
        </div>
      </div>

      <div className="container-page flex h-[4.5rem] items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Main navigation" className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate transition hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/shop/" className="btn-primary hidden h-11 px-5 py-0 sm:inline-flex">
            Shop the drop
          </Link>
          <CartButton />
        </div>
      </div>

      <nav
        aria-label="Mobile navigation"
        className="hide-scrollbar flex gap-5 overflow-x-auto border-t border-ink/5 px-5 py-2.5 md:hidden"
      >
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.12em] text-slate transition hover:text-ink"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
