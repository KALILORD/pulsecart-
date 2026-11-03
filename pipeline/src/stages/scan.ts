import path from "node:path";
import { config, TRENDS_DIR } from "../config";
import { log, warn } from "../lib/log";
import { writeJson } from "../lib/store";
import { clamp, jaccard, normalizeWhitespace } from "../lib/text";
import { categoryRule, deriveQuery, inferCategory, isBlocked, isProductCandidate, matchEvent } from "../lib/taxonomy";
import { collectTrends } from "../sources";
import type { Trend } from "../types";

function mergeSignals(trends: Trend[]): Trend[] {
  const merged: Trend[] = [];

  for (const trend of [...trends].sort((a, b) => b.score - a.score)) {
    const duplicate = merged.find(
      (existing) =>
        normalizeWhitespace(existing.title).toLowerCase() ===
          normalizeWhitespace(trend.title).toLowerCase() ||
        jaccard(existing.keywords, trend.keywords) >= 0.65,
    );

    if (!duplicate) {
      merged.push({ ...trend, signals: [...trend.signals] });
      continue;
    }

    const previousScore = duplicate.score;
    duplicate.score = clamp(Math.max(previousScore, trend.score) + 3, 0, 100);
    duplicate.signals.push(...trend.signals);

    if (trend.score > previousScore) {
      duplicate.title = trend.title;
      duplicate.source = trend.source;
      duplicate.url = trend.url;
      duplicate.traffic = trend.traffic;
      duplicate.keywords = trend.keywords;
    }
  }

  return merged;
}

export async function scanStage(): Promise<Trend[]> {
  log("scan", "Collecting trend signals...");
  const raw = (await collectTrends()).filter((trend) => !isBlocked(trend.title));
  log("scan", `${raw.length} usable signals`);

  const merged = mergeSignals(raw);

  for (const trend of merged) {
    const event = matchEvent(trend.title);
    const category = event ? categoryRule(event.category) : inferCategory(trend.title);
    trend.category = category.id;
    trend.query = deriveQuery(trend.title, category);
    trend.event = event?.angle ?? trend.event;
    trend.eligible = isProductCandidate(trend.title);

    const sources = new Set(trend.signals.map((signal) => signal.source));
    if (sources.size > 1) {
      trend.score = clamp(trend.score + (sources.size - 1) * 6, 0, 100);
    }
  }

  merged.sort((a, b) => {
    const eligibleA = a.eligible ? 1 : 0;
    const eligibleB = b.eligible ? 1 : 0;
    return eligibleB - eligibleA || b.score - a.score;
  });
  const top = merged.slice(0, 60);
  const date = new Date().toISOString().slice(0, 10);

  writeJson(path.join(TRENDS_DIR, "latest.json"), top);
  writeJson(path.join(TRENDS_DIR, `${date}.json`), top);

  const eligible = top.filter((trend) => trend.eligible);
  const best = eligible[0];
  log(
    "scan",
    `${top.length} trends stored (${eligible.length} product-ready)`,
    best ? `top: "${best.title}" (${best.score.toFixed(0)})` : "no product-ready trends",
  );

  if (top.length === 0) {
    warn("scan", "No trends found. Sources may be blocked from this network.");
    warn("scan", `Minimum score for product research is ${config.pipeline.minTrendScore}.`);
  }

  return top;
}
