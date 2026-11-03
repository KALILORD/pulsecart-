import { XMLParser } from "fast-xml-parser";
import { config } from "../config";
import { fetchText } from "../lib/http";
import { clamp, shortHash, tokenize } from "../lib/text";
import { commercialScore, inferCategory, isBlocked, isProductCandidate } from "../lib/taxonomy";
import type { Trend } from "../types";

interface NewsItem {
  title?: string;
  link?: string;
  pubDate?: string;
  source?: string | { "#text"?: string };
}

interface NewsDoc {
  rss?: { channel?: { item?: NewsItem[] } };
}

const QUERIES = [
  "TikTok made me buy it",
  "viral product",
  "must-have gadget",
  "trending product South Africa",
  "new gadget South Africa",
];

export async function scanGoogleNews(geo = config.pipeline.trendGeo): Promise<Trend[]> {
  const results: Trend[] = [];
  const now = Date.now();

  for (const query of QUERIES) {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-ZA&gl=${encodeURIComponent(geo)}&ceid=${encodeURIComponent(geo)}:en`;
    const xml = await fetchText(url, { timeoutMs: 20_000 });
    if (!xml) continue;

    const parser = new XMLParser({
      ignoreAttributes: false,
      removeNSPrefix: true,
      parseTagValue: false,
      isArray: (name) => name === "item",
    });

    const doc = parser.parse(xml) as NewsDoc;
    const items = doc.rss?.channel?.item ?? [];

    for (const item of items) {
      const rawTitle = String(item.title ?? "").trim();
      if (!rawTitle) continue;
      // Google News titles are usually "Headline - Source".
      const title = rawTitle.replace(/\s+-\s+[^-]{2,40}$/, "").trim();
      if (title.length < 20 || isBlocked(title)) continue;

      const published = item.pubDate ? Date.parse(String(item.pubDate)) : Number.NaN;
      const ageHours = Number.isFinite(published) ? (now - published) / 3_600_000 : 96;
      if (ageHours > 72) continue;

      const category = inferCategory(title);
      const recency = clamp(12 - ageHours / 6, 0, 12);
      const score = clamp(45 + recency + commercialScore(title), 0, 100);

      results.push({
        id: `t_${shortHash(`google-news:${title}`, 10)}`,
        title,
        source: "google-news",
        geo,
        score,
        keywords: tokenize(title).slice(0, 8),
        query: title,
        category: category.id,
        url: item.link ? String(item.link) : undefined,
        eligible: isProductCandidate(title),
        observedAt: new Date().toISOString(),
        signals: [
          {
            source: "google-news",
            title,
            url: item.link ? String(item.link) : undefined,
            score,
          },
        ],
      });
    }
  }

  return results;
}
