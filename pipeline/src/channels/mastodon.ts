import { env } from "../config";
import { postJson } from "../lib/http";
import type { SocialPost } from "../types";

interface MastodonResponse {
  id?: string;
  url?: string;
  error?: string;
}

function instanceUrl(): string {
  const instance = env.mastodonInstance;
  if (!instance) return "";
  return instance.startsWith("http") ? instance : `https://${instance}`;
}

export async function publishMastodon(post: SocialPost): Promise<string> {
  const base = instanceUrl();
  if (!base || !env.mastodonToken) {
    throw new Error("Missing MASTODON_INSTANCE or MASTODON_TOKEN");
  }

  const response = await postJson<MastodonResponse>(
    `${base}/api/v1/statuses`,
    { status: post.text, visibility: "public" },
    { headers: { authorization: `Bearer ${env.mastodonToken}` } },
  );

  if (!response?.id) throw new Error(response?.error ?? "Mastodon rejected the post");
  return response.url ?? response.id;
}
