import md5 from "md5";

interface OrderItem {
  slug: string;
  title: string;
  quantity: number;
  priceZar: number;
  totalZar: number;
}

interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
}

interface OrderPayload {
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  customer: OrderCustomer;
  payment: "card" | "eft";
}

interface Env {
  // Ozow (primary — instant EFT, no card needed)
  OZOW_SITE_CODE?: string;
  OZOW_API_KEY?: string;
  OZOW_PRIVATE_KEY?: string;
  OZOW_IS_TEST?: string;
  // PayFast (fallback)
  PAYFAST_MERCHANT_ID?: string;
  PAYFAST_MERCHANT_KEY?: string;
  PAYFAST_PASSPHRASE?: string;
  PAYFAST_SANDBOX?: string;
  // Paystack (fallback)
  PAYSTACK_SECRET_KEY?: string;
}

type PagesContext = {
  request: Request;
  env: Record<string, string | undefined>;
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Cloudflare Pages Function: POST /api/checkout
 *
 * Creates a hosted payment request with the configured gateway and returns the
 * secure payment URL. Ozow (instant EFT) is preferred; PayFast and Paystack are
 * supported as fallbacks. Keys stay server-side — the buyer never sees them.
 */
export async function onRequestPost(context: PagesContext) {
  try {
    const payload = (await context.request.json()) as OrderPayload;

    // --- Validate ---
    if (!payload.items || payload.items.length === 0) {
      return json({ error: "No items in order." }, 400);
    }
    if (!payload.customer?.name || !payload.customer?.email) {
      return json({ error: "Customer details are required." }, 400);
    }
    if (!payload.total || payload.total <= 0) {
      return json({ error: "Invalid order total." }, 400);
    }

    const env = context.env as unknown as Env;

    // --- 1. Ozow (primary) ---
    if (env.OZOW_SITE_CODE && env.OZOW_API_KEY && env.OZOW_PRIVATE_KEY) {
      return await createOzowPayment(context, payload, {
        siteCode: env.OZOW_SITE_CODE,
        apiKey: env.OZOW_API_KEY,
        privateKey: env.OZOW_PRIVATE_KEY,
        isTest: env.OZOW_IS_TEST === "true",
      });
    }

    // --- 2. PayFast (fallback) ---
    if (env.PAYFAST_MERCHANT_ID && env.PAYFAST_MERCHANT_KEY) {
      return await createPayFastPayment(context, payload, {
        merchantId: env.PAYFAST_MERCHANT_ID,
        merchantKey: env.PAYFAST_MERCHANT_KEY,
        passphrase: env.PAYFAST_PASSPHRASE,
        sandbox: env.PAYFAST_SANDBOX === "true",
      });
    }

    // --- 3. Paystack (fallback) ---
    if (env.PAYSTACK_SECRET_KEY) {
      return await createPaystackPayment(
        context,
        payload,
        env.PAYSTACK_SECRET_KEY,
      );
    }

    // --- No gateway configured (dev only) ---
    return json(
      {
        success: true,
        orderId: `pc_${Date.now()}`,
        message:
          "Order received. No gateway configured — add OZOW_* variables to enable payments.",
      },
      200,
    );
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Checkout failed." },
      400,
    );
  }
}

/* -------------------------------------------------------------------------- */
/*  Ozow — instant EFT (Pay by Bank)                                           */
/* -------------------------------------------------------------------------- */

async function createOzowPayment(
  context: PagesContext,
  payload: OrderPayload,
  config: {
    siteCode: string;
    apiKey: string;
    privateKey: string;
    isTest: boolean;
  },
) {
  const origin = new URL(context.request.url).origin;
  const reference = `pc_${Date.now()}`;

  // Ozow hash fields must be concatenated in this exact order, with values only.
  // Amount must have exactly two decimals. Booleans must be "true"/"false".
  const fields: Array<string | number | boolean> = [
    config.siteCode,
    "ZA",
    "ZAR",
    payload.total.toFixed(2),
    reference,
    reference.replace(/[^a-zA-Z0-9 -]/g, "").slice(0, 30) || "PULSECART",
    payload.customer.name,
    `${origin}/checkout/cancel`,
    `${origin}/checkout/error`,
    `${origin}/checkout/success`,
    `${origin}/api/ozow/notify`,
    config.isTest ? "true" : "false",
  ];

  const concatenated = fields.map((field) => String(field)).join("") + config.privateKey;
  const hashCheck = await sha512Hex(concatenated.toLowerCase());

  const response = await fetch("https://api.ozow.com/postpaymentrequest", {
    method: "POST",
    headers: {
      ApiKey: config.apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      siteCode: config.siteCode,
      countryCode: "ZA",
      currencyCode: "ZAR",
      amount: payload.total.toFixed(2),
      transactionReference: reference,
      bankReference: reference.replace(/[^a-zA-Z0-9 -]/g, "").slice(0, 30) || "PULSECART",
      customer: payload.customer.name,
      cancelUrl: `${origin}/checkout/cancel`,
      errorUrl: `${origin}/checkout/error`,
      successUrl: `${origin}/checkout/success`,
      notifyUrl: `${origin}/api/ozow/notify`,
      isTest: config.isTest,
      hashCheck,
    }),
  });

  const data = (await response.json()) as {
    paymentRequestId?: string;
    url?: string | null;
    errorMessage?: string | null;
  };

  // Ozow returns HTTP 200 even for rejected requests — check for a URL.
  if (!data.url || data.errorMessage) {
    return json(
      { error: data.errorMessage || "Ozow payment request was rejected." },
      400,
    );
  }

  return json(
    {
      success: true,
      paymentUrl: data.url,
      orderId: reference,
      gateway: "ozow",
    },
    200,
  );
}

