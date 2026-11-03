import { createHash } from "node:crypto";

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "been",
  "but",
  "by",
  "for",
  "from",
  "has",
  "have",
  "how",
  "in",
  "into",
  "is",
  "it",
  "its",
  "just",
  "new",
  "of",
  "on",
  "or",
  "our",
  "out",
  "over",
  "that",
  "the",
  "their",
  "this",
  "to",
  "up",
  "was",
  "what",
  "when",
  "where",
  "who",
  "why",
  "will",
  "with",
  "you",
  "your",
  "after",
  "before",
  "about",
  "says",
  "said",
  "amid",
  "could",
  "would",
  "should",
  "than",
  "then",
  "them",
  "they",
  "there",
  "here",
  "all",
  "any",
  "can",
  "get",
  "got",
  "make",
  "made",
]);

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function stripHtml(value: string): string {
  return normalizeWhitespace(
    value
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">"),
  );
}

export function tokenize(value: string): string[] {
  return stripHtml(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((word) => word.length >= 3 && !STOPWORDS.has(word) && !/^\d+$/.test(word));
}

export function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export function jaccard(a: string[], b: string[]): number {
  const left = new Set(a);
  const right = new Set(b);
  if (left.size === 0 && right.size === 0) return 1;
  let intersection = 0;
  for (const value of left) if (right.has(value)) intersection += 1;
  return intersection / (left.size + right.size - intersection);
}

export function slugify(value: string, maxLength = 60): string {
  const slug = stripHtml(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
  return slug || "product";
}

export function shortHash(value: string, length = 8): string {
  return createHash("sha1").update(value).digest("hex").slice(0, length);
}

export function truncate(value: string, maxLength: number): string {
  const text = normalizeWhitespace(value);
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, Math.max(0, maxLength - 1));
  const lastSpace = cut.lastIndexOf(" ");
  const body = lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${body.replace(/[\s,;:.-]+$/, "")}…`;
}

/** Truncate without collapsing line breaks (social captions). */
export function truncatePreserve(value: string, maxLength: number): string {
  const text = value.trim();
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, Math.max(0, maxLength - 1));
  const lastBreak = Math.max(cut.lastIndexOf("\n"), cut.lastIndexOf(" "));
  const body = lastBreak > maxLength * 0.5 ? cut.slice(0, lastBreak) : cut;
  return `${body.replace(/[\s,;:.-]+$/, "")}…`;
}

export function titleCase(value: string): string {
  const small = new Set(["a", "an", "and", "as", "at", "but", "by", "for", "in", "of", "on", "or", "the", "to", "with"]);
  return normalizeWhitespace(value)
    .toLowerCase()
    .split(" ")
    .map((word, index) => {
      if (index > 0 && small.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function roundToNearest99(value: number): number {
  const whole = Math.max(9, Math.round(value));
  return whole - 0.01;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
