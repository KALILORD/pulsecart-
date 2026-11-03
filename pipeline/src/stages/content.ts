import path from "node:path";
import { aiJson, aiLabel, aiEnabled } from "../lib/ai";
import { config, POSTS_DIR, PRODUCTS_DIR, productUrl } from "../config";
import { log, warn } from "../lib/log";
import { listJson, readJson, writeJson } from "../lib/store";
import { shortHash, truncate, truncatePreserve, unique } from "../lib/text";
import { categoryRule, hashtagsFor } from "../lib/taxonomy";
import type {
  Channel,
  GeneratedContent,
  Product,
  SocialCopy,
  SocialPost,
} from "../types";

const URL_TOKEN = "{{URL}}";

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function asStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const values = value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
  return values.length > 0 ? values : fallback;
}

function templateContent(product: Product): GeneratedContent {
  const category = categoryRule(product.category);
  const hashtags = hashtagsFor(category);
  const trendLine = product.trend.event
    ? `It is the ${product.trend.event} moment everyone is talking about.`
    : `"${product.trend.title}" is climbing right now.`;

  const social: SocialCopy = {
    telegram: [
      `🔥 ${product.title}`,
      "",
      product.tagline,
      "",
      trendLine,
      "",
      ...product.bullets.slice(0, 3).map((bullet) => `✅ ${bullet}`),
      "",
      `R${product.priceZar.toFixed(0)} · delivered in ${config.legal.deliveryEstimate}`,
      `👉 ${URL_TOKEN}`,
    ].join("\n"),
    bluesky: `🔥 ${product.title} — ${product.tagline} R${product.priceZar.toFixed(0)}. ${URL_TOKEN}`,
    mastodon: `🔥 ${product.title}\n\n${product.tagline}\n\n${trendLine}\n\nR${product.priceZar.toFixed(0)} · ${config.legal.deliveryEstimate}\n${URL_TOKEN}`,
    pinterest: `${product.title}: ${product.tagline} Shop the trend in South Africa from R${product.priceZar.toFixed(0)}. ${URL_TOKEN}`,
    instagram: `${product.title} 🔥\n\n${product.tagline}\n\n${trendLine}\n\n${product.bullets
      .slice(0, 4)
      .map((bullet) => `• ${bullet}`)
      .join("\n")}\n\nR${product.priceZar.toFixed(0)} · ${config.legal.deliveryEstimate}\nLink in bio.\n\n${hashtags}`,
    tiktok: `${product.title} 🔥 ${product.tagline} R${product.priceZar.toFixed(0)}. ${hashtags}`,
    x: `🔥 ${product.title} — ${product.tagline} R${product.priceZar.toFixed(0)}. ${URL_TOKEN}`,
  };

  return {
    title: product.title,
    tagline: product.tagline,
    description: product.description,
    bullets: product.bullets,
    seo: product.seo,
    social,
  };
}

function buildPrompt(product: Product): string {
  const category = categoryRule(product.category);

  return `Write the launch copy for a product on PulseCart, a South African trend-driven online store.

FACTS (do not invent numbers, reviews, or claims):
- Trend: "${product.trend.title}"
- Trend source: ${product.trend.source} (momentum score ${product.trend.score}/100)
- Cultural angle: ${product.trend.event ?? "general trend"}
- Category: ${category.label}
- Working product title: ${product.title}
- Retail price: R${product.priceZar.toFixed(0)} (ZAR, tax inclusive)
- Supplier: ${product.supplier.supplier}
- Supplier landed cost: R${product.supplier.costZar + product.supplier.shippingZar} (never reveal this)
- Estimated delivery: ${product.supplier.deliveryDays[0]}-${product.supplier.deliveryDays[1]} working days
- Returns: ${config.legal.returnsDays} days
- Market: South Africa

RULES:
- South African English. Prices in rand with a capital R (e.g. R349).
- Honest, confident, a little playful. No fake urgency, no fake reviews, no "best ever" claims.
- Title max 65 characters, sentence case, no supplier spam or ALL CAPS.
- Tagline max 90 characters.
- Description: exactly 3 short paragraphs. First paragraph hooks into the trend. Second explains the product and who it is for. Third covers delivery and returns.
- Bullets: exactly 5, each max 90 characters, benefit-led.
- SEO title max 60 characters. SEO description max 155 characters.
- Social copy must include the literal token ${URL_TOKEN} exactly once.
- Channel limits: telegram <= 800 chars, bluesky <= 280, mastodon <= 480, pinterest <= 480, instagram <= 2000 (include hashtags), tiktok <= 2000 (include hashtags), x <= 260.
- Instagram and TikTok should include 5-8 relevant South African hashtags.

Return ONLY valid JSON in this shape:
{
  "title": "string",
  "tagline": "string",
  "description": ["string", "string", "string"],
  "bullets": ["string", "string", "string", "string", "string"],
  "seo": { "title": "string", "description": "string", "keywords": ["string"] },
  "social": {
    "telegram": "string",
    "bluesky": "string",
    "mastodon": "string",
    "pinterest": "string",
    "instagram": "string",
    "tiktok": "string",
    "x": "string"
  }
}`;
}

