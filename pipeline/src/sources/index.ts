import { log, warn } from "../lib/log";
import { scanAliExpress } from "./aliexpress";
import { scanGoogleNews } from "./google-news";
import { scanGoogleTrends } from "./google-trends";
import { scanManual } from "./manual";
import { scanReddit } from "./reddit";
import type { Trend } from "../types";

export async function collectTrends(): Promise<Trend[]> {
  const manual = scanManual();
  const [googleTrends, reddit, news, aliExpress] = await Promise.allSettled([
    scanGoogleTrends(),
    scanReddit(),
    scanGoogleNews(),
    scanAliExpress(),
  ]);

  const trends: Trend[] = [...manual];
  const labels = ["google-trends", "reddit", "google-news", "aliexpress"] as const;
  const results = [googleTrends, reddit, news, aliExpress];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      trends.push(...result.value);
      log("sources", `${labels[index]}: ${result.value.length} trends`);
    } else {
      warn("sources", `${labels[index]} failed`, result.reason);
    }
  });

  log("sources", `manual: ${manual.length} trends`);

  return trends;
}
