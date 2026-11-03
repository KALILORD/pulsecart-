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
  PAYFAST_MERCHANT_ID?: string;
  PAYFAST_MERCHANT_KEY?: string;
  PAYFAST_PASSPHRASE?: string;
  PAYFAST_SANDBOX?: string;
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
 * Receives a validated checkout order, creates a payment intent with the
 * configured gateway (PayFast or Paystack), and returns a payment URL.
 *
 * The customer is redirected to the gateway's secure hosted page — no
 * WhatsApp or email links are sent to the customer.
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
    const { PAYFAST_MERCHANT_ID, PAYFAST_MERCHANT_KEY, PAYSTACK_SECRET_KEY } =
      env;

    // --- Payment gateway selection ---
    // Prefer PayFast for South Africa (ZAR), fallback to Paystack.
    if (PAYFAST_MERCHANT_ID && PAYFAST_MERCHANT_KEY) {
      return await createPayFastPayment(context, payload, {
        merchantId: PAYFAST_MERCHANT_ID,
        merchantKey: PAYFAST_MERCHANT_KEY,
        passphrase: env.PAYFAST_PASSPHRASE,
        sandbox: env.PAYFAST_SANDBOX === "true",
      });
    }

    if (PAYSTACK_SECRET_KEY) {
      return await createPaystackPayment(context, payload, PAYSTACK_SECRET_KEY);
    }

    // --- No gateway configured ---
    // In development, return a mock success so the flow can be tested.
    return json(
      {
        success: true,
        orderId: `pc_${Date.now()}`,
        message:
          "Order received. No payment gateway configured — add PAYFAST_MERCHANT_ID or PAYSTACK_SECRET_KEY to enable automatic payments.",
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

  // PayFast requires a signature. This is computed server-side so the
  // customer never sees the merchant key.
  const signature = await computePayFastSignature(payfastPayload, config.passphrase);

  // Redirect the customer to PayFast's secure hosted payment page.
  const params = new URLSearchParams({
    ...payfastPayload,
    signature,
  });

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
      amount: Math.round(payload.total * 100), // Paystack uses kobo/cents
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

  const data = await response.json();

  if (!data.status) {
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

async function computePayFastSignature(
  params: Record<string, string>,
  passphrase?: string,
): Promise<string> {
  const keys = Object.keys(params).sort();
  const unsignedString = keys
    .map((key) => `${key}=${encodeURIComponent(params[key])}`)
    .join("&");
  const stringToSign = passphrase
    ? `${unsignedString}&passphrase=${passphrase}`
    : unsignedString;

  // PayFast uses MD5 for signatures. SHA-256 is used here as a placeholder;
  // replace with an MD5 implementation (e.g., js-md5) before production.
  const encoder = new TextEncoder();
  const data = encoder.encode(stringToSign);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
