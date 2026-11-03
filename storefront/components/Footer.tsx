import Link from "next/link";
import type { BrandConfig, LegalConfig } from "@/lib/types";
import { Logo } from "./Logo";
import {
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  TelegramIcon,
  TikTokIcon,
} from "./Icons";

interface FooterProps {
  brand: BrandConfig;
  legal: LegalConfig;
}

function whatsappHref(number: string): string {
  const digits = number.replace(/[^0-9]/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

export function Footer({ brand, legal }: FooterProps) {
  const whatsapp = whatsappHref(brand.whatsapp);

  return (
    <footer className="mt-24 border-t border-ink/10 bg-ink text-paper">
      <div className="container-page py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-paper/60">
              {brand.description}
            </p>
            <div className="mt-6 flex items-center gap-2">
              <a
                href="https://t.me/pulsecart"
                target="_blank"
                rel="noreferrer"
                aria-label="PulseCart on Telegram"
                className="grid h-9 w-9 place-items-center rounded-full border border-paper/15 text-paper/70 transition hover:border-acid hover:text-acid"
              >
                <TelegramIcon className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com/pulsecart101/"
                target="_blank"
                rel="noreferrer"
                aria-label="PulseCart on Instagram"
                className="grid h-9 w-9 place-items-center rounded-full border border-paper/15 text-paper/70 transition hover:border-acid hover:text-acid"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href="https://web.facebook.com/profile.php?id=61596123963849"
                target="_blank"
                rel="noreferrer"
                aria-label="PulseCart on Facebook"
                className="grid h-9 w-9 place-items-center rounded-full border border-paper/15 text-paper/70 transition hover:border-acid hover:text-acid"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href="https://www.tiktok.com/@pulsecart3"
                target="_blank"
                rel="noreferrer"
                aria-label="PulseCart on TikTok"
                className="grid h-9 w-9 place-items-center rounded-full border border-paper/15 text-paper/70 transition hover:border-acid hover:text-acid"
              >
                <TikTokIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          <FooterColumn
            title="Shop"
            links={[
              { href: "/shop/", label: "All products" },
              { href: "/trends/", label: "Trend radar" },
              { href: "/shop/#categories", label: "Categories" },
              { href: "/cart/", label: "Your cart" },
            ]}
          />

          <FooterColumn
            title="Company"
            links={[
              { href: "/about/", label: "About PulseCart" },
              { href: "/contact/", label: "Contact us" },
              { href: "/shipping/", label: "Shipping & returns" },
              { href: "/terms/", label: "Terms of sale" },
            ]}
          />

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-paper/60">Help</h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <a
                  href={`mailto:${brand.email}`}
                  className="inline-flex items-center gap-2 text-paper/70 transition hover:text-acid"
                >
                  <MailIcon className="h-4 w-4" />
                  {brand.email}
                </a>
              </li>
              <li>
                <Link href="/privacy/" className="text-paper/70 transition hover:text-acid">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href="/privacy/#paia" className="text-paper/70 transition hover:text-acid">
                  PAIA manual
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-paper/10 pt-7 text-xs text-paper/60 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {legal.companyName}. All prices in South African rand
            (ZAR).
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>{legal.address}</span>
            <span className="hidden h-1 w-1 rounded-full bg-paper/30 md:block" />
            <span>{legal.deliveryEstimate} delivery</span>
            <span className="hidden h-1 w-1 rounded-full bg-paper/30 md:block" />
            <span>{legal.returnsDays}-day returns</span>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-[11px] leading-relaxed text-paper/60">
          PulseCart curates and resells products from vetted suppliers. Product colours and
          finishes may vary slightly between batches. We never invent reviews, stock counts or
          discounts.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div>
      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-paper/60">{title}</h3>
      <ul className="mt-5 space-y-3 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-paper/70 transition hover:text-acid">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
