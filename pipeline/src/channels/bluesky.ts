import { env } from "../config";
import { postJson } from "../lib/http";
import type { SocialPost } from "../types";

interface SessionResponse {
  accessJwt?: string;
  did?: string;
  message?: string;
}

interface RecordResponse {
  uri?: string;
  message?: string;
}

function linkFacet(text: string, url: string): unknown | null {
  const start = text.indexOf(url);
  if (start === -1) return null;
  const byteStart = Buffer.byteLength(text.slice(0, start), "utf8");
  const byteEnd = byteStart + Buffer.byteLength(url, "utf8");
  return {
    index: { byteStart, byteEnd },
    features: [{ $type: "app.bsky.richtext.facet#link", uri: url }],
  };
}

export async function publishBluesky(post: SocialPost): Promise<string> {
  if (!env.blueskyHandle || !env.blueskyAppPassword) {
    throw new Error("Missing BLUESKY_HANDLE or BLUESKY_APP_PASSWORD");
  }

  const session = await postJson<SessionResponse>(
    "https://bsky.social/xrpc/com.atproto.server.createSession",
    {
      identifier: env.blueskyHandle,
      password: env.blueskyAppPassword,
    },
  );

  if (!session?.accessJwt || !session.did) {
    throw new Error(session?.message ?? "Bluesky session failed");
  }

  const facet = linkFacet(post.text, post.url);
  const record: Record<string, unknown> = {
    $type: "app.bsky.feed.post",
    text: post.text,
    createdAt: new Date().toISOString(),
    langs: ["en-ZA"],
  };

  if (facet) record.facets = [facet];

  const response = await postJson<RecordResponse>(
    "https://bsky.social/xrpc/com.atproto.repo.createRecord",
    {
      repo: session.did,
      collection: "app.bsky.feed.post",
      record,
    },
    { headers: { authorization: `Bearer ${session.accessJwt}` } },
  );

  if (!response?.uri) throw new Error(response?.message ?? "Bluesky post failed");
  return response.uri;
}
