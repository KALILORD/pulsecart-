import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getConfig } from "@/lib/data";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export function generateMetadata(): Metadata {
  const site = getConfig();
  const base = site.brand.domain.replace(/\/+$/, "");

  return {
    metadataBase: new URL(base),
    title: {
      default: `${site.brand.name} — ${site.brand.tagline}`,
      template: `%s | ${site.brand.name}`,
    },
    description: site.brand.description,
    keywords: [
      "trending products South Africa",
      "online shopping South Africa",
      "PulseCart",
      "viral products",
      "ZAR",
    ],
    applicationName: site.brand.name,
    authors: [{ name: site.brand.name, url: base }],
    creator: site.brand.name,
    publisher: site.brand.name,
    openGraph: {
      type: "website",
      locale: "en_ZA",
      url: base,
      siteName: site.brand.name,
      title: `${site.brand.name} — ${site.brand.tagline}`,
      description: site.brand.description,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: site.brand.tagline }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${site.brand.name} — ${site.brand.tagline}`,
      description: site.brand.description,
      images: ["/og.png"],
    },
    robots: { index: true, follow: true },
    category: "shopping",
  };
}

export const viewport: Viewport = {
  themeColor: "#F7F5F0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const site = getConfig();

  return (
    <html lang="en-ZA" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-paper"
        >
          Skip to content
        </a>
        <CartProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer brand={site.brand} legal={site.legal} />
        </CartProvider>
      </body>
    </html>
  );
}
