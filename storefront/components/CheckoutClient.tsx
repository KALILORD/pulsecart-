"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { useCart } from "@/components/CartProvider";
import {
  ArrowRightIcon,
  CheckIcon,
  MailIcon,
  ShieldIcon,
  TruckIcon,
  WhatsAppIcon,
} from "@/components/Icons";
import { ProductImage } from "@/components/ProductImage";
import { whatsappLink } from "@/lib/contact";
import { cx, formatZar, shippingFor } from "@/lib/format";
import type { BrandConfig, LegalConfig } from "@/lib/types";

interface CheckoutClientProps {
  brand: BrandConfig;
  legal: LegalConfig;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  street: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  notes: string;
  payment: "card" | "eft";
  consent: boolean;
}

const PROVINCES = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Free State",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
];

const INITIAL_STATE: FormState = {
  name: "",
  email: "",
  phone: "",
  street: "",
  suburb: "",
  city: "",
  province: "Gauteng",
  postalCode: "",
  notes: "",
  payment: "card",
  consent: false,
};

type Errors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): Errors {
  const errors: Errors = {};
  if (form.name.trim().length < 2) errors.name = "Please enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    errors.email = "Enter a valid email address.";
  const digits = form.phone.replace(/[^0-9]/g, "");
  if (digits.length < 9) errors.phone = "Enter a valid South African mobile number.";
  if (form.street.trim().length < 3) errors.street = "Enter your street address.";
  if (form.suburb.trim().length < 2) errors.suburb = "Enter your suburb.";
  if (form.city.trim().length < 2) errors.city = "Enter your city or town.";
  if (!/^[0-9]{4}$/.test(form.postalCode.trim())) errors.postalCode = "Enter a 4-digit postal code.";
  if (!form.consent) errors.consent = "Please accept the terms to continue.";
  return errors;
}

