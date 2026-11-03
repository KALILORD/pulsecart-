import path from "node:path";
import { config, POSTS_DIR } from "../config";
import { log, warn } from "../lib/log";
import { readJson, writeJson } from "../lib/store";
import { publishBluesky } from "../channels/bluesky";
import { publishMastodon } from "../channels/mastodon";
import { publishTelegram } from "../channels/telegram";
import type { Channel, SocialPost } from "../types";

type Publisher = (post: SocialPost) => Promise<string>;

const PUBLISHERS: Partial<Record<Channel, Publisher>> = {
  telegram: publishTelegram,
  bluesky: publishBluesky,
  mastodon: publishMastodon,
};

export async function publishStage(): Promise<SocialPost[]> {
  const queuePath = path.join(POSTS_DIR, "queue.json");
  const queue = readJson<SocialPost[]>(queuePath, []);
  const queued = queue.filter((post) => post.status === "queued").sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));

  if (queued.length === 0) {
    log("publish", "No queued posts. Nothing to publish.");
    return queue;
  }

  const perChannel = config.pipeline.social.maxPostsPerChannelPerRun;
  const scheduled = new Map<Channel, number>();

  for (const post of queued) {
    const publisher = PUBLISHERS[post.channel];
    if (!publisher) continue;

    const count = scheduled.get(post.channel) ?? 0;
    if (count >= perChannel) continue;

    try {
      const externalId = await publisher(post);
      post.status = "published";
      post.publishedAt = new Date().toISOString();
      post.externalId = externalId;
      post.error = undefined;
      scheduled.set(post.channel, count + 1);
      log("publish", `${post.channel} · ${post.productSlug}`, externalId);
    } catch (error) {
      const message = (error as Error).message;
      if (/^Missing /.test(message)) {
        warn("publish", `${post.channel} skipped — credentials not configured`);
      } else {
        post.status = "failed";
        post.error = message;
        warn("publish", `${post.channel} failed for ${post.productSlug}`, message);
      }
    }
  }

  writeJson(queuePath, queue);
  const published = queue.filter((post) => post.status === "published").length;
  log("publish", `${published} total published, ${queue.filter((post) => post.status === "queued").length} still queued`);
  return queue;
}
