import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AppConfig, Confidence } from "./types";

/** Repository root (…/pulsecart). */
export const ROOT = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
export const DATA_DIR = path.join(ROOT, "data");
export const TRENDS_DIR = path.join(DATA_DIR, "trends");
export const PRODUCTS_DIR = path.join(DATA_DIR, "products");
export const POSTS_DIR = path.join(DATA_DIR, "posts");
export const RESEARCH_DIR = path.join(DATA_DIR, "research");
export const STATE_FILE = path.join(DATA_DIR, "state.json");

function loadConfig(): AppConfig {
  const file = path.join(DATA_DIR, "config.json");
  try {
    return JSON.parse(readFileSync(file, "utf8")) as AppConfig;
  } catch (error) {
    throw new Error(`Cannot read ${file}: ${(error as Error).message}`);
  }
}

export const config = loadConfig();

const str = (value: string | undefined): string => value?.trim() ?? "";

export const env = {
  geminiApiKey: str(process.env.GEMINI_API_KEY),
  geminiModel: str(process.env.GEMINI_MODEL) || "gemini-2.5-flash",
  groqApiKey: str(process.env.GROQ_API_KEY),
  groqModel: str(process.env.GROQ_MODEL) || "llama-3.3-70b-versatile",
  openrouterApiKey: str(process.env.OPENROUTER_API_KEY),
  openrouterModel:
    str(process.env.OPENROUTER_MODEL) || "meta-llama/llama-3.3-70b-instruct:free",
  telegramBotToken: str(process.env.TELEGRAM_BOT_TOKEN),
  telegramChatId: str(process.env.TELEGRAM_CHAT_ID),
  blueskyHandle: str(process.env.BLUESKY_HANDLE),
  blueskyAppPassword: str(process.env.BLUESKY_APP_PASSWORD),
  redditClientId: str(process.env.REDDIT_CLIENT_ID),
  redditClientSecret: str(process.env.REDDIT_CLIENT_SECRET),
  redditUserAgent: str(process.env.REDDIT_USER_AGENT) || "web:pulsecart:v0.1 (by /u/pulsecart)",
  mastodonInstance: str(process.env.MASTODON_INSTANCE).replace(/\/+$/, ""),
  mastodonToken: str(process.env.MASTODON_TOKEN),
  usdZarRate: Number(process.env.USD_ZAR_RATE) || 0,
};

export type AiProvider = "gemini" | "groq" | "openrouter" | "none";

export const aiProvider: AiProvider = env.geminiApiKey
  ? "gemini"
  : env.groqApiKey
    ? "groq"
    : env.openrouterApiKey
      ? "openrouter"
      : "none";

export const confidenceRank: Record<Confidence, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

export function productUrl(slug: string, channel?: string): string {
  const base = config.brand.domain.replace(/\/+$/, "");
  const url = `${base}/products/${slug}/`;
  if (!channel) return url;
  return `${url}?utm_source=${encodeURIComponent(channel)}&utm_medium=social&utm_campaign=${encodeURIComponent(slug)}`;
}
