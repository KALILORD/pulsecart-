import path from "node:path";
import { DATA_DIR } from "../config";
import { readJson } from "../lib/store";
import { clamp, shortHash, tokenize } from "../lib/text";
import { categoryRule, inferCategory } from "../lib/taxonomy";
import type { Trend } from "../types";

interface ManualTrend {
  title: string;
  query?: string;
  category?: string;
  score?: number;
  event?: string;
  url?: string;
}

/**
 * Human-curated opportunities. Edit data/trends/manual.json:
 * [{ "title": "Load shedding is back", "query": "rechargeable led lamp", "category": "home", "score": 92 }]
 */
export function scanManual(): Trend[] {
  const items = readJson<ManualTrend[]>(path.join(DATA_DIR, "trends", "manual.json"), []);
  const observedAt = new Date().toISOString();

  return items
    .filter((item) => typeof item.title === "string" && item.title.trim().length > 0)
    .map((item): Trend => {
      const category = item.category ? categoryRule(item.category) : inferCategory(item.title);
      const score = clamp(item.score ?? 85, 0, 100);
      const query = item.query?.trim() || item.title.trim();

      return {
        id: `t_${shortHash(`manual:${item.title}`, 10)}`,
        title: item.title.trim(),
        source: "manual",
        geo: "ZA",
        score,
        keywords: tokenize(item.title).slice(0, 8),
        query,
        event: item.event,
        category: category.id,
        url: item.url,
        eligible: true,
        observedAt,
        signals: [
          {
            source: "manual",
            title: item.title.trim(),
            url: item.url,
            score,
          },
        ],
      };
    });
}
