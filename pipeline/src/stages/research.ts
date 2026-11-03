import path from "node:path";
import { confidenceRank, config, PRODUCTS_DIR, RESEARCH_DIR, TRENDS_DIR } from "../config";
import { log, warn } from "../lib/log";
import { listJson, readJson, writeJson } from "../lib/store";
import { roundToNearest99, shortHash, slugify, titleCase, truncate } from "../lib/text";
import { categoryRule } from "../lib/taxonomy";
import { bestOffer, discoverOffers } from "../suppliers";
import { cleanSupplierTitle } from "../suppliers/web";
import type { Product, ProductSupplier, ResearchReport, Trend } from "../types";

function smartTitle(value: string): string {
  const cleaned = cleanSupplierTitle(value);
  const letters = cleaned.replace(/[^a-zA-Z]/g, "");
  const shouty = letters.length > 0 && letters === letters.toUpperCase();
  const titled = shouty ? titleCase(cleaned) : cleaned;
  return truncate(titled, 68);
}

function productTitle(trend: Trend, supplierTitle: string): string {
  const candidate = smartTitle(supplierTitle);
  const generic =
    candidate.length < 14 ||
    /^(1pc|pc|new|hot|fashion|portable|multifunctional|high quality|202[0-9])/i.test(candidate);
  return generic ? titleCase(trend.query) : candidate;
}

function uniqueSlug(base: string, taken: Set<string>): string {
  const root = slugify(base);
  if (!taken.has(root)) return root;
  for (let index = 2; index < 100; index += 1) {
    const candidate = `${root}-${index}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${root}-${shortHash(base, 4)}`;
}

function retailPrice(costZar: number, shippingZar: number): number {
  const landed = costZar + shippingZar;
  const markup =
    landed < 200
      ? config.pipeline.markup.under200
      : landed < 500
        ? config.pipeline.markup.under500
        : config.pipeline.markup.over500;
  return roundToNearest99(landed * markup);
}

function initialCopy(trend: Trend, title: string, categoryLabel: string): Pick<Product, "tagline" | "description" | "bullets" | "seo"> {
  const category = categoryRule(trend.category);
  const reason = trend.event
    ? `It is the ${trend.event} moment everyone is talking about.`
    : `It is the product behind a trend that is climbing right now.`;

  return {
    tagline: `The ${categoryLabel.toLowerCase()} pick everyone is asking about.`,
    description: [
      `"${trend.title}" is everywhere right now. ${reason} This is the product at the centre of it.`,
      `A practical upgrade for everyday ${categoryLabel.toLowerCase()} — easy to use, easy to store, and priced for South Africa. We check the supplier, the landed cost, and the delivery window before it goes live.`,
      `Delivered nationwide in an estimated ${config.legal.deliveryEstimate}. Backed by our ${config.legal.returnsDays}-day returns policy.`,
    ],
    bullets: category.bullets,
    seo: {
      title: `${title} | ${config.brand.name}`,
      description: truncate(
        `${title} — trending in South Africa. ${config.brand.tagline} Delivered nationwide.`,
        155,
      ),
      keywords: [title, categoryLabel, "South Africa", "trending", ...trend.keywords.slice(0, 4)],
    },
  };
}

export async function researchStage(inputTrends?: Trend[]): Promise<Product[]> {
  const latest = inputTrends ?? readJson<Trend[]>(path.join(TRENDS_DIR, "latest.json"), []);
  const existing = listJson<Product>(PRODUCTS_DIR);
  const takenSlugs = new Set(existing.map((product) => product.slug));
  const coveredTrends = new Set(existing.map((product) => product.trend.id));
  const coveredTitles = new Set(existing.map((product) => product.title.toLowerCase()));

  const candidates = latest
    .filter(
      (trend) =>
        trend.eligible !== false &&
        trend.score >= config.pipeline.minTrendScore &&
        !coveredTrends.has(trend.id),
    )
    .slice(0, config.pipeline.dailyProductLimit);

  if (candidates.length === 0) {
    log("research", "No new trends above the score threshold. Nothing to research.");
    return existing;
  }

  const created: Product[] = [];
  const now = new Date().toISOString();

  for (const trend of candidates) {
    log("research", `Researching "${trend.title}" → query "${trend.query}"`);
    const discovery = await discoverOffers(trend);
    const chosen = bestOffer(discovery.offers, trend);
    const title = productTitle(trend, chosen.title);

    if (coveredTitles.has(title.toLowerCase())) {
      log("research", `Skipping duplicate product title "${title}"`);
      continue;
    }

    const supplier: ProductSupplier = {
      supplier: chosen.supplier,
      title: chosen.title,
      url: chosen.url,
      images: chosen.images,
      costZar: chosen.costZar,
      shippingZar: chosen.shippingZar,
      deliveryDays: chosen.deliveryDays,
      rating: chosen.rating,
      orders: chosen.orders,
      inStock: chosen.inStock,
      confidence: chosen.confidence,
      notes: chosen.notes,
      checkedAt: now,
    };

    const category = categoryRule(trend.category);
    const priceZar = retailPrice(supplier.costZar, supplier.shippingZar);
    const slug = uniqueSlug(title, takenSlugs);
    takenSlugs.add(slug);

    const publishable =
      config.pipeline.autoPublish &&
      confidenceRank[supplier.confidence] >= confidenceRank[config.pipeline.requireSupplierConfidence] &&
      Boolean(supplier.url) &&
      supplier.images.length > 0;

    const copy = initialCopy(trend, title, category.label);

    const product: Product = {
      id: `p_${shortHash(`${trend.id}:${slug}`, 10)}`,
      slug,
      title,
      tagline: copy.tagline,
      description: copy.description,
      bullets: copy.bullets,
      priceZar,
      currency: "ZAR",
      images: supplier.images,
      category: category.id,
      tags: [category.label, ...trend.keywords.slice(0, 4), "South Africa", "trending"],
      trend: {
        id: trend.id,
        title: trend.title,
        source: trend.source,
        score: Math.round(trend.score),
        event: trend.event,
      },
      supplier,
      seo: copy.seo,
      status: publishable ? "published" : "draft",
      createdAt: now,
      updatedAt: now,
    };

    writeJson(path.join(PRODUCTS_DIR, `${slug}.json`), product);
    created.push(product);
    coveredTitles.add(title.toLowerCase());

    const report: ResearchReport & { localLeads: typeof discovery.localLeads } = {
      generatedAt: now,
      trend,
      offers: discovery.offers,
      chosen,
      decision: publishable
        ? `Published automatically (${supplier.confidence} confidence, landed R${supplier.costZar + supplier.shippingZar}).`
        : `Saved as draft (${supplier.confidence} confidence). Verify supplier and image before publishing.`,
      localLeads: discovery.localLeads,
    };
    writeJson(path.join(RESEARCH_DIR, `${now.slice(0, 10)}-${slug}.json`), report);

    log(
      "research",
      `Draft "${title}" → R${product.priceZar}`,
      `${supplier.supplier} · cost R${supplier.costZar} + R${supplier.shippingZar} · ${supplier.confidence}`,
    );
  }

  if (candidates.length > 0 && created.length === 0) {
    warn("research", "All candidates were duplicates. Nothing created.");
  }

  return [...existing, ...created];
}