export function CheckoutClient({ brand, legal }: CheckoutClientProps) {
  const { items, hydrated, subtotal, count } = useCart();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  const orderLines = useMemo(
    () =>
      items.map(
        (item) =>
          `${item.quantity} × ${item.title} — ${formatZar(item.priceZar * item.quantity)}`,
      ),
    [items],
  );

  const message = useMemo(() => {
    const address = [
      form.street,
      form.suburb,
      form.city,
      form.province,
      form.postalCode,
    ]
      .filter((part) => part.trim())
      .join(", ");

    return [
      "Hi PulseCart — I'd like to place an order.",
      "",
      "ORDER",
      ...orderLines,
      "",
      `Subtotal: ${formatZar(subtotal)}`,
      `Delivery: ${shipping === 0 ? "Free" : formatZar(shipping)}`,
      `Total: ${formatZar(total)}`,
      "",
      "DELIVERY DETAILS",
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone}`,
      `Address: ${address}`,
      form.notes.trim() ? `Notes: ${form.notes}` : "",
      "",
      `Payment preference: ${form.payment === "card" ? "Card payment link" : "EFT / bank transfer"}`,
      "",
      "Please confirm stock and send payment instructions.",
    ]
      .filter((line, index, lines) => !(line === "" && lines[index - 1] === ""))
      .join("\n");
  }, [form, orderLines, shipping, subtotal, total]);

  const wa = whatsappLink(brand.whatsapp, message);
  const mailto = `mailto:${brand.email}?subject=${encodeURIComponent(
    `PulseCart order — ${form.name || "new order"}`,
  )}&body=${encodeURIComponent(message)}`;
  const handoff = wa || mailto;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      window.setTimeout(() => {
        document.querySelector<HTMLElement>("[data-invalid='true']")?.focus();
      }, 0);
      return;
    }
    setSubmitted(true);
    if (wa) {
      window.open(wa, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = mailto;
    }
  }

  if (!hydrated) {
    return (
      <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="h-[32rem] animate-pulse rounded-2xl border border-ink/10 bg-white" />
        <div className="h-80 animate-pulse rounded-2xl border border-ink/10 bg-white" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-ink/20 bg-white px-6 py-20 text-center">
        <h2 className="font-display text-2xl font-bold">There is nothing to check out yet.</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate">
          Add a product to your cart first, then come back here to complete your order.
        </p>
        <Link href="/shop/" className="btn-primary mt-7">
          Shop the drop
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr] lg:items-start">
        <div className="rounded-[1.5rem] border border-ink/10 bg-white p-7 sm:p-10">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-acid text-ink">
            <CheckIcon className="h-7 w-7" />
          </span>
          <h2 className="mt-6 font-display text-3xl font-bold">Order ready to send.</h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate">
            Your order summary has been prepared. If the message did not open automatically, use the
            button below to send it to us. We will confirm stock and reply with payment
            instructions.
          </p>

          <div className="mt-6 rounded-2xl border border-ink/10 bg-paper p-5">
            <pre className="whitespace-pre-wrap break-words font-sans text-xs leading-relaxed text-ink/80">
              {message}
            </pre>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={handoff}
              target={wa ? "_blank" : undefined}
              rel={wa ? "noreferrer" : undefined}
              className="btn-primary flex-1"
            >
              {wa ? <WhatsAppIcon className="h-4 w-4" /> : <MailIcon className="h-4 w-4" />}
              {wa ? "Send on WhatsApp" : "Send by email"}
            </a>
            <Link href="/cart/" className="btn-ghost flex-1">
              Back to cart
            </Link>
          </div>

          <p className="mt-4 text-[11px] leading-relaxed text-slate">
            No payment has been taken. Orders are confirmed manually so we can check stock before
            you pay.
          </p>
        </div>

        <OrderSummary
          items={items}
          subtotal={subtotal}
          shipping={shipping}
          total={total}
          count={count}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr] lg:items-start">
      <div className="space-y-6">
        <section className="rounded-2xl border border-ink/10 bg-white p-6 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold">1. Your details</h2>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate">
              Required
            </span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" error={errors.name} htmlFor="name">
              <input
                id="name"
                name="name"
                autoComplete="name"
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                className={cx("field-input", errors.name && "border-signal")}
                data-invalid={Boolean(errors.name)}
                placeholder="Thandi Mokoena"
              />
            </Field>
            <Field label="Email address" error={errors.email} htmlFor="email">
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
                className={cx("field-input", errors.email && "border-signal")}
                data-invalid={Boolean(errors.email)}
                placeholder="you@example.co.za"
              />
            </Field>
            <Field label="Mobile / WhatsApp" error={errors.phone} htmlFor="phone" className="sm:col-span-2">
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(event) => update("phone", event.target.value)}
                className={cx("field-input", errors.phone && "border-signal")}
                data-invalid={Boolean(errors.phone)}
                placeholder="082 123 4567"
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-ink/10 bg-white p-6 sm:p-7">
          <h2 className="font-display text-xl font-bold">2. Delivery address</h2>
          <p className="mt-1 text-sm text-slate">We deliver anywhere in South Africa.</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field
              label="Street address"
              error={errors.street}
              htmlFor="street"
              className="sm:col-span-2"
            >
              <input
                id="street"
                name="street"
                autoComplete="address-line1"
                value={form.street}
                onChange={(event) => update("street", event.target.value)}
                className={cx("field-input", errors.street && "border-signal")}
                data-invalid={Boolean(errors.street)}
                placeholder="12 Rose Street, Unit 4"
              />
            </Field>
            <Field label="Suburb" error={errors.suburb} htmlFor="suburb">
              <input
                id="suburb"
                name="suburb"
                autoComplete="address-line2"
                value={form.suburb}
                onChange={(event) => update("suburb", event.target.value)}
                className={cx("field-input", errors.suburb && "border-signal")}
                data-invalid={Boolean(errors.suburb)}
                placeholder="Rosebank"
              />
            </Field>
            <Field label="City / town" error={errors.city} htmlFor="city">
              <input
                id="city"
                name="city"
                autoComplete="address-level2"
                value={form.city}
                onChange={(event) => update("city", event.target.value)}
                className={cx("field-input", errors.city && "border-signal")}
                data-invalid={Boolean(errors.city)}
                placeholder="Johannesburg"
              />
            </Field>
            <Field label="Province" htmlFor="province">
              <select
                id="province"
                name="province"
                autoComplete="address-level1"
                value={form.province}
                onChange={(event) => update("province", event.target.value)}
                className="field-input"
              >
                {PROVINCES.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Postal code" error={errors.postalCode} htmlFor="postalCode">
              <input
                id="postalCode"
                name="postalCode"
                inputMode="numeric"
                autoComplete="postal-code"
                value={form.postalCode}
                onChange={(event) => update("postalCode", event.target.value)}
                className={cx("field-input", errors.postalCode && "border-signal")}
                data-invalid={Boolean(errors.postalCode)}
                placeholder="2196"
                maxLength={4}
              />
            </Field>
            <Field
              label="Delivery notes (optional)"
              htmlFor="notes"
              className="sm:col-span-2"
            >
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={form.notes}
                onChange={(event) => update("notes", event.target.value)}
                className="field-input resize-y"
                placeholder="Gate code, complex name, or anything the courier should know."
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-ink/10 bg-white p-6 sm:p-7">
          <h2 className="font-display text-xl font-bold">3. Payment</h2>
          <p className="mt-1 text-sm text-slate">
            No card details are collected here. We confirm stock first, then send a secure payment
            link.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <PaymentOption
              active={form.payment === "card"}
              onSelect={() => update("payment", "card")}
              title="Card payment link"
              body="Visa, Mastercard and instant EFT via a secure link."
            />
            <PaymentOption
              active={form.payment === "eft"}
              onSelect={() => update("payment", "eft")}
              title="EFT / bank transfer"
              body="We send banking details with your order reference."
            />
          </div>

          <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(event) => update("consent", event.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-[#101418]"
              data-invalid={Boolean(errors.consent)}
            />
            <span className="text-slate">
              I agree to the{" "}
              <Link href="/terms/" className="font-semibold text-ink underline underline-offset-2">
                terms of sale
              </Link>{" "}
              and{" "}
              <Link href="/privacy/" className="font-semibold text-ink underline underline-offset-2">
                privacy policy
              </Link>
              . I understand this is an order request, not a completed purchase.
            </span>
          </label>
          {errors.consent && <p className="mt-2 text-xs font-semibold text-signal-deep">{errors.consent}</p>}
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="submit" className="btn-signal h-12 flex-1">
            Review order on {wa ? "WhatsApp" : "email"}
            <ArrowRightIcon className="h-4 w-4" />
          </button>
          <Link href="/cart/" className="btn-ghost h-12 flex-1">
            Back to cart
          </Link>
        </div>
        <p className="text-center text-[11px] leading-relaxed text-slate sm:text-left">
          Your details are only used to fulfil this order. We never sell customer data.
        </p>
      </div>

      <OrderSummary
        items={items}
        subtotal={subtotal}
        shipping={shipping}
        total={total}
        count={count}
        returnsDays={legal.returnsDays}
      />
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="field-label">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs font-semibold text-signal-deep">{error}</p>}
    </div>
  );
}

function PaymentOption({
  active,
  onSelect,
  title,
  body,
}: {
  active: boolean;
  onSelect: () => void;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cx(
        "rounded-xl border p-4 text-left transition",
        active
          ? "border-ink bg-paper shadow-[inset_0_0_0_1px_rgba(16,20,24,0.9)]"
          : "border-ink/15 bg-white hover:border-ink/40",
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{title}</span>
        <span
          className={cx(
            "grid h-4 w-4 place-items-center rounded-full border",
            active ? "border-ink bg-ink text-paper" : "border-ink/30",
          )}
        >
          {active && <CheckIcon className="h-3 w-3" />}
        </span>
      </span>
      <span className="mt-1.5 block text-xs leading-relaxed text-slate">{body}</span>
    </button>
  );
}

function OrderSummary({
  items,
  subtotal,
  shipping,
  total,
  count,
  returnsDays = 7,
}: {
  items: Array<{ slug: string; title: string; priceZar: number; image: string; quantity: number }>;
  subtotal: number;
  shipping: number;
  total: number;
  count: number;
  returnsDays?: number;
}) {
  return (
    <aside className="rounded-2xl border border-ink/10 bg-white p-6 lg:sticky lg:top-40">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold">Your order</h2>
        <Link
          href="/cart/"
          className="text-xs font-semibold text-slate underline underline-offset-4 transition hover:text-signal-deep"
        >
          Edit
        </Link>
      </div>

      <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
        {items.map((item) => (
          <li key={item.slug} className="flex items-center gap-3">
            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-ink/10 bg-mist">
              <ProductImage src={item.image} alt={item.title} className="h-full w-full" />
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[10px] font-bold text-paper">
                {item.quantity}
              </span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{item.title}</p>
              <p className="mt-0.5 text-[11px] text-slate">
                {formatZar(item.priceZar)} each
              </p>
            </div>
            <p className="text-xs font-bold tabular-nums">
              {formatZar(item.priceZar * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <dl className="mt-5 space-y-3 border-t border-ink/10 pt-4 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-slate">Subtotal ({count})</dt>
          <dd className="font-semibold tabular-nums">{formatZar(subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-slate">Delivery</dt>
          <dd className="font-semibold tabular-nums">
            {shipping === 0 ? <span className="text-signal-deep">Free</span> : formatZar(shipping)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-ink/10 pt-3">
          <dt className="font-semibold">Total</dt>
          <dd className="font-display text-2xl font-bold tabular-nums">{formatZar(total)}</dd>
        </div>
      </dl>

      <div className="mt-5 space-y-2.5 border-t border-ink/10 pt-4 text-xs leading-relaxed text-slate">
        <p className="flex items-start gap-2">
          <TruckIcon className="mt-0.5 h-4 w-4 shrink-0 text-signal-deep" />
          Standard delivery in 7–14 working days.
        </p>
        <p className="flex items-start gap-2">
          <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-signal-deep" />
          {returnsDays}-day returns on unused items.
        </p>
        <p className="flex items-start gap-2">
          <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-signal-deep" />
          Stock confirmed before payment.
        </p>
      </div>
    </aside>
  );
}
