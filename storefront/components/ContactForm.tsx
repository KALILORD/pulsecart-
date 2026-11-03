"use client";

import { useState, type FormEvent } from "react";
import { CheckIcon, MailIcon, WhatsAppIcon } from "@/components/Icons";
import { whatsappLink } from "@/lib/contact";
import { cx } from "@/lib/format";
import type { BrandConfig } from "@/lib/types";

interface ContactFormProps {
  brand: BrandConfig;
}

const TOPICS = ["Order help", "Product question", "Returns", "Wholesale", "Something else"];

export function ContactForm({ brand }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]!);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const composed = [
    `Hi PulseCart — ${topic.toLowerCase()}.`,
    "",
    message.trim(),
    "",
    `Name: ${name}`,
    `Email: ${email}`,
  ].join("\n");

  const wa = whatsappLink(brand.whatsapp, composed);
  const mailto = `mailto:${brand.email}?subject=${encodeURIComponent(
    `[${topic}] Message from ${name || "website visitor"}`,
  )}&body=${encodeURIComponent(composed)}`;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.trim().length < 10) {
      setError("Please add your name, a valid email and a short message.");
      return;
    }
    setError("");
    setSent(true);
    window.location.href = wa || mailto;
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-6 sm:p-8">
      <h2 className="font-display text-2xl font-bold">Send us a message.</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate">
        Tell us what you need. We usually reply within one business day.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2" noValidate>
        <div>
          <label htmlFor="contact-name" className="field-label">
            Your name
          </label>
          <input
            id="contact-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            className="field-input"
            placeholder="Thandi Mokoena"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="field-label">
            Email address
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            className="field-input"
            placeholder="you@example.co.za"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="contact-topic" className="field-label">
            What is it about?
          </label>
          <select
            id="contact-topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            className="field-input"
          >
            {TOPICS.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="contact-message" className="field-label">
            Message
          </label>
          <textarea
            id="contact-message"
            rows={5}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="field-input resize-y"
            placeholder="Order number, product name, or anything else that helps us help you."
          />
        </div>

        {error && <p className="sm:col-span-2 text-xs font-semibold text-signal-deep">{error}</p>}

        <div className="sm:col-span-2">
          <button type="submit" className={cx("btn-signal w-full", sent && "bg-ink text-paper")}>
            {sent ? <CheckIcon className="h-4 w-4" /> : wa ? <WhatsAppIcon className="h-4 w-4" /> : <MailIcon className="h-4 w-4" />}
            {sent ? "Message ready — send it in the app" : wa ? "Send on WhatsApp" : "Send by email"}
          </button>
          {sent && (
            <p className="mt-3 text-center text-xs leading-relaxed text-slate">
              If the app did not open, email us directly at{" "}
              <a href={`mailto:${brand.email}`} className="font-semibold text-ink underline underline-offset-2">
                {brand.email}
              </a>
              .
            </p>
          )}
          <p className="mt-3 text-center text-[11px] leading-relaxed text-slate">
            This form opens your email or WhatsApp app. Nothing is stored on this website.
          </p>
        </div>
      </form>
    </div>
  );
}
