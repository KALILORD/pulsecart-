import { XMLParser } from "fast-xml-parser";
import { config } from "../config";
import { fetchText } from "../lib/http";
import { clamp, shortHash, tokenize } from "../lib/text";
import { commercialScore, inferCategory, isProductCandidate } from "../lib/taxonomy";
import type { Trend } from "../types";

interface TrendRssItem {
  title?: string;
  link?: string;
  pubDate?: string;
  approx_traffic?: string | number;
  news_item?: Array<{
    news_item_title?: string;
    news_item_url?: string;
    news_item_source?: string;
  }>;
}

interface TrendRssDoc {
  rss?: {
    channel?: {
      item?: TrendRssItem[];
    };
  };
}

function trafficBonus(traffic?: string | number): number {
  if (traffic === undefined) return 0;
  const numeric = Number(String(traffic).replace(/[^0-9]/g, ""));
  if (!numeric) return 0;
  return clamp(Math.log10(numeric) * 4, 0, 18);
}

export async function scanGoogleTrends(geo = config.pipeline.trendGeo): Promise<Trend[]> {
  const url = `https://trends.google.com/trending/rss?geo=${encodeURIComponent(geo)}`;
  const xml = await fetchText(url, { timeoutMs: 20_000 });
  if (!xml) return [];

  const parser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: true,
    parseTagValue: false,
    isArray: (name) => name === "item" || name === "news_item",
  });

  const doc = parser.parse(xml) as TrendRssDoc;
  const items = doc.rss?.channel?.item ?? [];
  const now = new Date().toISOString();

  return items
    .map((item): Trend | null => {
      const title = String(item.title ?? "").trim();
      if (!title) return null;

      const category = inferCategory(title);
      const traffic = item.approx_traffic === undefined ? undefined : String(item.approx_traffic);
      const score = clamp(70 + trafficBonus(traffic) + commercialScore(title), 0, 100);
      const news = item.news_item?.[0];

      return {
        id: `t_${shortHash(`google-trends:${title}`, 10)}`,
        title,
        source: "google-trends",
        geo,
        score,
        keywords: tokenize(title).slice(0, 8),
        query: title,
        event: news?.news_item_title,
        category: category.id,
        url: item.link ? String(item.link) : news?.news_item_url ? String(news.news_item_url) : undefined,
        traffic,
        eligible: isProductCandidate(title),
        observedAt: now,
        signals: [
          {
            source: "google-trends",
            title,
            url: item.link ? String(item.link) : undefined,
            traffic,
            score,
          },
        ],
      };
    })
    .filter((trend): trend is Trend => trend !== null);
}