/** SHA-512 hash, returned as a lowercase hex string (Ozow hashCheck format). */
async function sha512Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-512", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/* -------------------------------------------------------------------------- */
/*  PayFast (fallback)                                                         */
/* -------------------------------------------------------------------------- */

async function createPayFastPayment(
  context: PagesContext,
  payload: OrderPayload,
  config: {
    merchantId: string;
    merchantKey: string;
    passphrase?: string;
    sandbox: boolean;
  },
) {
  const base = config.sandbox
    ? "https://sandbox.payfast.co.za/eng/process"
    : "https://www.payfast.co.za/eng/process";

  const origin = new URL(context.request.url).origin;

  const payfastPayload: Record<string, string> = {
    merchant_id: config.merchantId,
    merchant_key: config.merchantKey,
    return_url: `${origin}/checkout/success`,
    cancel_url: `${origin}/checkout/cancel`,
    notify_url: `${origin}/api/checkout/webhook/payfast`,
    name_first: payload.customer.name.split(" ")[0] || "",
    name_last: payload.customer.name.split(" ").slice(1).join(" ") || "",
    email_address: payload.customer.email,
    cell_number: payload.customer.phone,
    m_payment_id: `pc_${Date.now()}`,
    amount: payload.total.toFixed(2),
    item_name: payload.items.map((i) => i.title).join(", ") || "PulseCart order",
    item_description: `PulseCart order — ${payload.items.length} item(s)`,
    custom_str1: payload.customer.address,
    custom_str2: payload.customer.notes || "",
  };

  const signature = computePayFastSignature(payfastPayload, config.passphrase);
  const params = new URLSearchParams({ ...payfastPayload, signature });

  return json(
    {
      success: true,
      paymentUrl: `${base}?${params.toString()}`,
      orderId: payfastPayload.m_payment_id,
      gateway: "payfast",
    },
    200,
  );
}

/* -------------------------------------------------------------------------- */
/*  Paystack (fallback)                                                        */
/* -------------------------------------------------------------------------- */

async function createPaystackPayment(
  context: PagesContext,
  payload: OrderPayload,
  secretKey: string,
) {
  const origin = new URL(context.request.url).origin;

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: payload.customer.email,
      amount: Math.round(payload.total * 100),
      currency: "ZAR",
      reference: `pc_${Date.now()}`,
      callback_url: `${origin}/checkout/success`,
      metadata: {
        customer_name: payload.customer.name,
        customer_phone: payload.customer.phone,
        address: payload.customer.address,
        items: payload.items,
      },
    }),
  });

  const data = (await response.json()) as {
    status?: boolean;
    message?: string;
    data?: { authorization_url?: string; reference?: string };
  };

  if (!data.status || !data.data?.authorization_url) {
    return json(
      { error: data.message || "Paystack initialization failed." },
      400,
    );
  }

  return json(
    {
      success: true,
      paymentUrl: data.data.authorization_url,
      orderId: data.data.reference,
      gateway: "paystack",
    },
    200,
  );
}

/* -------------------------------------------------------------------------- */
/*  PayFast signature helpers                                                  */
/* -------------------------------------------------------------------------- */

function pfEncode(value: string): string {
  return encodeURIComponent(value.trim())
    .replace(/%20/g, "+")
    .replace(/[!'()*~]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

function computePayFastSignature(
  params: Record<string, string>,
  passphrase?: string,
): string {
  const lines = Object.entries(params)
    .filter(([key, value]) => key !== "signature" && value !== "")
    .map(([key, value]) => `${key}=${pfEncode(value)}`);

  if (passphrase) {
    lines.push(`passphrase=${pfEncode(passphrase)}`);
  }

  return md5(lines.join("&"));
}