function normalizeGenerated(product: Product, generated: GeneratedContent | null): GeneratedContent {
  const fallback = templateContent(product);
  if (!generated) return fallback;

  const pick = (channel: Channel): string =>
    asString(generated.social?.[channel], fallback.social[channel]);

  return {
    title: truncate(asString(generated.title, fallback.title), 65),
    tagline: truncate(asString(generated.tagline, fallback.tagline), 90),
    description: asStringArray(generated.description, fallback.description).slice(0, 3),
    bullets: asStringArray(generated.bullets, fallback.bullets).slice(0, 5),
    seo: {
      title: truncate(asString(generated.seo?.title, fallback.seo.title), 60),
      description: truncate(asString(generated.seo?.description, fallback.seo.description), 155),
      keywords: unique(
        Array.isArray(generated.seo?.keywords)
          ? generated.seo.keywords.filter((value): value is string => typeof value === "string")
          : fallback.seo.keywords,
      ).slice(0, 10),
    },
    social: {
      telegram: pick("telegram"),
      bluesky: pick("bluesky"),
      mastodon: pick("mastodon"),
      pinterest: pick("pinterest"),
      instagram: pick("instagram"),
      tiktok: pick("tiktok"),
      x: pick("x"),
    },
  };
}

function composeWithinLimit(body: string, url: string, limit: number): string {
  const tokenIndex = body.indexOf(URL_TOKEN);

  if (tokenIndex === -1) {
    const room = Math.max(20, limit - url.length - 2);
    return `${truncatePreserve(body, room)}\n${url}`;
  }

  const before = body.slice(0, tokenIndex);
  const after = body.slice(tokenIndex + URL_TOKEN.length);
  const room = Math.max(20, limit - url.length - after.length - 1);
  const head = truncatePreserve(before, room).replace(/\s+$/, "");
  const separator = head.length === 0 || head.endsWith("\n") ? "" : " ";
  return `${head}${separator}${url}${after}`;
}

function queueForProduct(product: Product, content: GeneratedContent, queue: SocialPost[]): SocialPost[] {
  const channels = Object.keys(config.channels) as Channel[];
  const limits = config.pipeline.social.captionLength;
  const scheduled = new Date();
  const added: SocialPost[] = [];

  channels.forEach((channel, index) => {
    const channelConfig = config.channels[channel];
    const exists = queue.some(
      (post) => post.productId === product.id && post.channel === channel && post.status !== "failed",
    );
    if (exists) return;

    const url = productUrl(product.slug, channel);
    const automatic = channelConfig.enabled && channelConfig.mode !== "manual";
    const text = composeWithinLimit(content.social[channel], url, limits[channel]);

    added.push({
      id: `post_${shortHash(`${product.id}:${channel}`, 10)}`,
      productId: product.id,
      productSlug: product.slug,
      channel,
      text,
      imageUrl: product.images[0],
      url,
      status: automatic ? "queued" : "manual",
      scheduledFor: new Date(scheduled.getTime() + index * 15 * 60 * 1000).toISOString(),
    });
  });

  return added;
}

export async function contentStage(): Promise<Product[]> {
  const products = listJson<Product>(PRODUCTS_DIR).filter(
    (product) => product.status !== "archived" && !product.demo,
  );
  const queuePath = path.join(POSTS_DIR, "queue.json");
  const queue = readJson<SocialPost[]>(queuePath, []);

  if (products.length === 0) {
    log("content", "No pipeline products to write. (Demo products are left untouched.)");
    return [];
  }

  log("content", `Writing copy for ${products.length} product(s) with ${aiEnabled() ? aiLabel() : "templates"}`);

  for (const product of products) {
    const generated = aiEnabled() ? await aiJson<GeneratedContent>(buildPrompt(product)) : null;
    if (aiEnabled() && !generated) {
      warn("content", `AI unavailable for "${product.title}", using templates`);
    }

    const content = normalizeGenerated(product, generated);
    const updated: Product = {
      ...product,
      title: content.title,
      tagline: content.tagline,
      description: content.description,
      bullets: content.bullets,
      seo: content.seo,
      updatedAt: new Date().toISOString(),
    };

    writeJson(path.join(PRODUCTS_DIR, `${product.slug}.json`), updated);
    const posts = queueForProduct(updated, content, queue);
    queue.push(...posts);
    log("content", `Updated "${updated.title}"`, `${posts.length} new posts queued`);
  }

  queue.sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));
  writeJson(queuePath, queue);
  return products;
}
