import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Product, SiteConfig, Trend } from "./types";

const FALLBACK_CONFIG: SiteConfig = {
  brand: {
    name: "PulseCart",
    tagline: "What's trending. Delivered.",
    description:
      "South Africa's trend-driven store. We watch what the internet is talking about, find the products behind the hype, and deliver them to your door.",
    domain: "https://pulsecart.pages.dev",
    email: "hello@pulsecart.co.za",
    whatsapp: "",
    currency: "ZAR",
    market: "ZA",
    locale: "en-ZA",
  },
  legal: {
    companyName: "PulseCart (Pty) Ltd",
    registrationNumber: "TODO",
    address: "Johannesburg, South Africa",
    returnsDays: 7,
    deliveryEstimate: "7-14 working days",
  },
};

function resolveDataDir(): string {
  const candidates = [
    path.resolve(process.cwd(), "..", "data"),
    path.resolve(process.cwd(), "data"),
    path.resolve(process.cwd(), "..", "..", "data"),
  ];

  return candidates.find((candidate) => existsSync(path.join(candidate, "products"))) ?? candidates[0]!;
}

export const DATA_DIR = resolveDataDir();
const PRODUCTS_DIR = path.join(DATA_DIR, "products");
const TRENDS_FILE = path.join(DATA_DIR, "trends", "latest.json");

function readJson<T>(file: string): T | null {
  try {
    return JSON.parse(readFileSync(file, "utf8")) as T;
  } catch {
    return null;
  }
}

let productsCache: Product[] | null = null;

export function getConfig(): SiteConfig {
  const config = readJson<Partial<SiteConfig>>(path.join(DATA_DIR, "config.json"));
  if (!config?.brand || !config.legal) return FALLBACK_CONFIG;
  return {
    brand: { ...FALLBACK_CONFIG.brand, ...config.brand },
    legal: { ...FALLBACK_CONFIG.legal, ...config.legal },
  };
}

export function getAllProducts(): Product[] {
  if (productsCache) return productsCache;
  if (!existsSync(PRODUCTS_DIR)) return [];

  const products = readdirSync(PRODUCTS_DIR)
    .filter((name) => name.endsWith(".json"))
    .map((name) => readJson<Product>(path.join(PRODUCTS_DIR, name)))
    .filter((product): product is Product => {
      if (!product || typeof product.slug !== "string" || !Array.isArray(product.images)) return false;
      return product.status === "published" || product.demo === true;
    });

  productsCache = products.sort((a, b) => {
    const score = (b.trend?.score ?? 0) - (a.trend?.score ?? 0);
    if (score !== 0) return score;
    return a.title.localeCompare(b.title);
  });

  return productsCache;
}

export const getProducts = getAllProducts;

export function getProductSlugs(): string[] {
  return getAllProducts().map((product) => product.slug);
}

export function getProductBySlug(slug: string): Product | undefined {
  return getAllProducts().find((product) => product.slug === slug);
}

export function getFeaturedProduct(): Product | undefined {
  return getAllProducts()[0];
}

export function getRelatedProducts(product: Product, limit = 3): Product[] {
  return getAllProducts()
    .filter((candidate) => candidate.slug !== product.slug)
    .sort((a, b) => {
      const aMatch = a.category === product.category ? 1 : 0;
      const bMatch = b.category === product.category ? 1 : 0;
      return bMatch - aMatch || (b.trend?.score ?? 0) - (a.trend?.score ?? 0);
    })
    .slice(0, limit);
}

export function getAllTrends(): Trend[] {
  return readJson<Trend[]>(TRENDS_FILE) ?? [];
}

export function getTrendRadar(limit = 8): Trend[] {
  return getAllTrends()
    .filter((trend) => trend.eligible !== false && trend.score >= 55)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getProductImage(product: Product): string {
  return product.images.find(Boolean) ?? "/placeholder.svg";
}

export function absoluteUrl(site: SiteConfig, pathname: string): string {
  const base = site.brand.domain.replace(/\/+$/, "");
  const suffix = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${suffix}`;
}
