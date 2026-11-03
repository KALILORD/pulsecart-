import type { Metadata } from "next";
import Link from "next/link";
import { ShieldIcon } from "@/components/Icons";
import { getConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How PulseCart collects, uses and protects personal information under South Africa's Protection of Personal Information Act (POPIA).",
  alternates: { canonical: "/privacy/" },
};

const EFFECTIVE_DATE = "2 November 2026";

export default function PrivacyPage() {
  const site = getConfig();
  const contact = site.brand.email;

  return (
    <>
      <section className="border-b border-ink/10 bg-white">
        <div className="container-page py-12 md:py-16">
          <p className="eyebrow text-signal-deep">
            <ShieldIcon className="h-3.5 w-3.5" />
            Your information
          </p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Privacy policy.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate">
            This policy explains what personal information PulseCart collects, why we need it, and
            what you can ask us to do with it. It applies to this website and to orders placed
            through it or through our WhatsApp and email channels.
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate">
            Effective {EFFECTIVE_DATE}
          </p>
        </div>
      </section>

      <section className="container-page py-10 md:py-14">
        <div className="grid gap-12 lg:grid-cols-[0.3fr_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-40 rounded-2xl border border-ink/10 bg-white p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate">
                On this page
              </p>
              <nav aria-label="Privacy sections" className="mt-3 space-y-2 text-sm">
                {[
                  ["who", "Who we are"],
                  ["collect", "What we collect"],
                  ["use", "How we use it"],
                  ["share", "Who we share it with"],
                  ["cookies", "Cookies & storage"],
                  ["retention", "How long we keep it"],
                  ["rights", "Your rights"],
                  ["security", "Security"],
                  ["paia", "PAIA manual"],
                  ["contact", "Contact us"],
                ].map(([id, label]) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="block text-slate transition hover:text-ink"
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <div className="prose-page max-w-3xl">
            <h2 id="who" className="mt-0">
              1. Who we are
            </h2>
            <p>
              PulseCart ({site.legal.companyName}) is an online store based in{" "}
              {site.legal.address}. We are the responsible party for the personal information
              described in this policy. Our website is {site.brand.domain}.
            </p>

            <h2 id="collect">2. What we collect</h2>
            <p>We only ask for information we need to fulfil an order or answer a question:</p>
            <ul>
              <li>
                <strong>Order details:</strong> your name, email address, mobile number, delivery
                address and any delivery notes you add.
              </li>
              <li>
                <strong>Order contents:</strong> the products, quantities and totals in your cart.
              </li>
              <li>
                <strong>Correspondence:</strong> messages you send us by email, WhatsApp or the
                contact form, including any photos you attach.
              </li>
              <li>
                <strong>Payment confirmation:</strong> confirmation that a payment was made. We do
                not store your full card number. Card payments are handled by a third-party payment
                provider.
              </li>
              <li>
                <strong>Technical basics:</strong> standard server logs such as your IP address,
                browser type and pages requested, where our hosting provider records them.
              </li>
            </ul>
            <p>
              We do not ask for special personal information (for example, health, religious or
              biometric data), and we do not knowingly collect information from children.
            </p>

            <h2 id="use">3. How we use it</h2>
            <ul>
              <li>To confirm stock and prepare your order.</li>
              <li>To arrange delivery and share tracking updates.</li>
              <li>To process payments, refunds and returns.</li>
              <li>To answer your questions and resolve problems.</li>
              <li>To keep records required for tax and accounting purposes.</li>
              <li>To improve the products and pages people actually use.</li>
              <li>To send drop alerts, but only if you asked for them.</li>
            </ul>
            <p>
              Under POPIA, we rely on the performance of a contract (fulfilling your order), our
              legitimate interests (running and improving the store), your consent (marketing
              messages) and legal obligations (tax and consumer records).
            </p>

            <h2 id="share">4. Who we share it with</h2>
            <p>
              We share only what is necessary with the people who help us deliver your order:
            </p>
            <ul>
              <li>
                <strong>Couriers and fulfilment partners</strong> receive the name, address and
                phone number needed to deliver the parcel.
              </li>
              <li>
                <strong>Payment providers</strong> process your payment and may collect their own
                information under their privacy policy.
              </li>
              <li>
                <strong>Hosting and communication providers</strong> may process technical data on
                our behalf, under appropriate safeguards.
              </li>
              <li>
                <strong>Professional advisers and authorities</strong> where we are required by law
                to disclose information.
              </li>
            </ul>
            <p>
              We do not sell your personal information, and we do not share it with advertisers for
              their own marketing.
            </p>

            <h2 id="cookies">5. Cookies and local storage</h2>
            <p>
              This site does not use advertising cookies. We use your browser&apos;s local storage
              to remember the contents of your cart between visits. That data stays on your device
              and can be cleared at any time through your browser settings or the &ldquo;Clear
              cart&rdquo; button.
            </p>
            <p>
              Our hosting provider may set essential cookies or record standard request logs for
              security and performance. If we add analytics in future, we will update this policy and
              give you a way to opt out where required.
            </p>

            <h2 id="retention">6. How long we keep it</h2>
            <p>
              We keep order and payment records for as long as required by South African tax and
              consumer law, and for a reasonable period afterwards to handle returns, warranties and
              disputes. Messages that are not linked to an order are kept only as long as needed to
              resolve the query. Cart contents stay in your browser until you clear them.
            </p>

            <h2 id="rights">7. Your rights</h2>
            <p>Under POPIA you may ask us to:</p>
            <ul>
              <li>confirm whether we hold personal information about you;</li>
              <li>give you a copy of that information;</li>
              <li>correct information that is inaccurate or incomplete;</li>
              <li>delete information we are not legally required to keep;</li>
              <li>object to processing based on legitimate interests; and</li>
              <li>withdraw consent for marketing messages at any time.</li>
            </ul>
            <p>
              Email <a href={`mailto:${contact}`}>{contact}</a> with your request and enough detail
              for us to identify you. We may need to verify your identity before acting. We will
              respond within a reasonable time and no later than the period allowed by POPIA.
            </p>
            <p>
              If you are unhappy with how we handled your information, you can complain to the
              Information Regulator of South Africa at{" "}
              <a href="https://inforegulator.org.za" target="_blank" rel="noreferrer">
                inforegulator.org.za
              </a>
              .
            </p>

            <h2 id="security">8. Security</h2>
            <p>
              We use reputable service providers, encrypted connections and access controls to
              protect personal information. No system is completely secure, but we take reasonable
              steps to prevent loss, unauthorised access and misuse. If a security compromise
              affects your information, we will notify you and the Information Regulator where the
              law requires it.
            </p>

            <h2 id="paia">9. PAIA manual</h2>
            <p>
              The Promotion of Access to Information Act, 2000 (PAIA) gives you the right to request
              records held by public and private bodies. PulseCart&apos;s PAIA manual is available on
              request from our Information Officer. To request it, email{" "}
              <a href={`mailto:${contact}`}>{contact}</a> with the subject line
              &ldquo;PAIA manual&rdquo;.
            </p>

            <h2 id="contact">10. Contact us</h2>
            <p>
              Questions about this policy or your information can go to our Information Officer:
            </p>
            <ul>
              <li>
                Email: <a href={`mailto:${contact}`}>{contact}</a>
              </li>
              <li>Address: {site.legal.address}</li>
            </ul>
            <p>
              We may update this policy from time to time. The effective date at the top of the page
              shows when it last changed. See also our{" "}
              <Link href="/terms/">terms of sale</Link> and{" "}
              <Link href="/shipping/">shipping &amp; returns policy</Link>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
