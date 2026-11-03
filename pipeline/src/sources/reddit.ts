import { env } from "../config";
import { fetchJson } from "../lib/http";
import { log } from "../lib/log";
import { clamp, shortHash, tokenize } from "../lib/text";
import { commercialScore, inferCategory, isBlocked, isProductCandidate } from "../lib/taxonomy";
import type { Trend } from "../types";

interface RedditPost {
  title?: string;
  permalink?: string;
  ups?: number;
  upvote_ratio?: number;
  num_comments?: number;
  created_utc?: number;
  subreddit?: string;
  stickied?: boolean;
  over_18?: boolean;
  selftext?: string;
}

interface RedditListing {
  data?: { children?: Array<{ data?: RedditPost }> };
}

interface TokenResponse {
  access_token?: string;
  expires_in?: number;
}

const SUBREDDITS = [
  "southafrica",
  "capetown",
  "johannesburg",
  "deals",
  "gadgets",
  "BuyItForLife",
  "shutupandtakemymoney",
  "INEEEEDIT",
  "ProductPorn",
];

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string | null> {
  if (!env.redditClientId || !env.redditClientSecret) return null;
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;

  const basic = Buffer.from(`${env.redditClientId}:${env.redditClientSecret}`).toString("base64");

  try {
    const response = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      signal: AbortSignal.timeout(15_000),
      headers: {
        authorization: `Basic ${basic}`,
        "content-type": "application/x-www-form-urlencoded",
        "user-agent": env.redditUserAgent,
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      log("reddit", `OAuth failed (${response.status})`);
      return null;
    }

    const data = (await response.json()) as TokenResponse;
    if (!data.access_token) return null;

    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 - 60_000,
    };
    return data.access_token;
  } catch (error) {
    log("reddit", "OAuth request failed", (error as Error).message);
    return null;
  }
}

async function scanSubreddit(subreddit: string, token: string): Promise<Trend[]> {
  const url = `https://oauth.reddit.com/r/${encodeURIComponent(subreddit)}/rising?limit=30&raw_json=1`;
  const listing = await fetchJson<RedditListing>(url, {
    timeoutMs: 15_000,
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token}`,
      "user-agent": env.redditUserAgent,
    },
  });
  const children = listing?.data?.children ?? [];
  const nowSeconds = Date.now() / 1000;
  const observedAt = new Date().toISOString();

  return children
    .map((child): Trend | null => {
      const post = child.data;
      if (!post?.title) return null;
      if (post.stickied || post.over_18) return null;
      if (post.created_utc && nowSeconds - post.created_utc > 60 * 60 * 48) return null;
      if (post.title.length < 15) return null;
      if (isBlocked(post.title)) return null;

      const category = inferCategory(post.title);
      const ups = post.ups ?? 0;
      const ratio = post.upvote_ratio ?? 0.5;
      const comments = post.num_comments ?? 0;
      const score = clamp(
        45 + Math.log10(ups + 1) * 6 + ratio * 10 + Math.log10(comments + 1) * 2 + commercialScore(post.title),
        0,
        100,
      );

      return {
        id: `t_${shortHash(`reddit:${subreddit}:${post.title}`, 10)}`,
        title: post.title,
        source: "reddit",
        geo: "ZA",
        score,
        keywords: tokenize(post.title).slice(0, 8),
        query: post.title,
        category: category.id,
        url: post.permalink ? `https://www.reddit.com${post.permalink}` : undefined,
        eligible: isProductCandidate(post.title),
        observedAt,
        signals: [
          {
            source: "reddit",
            title: post.title,
            url: post.permalink ? `https://www.reddit.com${post.permalink}` : undefined,
            score,
          },
        ],
      };
    })
    .filter((trend): trend is Trend => trend !== null);
}

export async function scanReddit(): Promise<Trend[]> {
  if (!env.redditClientId || !env.redditClientSecret) {
    log("reddit", "Skipped — set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET to enable");
    return [];
  }

  const token = await getToken();
  if (!token) return [];

  const results: Trend[] = [];

  for (const subreddit of SUBREDDITS) {
    try {
      results.push(...(await scanSubreddit(subreddit, token)));
    } catch {
      // Rate limit or blocked; other sources still run.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  return results;
}
