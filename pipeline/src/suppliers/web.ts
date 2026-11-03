import { load } from "cheerio";
import { env } from "../config";
import { fetchAliExpressSearch } from "../lib/aliexpress";
import { fetchJson, fetchText } from "../lib/http";
import { clamp, normalizeWhitespace, stripHtml, unique } from "../lib/text";

export interface WebResult {
  title: string;
  url: string;
  snippet: string;
}

function decodeDuckDuckGoUrl(href: string): string {
  try {
    const url = new URL(href, "https://duckduckgo.com");
    const target = url.searchParams.get("uddg");
    return target ? decodeURIComponent(target) : url.toString();
  } catch {
    return href;
  }
}

export async function searchWeb(query: string, limit = 8): Promise<WebResult[]> {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}&kl=za-en`;
  const html = await fetchText(url, { timeoutMs: 20_000, retries: 1 });
  if (!html) return [];

  const $ = load(html);
  const results: WebResult[] = [];

  $(".result").each((_, element) => {
    if (results.length >= limit) return;
    const anchor = $(element).find("a.result__a").first();
    const title = normalizeWhitespace(anchor.text());
    const href = anchor.attr("href");
    const snippet = normalizeWhitespace($(element).find(".result__snippet").first().text());
    if (!title || !href) return;
    results.push({ title, url: decodeDuckDuckGoUrl(href), snippet: stripHtml(snippet) });
  });

  return results;
}

let fxCache: { rate: number; fetchedAt: number } | null = null;

export async function usdToZar(): Promise<number> {
  if (env.usdZarRate > 0) return env.usdZarRate;
  if (fxCache && Date.now() - fxCache.fetchedAt < 12 * 60 * 60 * 1000) return fxCache.rate;

  const data = await fetchJson<{ rates?: { ZAR?: number } }>("https://open.er-api.com/v6/latest/USD", {
    timeoutMs: 15_000,
    retries: 1,
  });
  const rate = data?.rates?.ZAR;
  const safe = typeof rate === "number" && rate > 5 && rate < 60 ? rate : 18.5;
  fxCache = { rate: safe, fetchedAt: Date.now() };
  return safe;
}

interface JsonLdOffer {
  price?: string | number;
  priceCurrency?: string;
  availability?: string;
}

interface JsonLdProduct {
  name?: string;
  image?: string | string[];
  offers?: JsonLdOffer | JsonLdOffer[];
}

function firstOffer(value: JsonLdProduct["offers"]): JsonLdOffer | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export interface ParsedProductPage {
  title: string;
  images: string[];
  price: number;
  currency: string;
  inStock: boolean;
}

export async function parseProductPage(url: string): Promise<ParsedProductPage | null> {
  const html = await fetchText(url, { timeoutMs: 25_000, retries: 0 });
  if (!html) return null;

  const $ = load(html);
  const title = normalizeWhitespace(
    $('meta[property="og:title"]').attr("content") ??
      $('meta[name="twitter:title"]').attr("content") ??
      $("title").text(),
  ).replace(/\s*\|\s*AliExpress.*$/i, "");

  const jsonLd: JsonLdProduct[] = [];
  $('script[type="application/ld+json"]').each((_, element) => {
    try {
      const parsed = JSON.parse($(element).text()) as JsonLdProduct | JsonLdProduct[];
      if (Array.isArray(parsed)) jsonLd.push(...parsed);
      else jsonLd.push(parsed);
    } catch {
      // Ignore malformed blocks.
    }
  });

  const product = jsonLd.find((entry) => entry.offers || entry.name) ?? null;
  const offer = firstOffer(product?.offers);

  const metaPrice =
    $('meta[property="product:price:amount"]').attr("content") ??
    $('meta[property="og:price:amount"]').attr("content") ??
    $('meta[itemprop="price"]').attr("content");
  const metaCurrency =
    $('meta[property="product:price:currency"]').attr("content") ??
    $('meta[property="og:price:currency"]').attr("content") ??
    $('meta[itemprop="priceCurrency"]').attr("content");

  const rawPrice = offer?.price ?? metaPrice;
  const price = typeof rawPrice === "number" ? rawPrice : Number(String(rawPrice ?? "").replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(price) || price <= 0) return null;

  const ogImage = $('meta[property="og:image"]').attr("content");
  const jsonImages = product?.image ? (Array.isArray(product.image) ? product.image : [product.image]) : [];
  const gallery = $('img[src*="alicdn"]')
    .map((_, element) => $(element).attr("src") ?? "")
    .get();

  const images = unique(
    [ogImage, ...jsonImages, ...gallery].filter(
      (value): value is string => typeof value === "string" && value.startsWith("http"),
    ),
  ).slice(0, 5);

  const availability = String(offer?.availability ?? "").toLowerCase();

  return {
    title: title || "Untitled product",
    images,
    price,
    currency: String(offer?.priceCurrency ?? metaCurrency ?? "USD").toUpperCase(),
    inStock: availability ? !availability.includes("outofstock") : true,
  };
}

export interface AliExpressOfferData {
  title: string;
  url: string;
  images: string[];
  costZar: number;
  inStock: boolean;
  confidence: "high" | "medium";
  orders?: number;
}

function toZar(price: number, currency: string, rate: number): number {
  if (currency === "ZAR") return price;
  if (currency === "EUR") return price * rate * 1.08;
  if (currency === "GBP") return price * rate * 1.27;
  return price * rate;
}

export async function searchAliExpress(query: string, limit = 4): Promise<AliExpressOfferData[]> {
  const items = await fetchAliExpressSearch(query, 16);
  if (items.length === 0) return [];

  const rate = await usdToZar();
  const offers: AliExpressOfferData[] = [];

  for (const item of items) {
    const costZar = Math.round(toZar(item.salePrice, item.currency, rate));
    if (costZar <= 0 || costZar > 20_000) continue;

    offers.push({
      title: item.title,
      url: item.url,
      images: item.image ? [item.image] : [],
      costZar,
      inStock: true,
      confidence: item.image ? "high" : "medium",
      orders: item.sold,
    });

    if (offers.length >= limit) break;
  }

  return offers;
}

export function estimateShipping(costZar: number): { shippingZar: number; deliveryDays: [number, number] } {
  const shippingZar = costZar >= 350 ? 0 : 65;
  return { shippingZar, deliveryDays: costZar >= 350 ? [7, 14] : [10, 18] };
}

export function cleanSupplierTitle(value: string): string {
  return normalizeWhitespace(
    value
      .replace(/free\s*shipping/gi, "")
      .replace(/hot\s*sale/gi, "")
      .replace(/new\s*arrival/gi, "")
      .replace(/dropshipping/gi, "")
      .replace(/wholesale/gi, "")
      .replace(/factory\s*price/gi, "")
      .replace(/high\s*quality/gi, "")
      .replace(/20(2[4-9]|3[0-9])/g, "")
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
      .replace(/\s{2,}/g, " ")
      .trim(),
  );
}

export function clampScore(value: number, min = 0, max = 100): number {
  return clamp(value, min, max);
}
