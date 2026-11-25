/**
 * Cloudflare Pages Function: POST /api/ozow/notify
 *
 * Ozow posts payment notifications here. We verify the SHA512 HashCheck using
 * the merchant private key (never exposed to the browser), then acknowledge.
 * Order status is confirmed by email/SMS from Ozow to the merchant.
 */

interface Env {
  OZOW_PRIVATE_KEY?: string;
}

type PagesContext = {
  request: Request;
  env: Record<string, string | undefined>;
};

function text(data: string, status = 200): Response {
  return new Response(data, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

/** Concatenation order of Ozow notification fields (excluding Hash). */
const NOTIFY_FIELDS = [
  "SiteCode",
  "TransactionReference",
  "BankReference",
  "Amount",
  "Status",
  "Message",
  "CardNumber",
  "CardHolderName",
  "TransactionDate",
  " PaymentRequestId",
] as const;

async function sha512Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-512",
    new TextEncoder().encode(input),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function onRequestPost(context: PagesContext) {
  const privateKey = context.env.OZOW_PRIVATE_KEY;
  if (!privateKey) {
    return text("OK", 200); // Nothing to verify without a configured key.
  }

  try {
    const body = (await context.request.json()) as Record<string, unknown>;
    const received = typeof body.Hash === "string" ? body.Hash : "";

    const fields = NOTIFY_FIELDS.map((field) => {
      const key = field.trim() in body ? field.trim() : field;
      const value = body[key];
      return value === undefined || value === null ? "" : String(value);
    });

    const expected = await sha512Hex(
      (fields.join("") + privateKey).toLowerCase(),
    );

    if (!constantTimeEqual(expected.toLowerCase(), received.toLowerCase())) {
      return text("Invalid hash", 401);
    }

    // Hash valid — payment notification is genuine. Ozow expects "OK".
    return text("OK", 200);
  } catch {
    return text("Invalid body", 400);
  }
}
