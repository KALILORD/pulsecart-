import { fetchText } from "./http";
import { normalizeWhitespace, slugify } from "./text";

export interface AliExpressItem {
  productId: string;
  title: string;
  image: string;
  salePrice: number;
  currency: string;
  originalPrice?: number;
  discount?: number;
  freeShipping: boolean;
  sold: number;
  url: string;
}

interface RawCard {
  productId?: string;
  productDetailUrl?: string;
  title?: { displayTitle?: string } | string;
  image?: { imgUrl?: string };
  prices?: {
    salePrice?: { minPrice?: number; currencyCode?: string; discount?: number };
    originalPrice?: { minPrice?: number };
  };
  sellingPoints?: Array<{ tagContent?: { tagText?: string } }>;
  trade?: { tradeDesc?: string };
}

function extractJsonPayload(html: string): unknown | null {
  const marker = "window._dida_config_._init_data_=";
  const markerIndex = html.indexOf(marker);
  if (markerIndex === -1) return null;

  const dataIndex = html.indexOf("data:", markerIndex);
  const braceStart = html.indexOf("{", dataIndex === -1 ? markerIndex : dataIndex);
  if (braceStart === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = braceStart; index < html.length; index += 1) {
    const char = html[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
    } else if (char === '"') {
      inString = true;
    } else if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(braceStart, index + 1)) as unknown;
        } catch {
          return null;
        }
      }
    }
  }

  return null;
}

function findItemList(node: unknown): RawCard[] | null {
  if (!node || typeof node !== "object") return null;

  if (Array.isArray(node)) {
    const first = node[0];
    if (
      first &&
      typeof first === "object" &&
      "productId" in first &&
      "prices" in first
    ) {
      return node as RawCard[];
    }
    for (const child of node) {
      const found = findItemList(child);
      if (found) return found;
    }
    return null;
  }

  for (const value of Object.values(node)) {
    const found = findItemList(value);
    if (found) return found;
  }
  return null;
}

function toNumber(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  const parsed = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function parseSold(description: unknown): number {
  if (!description) return 0;
  const match = String(description)
    .toLowerCase()
    .replace(/,/g, "")
    .match(/([\d.]+)\s*([km])?/);
  if (!match) return 0;
  let value = Number(match[1]);
  if (!Number.isFinite(value)) return 0;
  if (match[2] === "k") value *= 1_000;
  if (match[2] === "m") value *= 1_000_000;
  return Math.round(value);
}

function normalizeImage(value: unknown): string {
  const url = String(value ?? "").trim();
  if (!url) return "";
  return url.startsWith("//") ? `https:${url}` : url;
}

function toItem(card: RawCard): AliExpressItem | null {
  const productId = String(card.productId ?? "").trim();
  const rawTitle = typeof card.title === "string" ? card.title : card.title?.displayTitle;
  const title = normalizeWhitespace(String(rawTitle ?? ""));
  const salePrice = toNumber(card.prices?.salePrice?.minPrice);
  if (!productId || !title || !salePrice) return null;

  const image = normalizeImage(card.image?.imgUrl);
  const freeShipping = (card.sellingPoints ?? []).some((point) =>
    /free shipping/i.test(String(point.tagContent?.tagText ?? "")),
  );

  return {
    productId,
    title,
    image,
    salePrice,
    currency: String(card.prices?.salePrice?.currencyCode ?? "USD").toUpperCase(),
    originalPrice: toNumber(card.prices?.originalPrice?.minPrice),
    discount: toNumber(card.prices?.salePrice?.discount),
    freeShipping,
    sold: parseSold(card.trade?.tradeDesc),
    url: card.productDetailUrl?.startsWith("http")
      ? card.productDetailUrl
      : `https://www.aliexpress.com/item/${productId}.html`,
  };
}

export function parseAliExpressHtml(html: string): AliExpressItem[] {
  const payload = extractJsonPayload(html);
  if (!payload) return [];

  const cards = findItemList(payload);
  if (!cards) return [];

  return cards
    .map((card) => toItem(card))
    .filter((item): item is AliExpressItem => item !== null);
}

export async function fetchAliExpressSearch(query: string, limit = 60): Promise<AliExpressItem[]> {
  const slug = slugify(query, 80);
  const url = `https://www.aliexpress.com/w/wholesale-${slug}.html?SearchText=${encodeURIComponent(query)}`;
  const html = await fetchText(url, { timeoutMs: 30_000, retries: 0 });
  if (!html) return [];
  return parseAliExpressHtml(html).slice(0, limit);
}
