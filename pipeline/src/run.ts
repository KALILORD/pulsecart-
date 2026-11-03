import { STATE_FILE, config } from "./config";
import { aiLabel } from "./lib/ai";
import { fail, log } from "./lib/log";
import { writeJson } from "./lib/store";
import { contentStage } from "./stages/content";
import { publishStage } from "./stages/publish";
import { researchStage } from "./stages/research";
import { scanStage } from "./stages/scan";
import type { PipelineState, Trend } from "./types";

type Mode = "all" | "scan" | "research" | "content" | "publish";

const MODES: Mode[] = ["all", "scan", "research", "content", "publish"];

function parseMode(): Mode {
  const value = (process.argv[2] ?? "all").toLowerCase();
  if (MODES.includes(value as Mode)) return value as Mode;
  throw new Error(`Unknown mode "${value}". Use one of: ${MODES.join(", ")}`);
}

async function main(): Promise<void> {
  const mode = parseMode();
  const state: PipelineState = {
    lastRun: new Date().toISOString(),
    mode,
    counts: {},
    errors: [],
  };

  log("pipeline", `${config.brand.name} · mode=${mode} · AI=${aiLabel()}`);
  log("pipeline", `Market ${config.brand.market} · currency ${config.brand.currency} · geo ${config.pipeline.trendGeo}`);

  let trends: Trend[] | undefined;

  if (mode === "all" || mode === "scan") {
    try {
      const result = await scanStage();
      trends = result;
      state.counts.trends = result.length;
    } catch (error) {
      fail("scan", "Stage failed", error);
      state.errors.push(`scan: ${(error as Error).message}`);
    }
  }

  if (mode === "all" || mode === "research") {
    try {
      const result = await researchStage(trends);
      state.counts.products = result.length;
    } catch (error) {
      fail("research", "Stage failed", error);
      state.errors.push(`research: ${(error as Error).message}`);
    }
  }

  if (mode === "all" || mode === "content") {
    try {
      const result = await contentStage();
      state.counts.copy = result.length;
    } catch (error) {
      fail("content", "Stage failed", error);
      state.errors.push(`content: ${(error as Error).message}`);
    }
  }

  if (mode === "all" || mode === "publish") {
    try {
      const result = await publishStage();
      state.counts.published = result.filter((post) => post.status === "published").length;
    } catch (error) {
      fail("publish", "Stage failed", error);
      state.errors.push(`publish: ${(error as Error).message}`);
    }
  }

  writeJson(STATE_FILE, state);
  log("pipeline", "Run complete", state.counts);

  if (state.errors.length > 0) {
    fail("pipeline", `${state.errors.length} stage error(s)`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  fail("pipeline", "Fatal error", error);
  process.exitCode = 1;
});
