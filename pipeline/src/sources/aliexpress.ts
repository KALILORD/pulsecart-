import { fetchAliExpressSearch } from "../lib/aliexpress";
import { clamp, shortHash, tokenize, truncate } from "../lib/text";
import { categoryRule, commercialScore, inferCategory, isBlocked, isProductCandidate } from "../lib/taxonomy";
import type { Trend } from "../types";

const QUERIES = [
  "trending gadgets",
  "home gadgets",
  "kitchen gadgets",
  "fitness accessories",
  "beauty tools",
  "pet accessories",
  "car accessories",
];

function scoreItem(sold: number, discount: number | undefined, freeShipping: boolean, title: string): number {
  const sales = clamp(Math.log10(sold + 1) * 5, 0, 20);
  const markdown = clamp((discount ?? 0) / 10, 0, 8);
  const shipping = freeShipping ? 3 : 0;
  return clamp(50 + sales + markdown + shipping + commercialScore(title), 0, 100);
}

export async function scanAliExpress(): Promise<Trend[]> {
  const results: Trend[] = [];
  const observedAt = new Date().toISOString();

  for (const query of QUERIES) {
    const items = await fetchAliExpressSearch(query, 24);
    if (items.length === 0) continue;

    for (const item of items) {
      if (isBlocked(item.title)) continue;

      const category = inferCategory(item.title);
      const eligible = isProductCandidate(item.title);
      const title = truncate(item.title, 90);
      const score = scoreItem(item.sold, item.discount, item.freeShipping, item.title);

      results.push({
        id: `t_${shortHash(`aliexpress:${item.productId}`, 10)}`,
        title,
        source: "aliexpress",
        geo: "GLOBAL",
        score,
        keywords: tokenize(item.title).slice(0, 8),
        query: truncate(item.title, 80),
        category: category.id,
        url: item.url,
        traffic: item.sold > 0 ? `${item.sold} sold` : undefined,
        eligible,
        observedAt,
        signals: [
          {
            source: "aliexpress",
            title,
            url: item.url,
            traffic: item.sold > 0 ? `${item.sold} sold` : undefined,
            score,
          },
        ],
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Keep the freshest, strongest 40 per source so one marketplace cannot swamp the feed.
  return results.sort((a, b) => b.score - a.score).slice(0, 40);
}
