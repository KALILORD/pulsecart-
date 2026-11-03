import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon, MailIcon, ShieldIcon, TruckIcon } from "@/components/Icons";
import { getConfig } from "@/lib/data";
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING, formatZar } from "@/lib/format";

export const metadata: Metadata = {
  title: "Shipping & returns",
  description:
    "PulseCart delivery windows, shipping costs, tracking and returns policy for South Africa.",
  alternates: { canonical: "/shipping/" },
};

export default function ShippingPage() {
  const site = getConfig();

  return (
    <>
      <section className="border-b border-ink/10 bg-white">
        <div className="container-page py-12 md:py-16">
          <p className="eyebrow text-signal-deep">
            <TruckIcon className="h-3.5 w-3.5" />
            Delivery & returns
          </p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">From us to your door.</h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate">
            Plain-language delivery and returns. No hidden fees, no vague timelines — just what to
            expect after you order.
          </p>
        </div>
      </section>

      <section className="container-page py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:items-start">
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-bold">Delivery</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate">
                We deliver nationwide across South Africa. Orders are packed after stock is
                confirmed, then handed to a tracked courier. The estimate below is from dispatch,
                not from the moment you place the order.
              </p>

              <div className="mt-5 overflow-hidden rounded-2xl border border-ink/10 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-paper text-[10px] font-bold uppercase tracking-[0.14em] text-slate">
                    <tr>
                      <th className="px-5 py-3">Method</th>
                      <th className="px-5 py-3">Estimate</th>
                      <th className="px-5 py-3 text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10">
                    <tr>
                      <td className="px-5 py-4 font-semibold">Standard tracked</td>
                      <td className="px-5 py-4 text-slate">{site.legal.deliveryEstimate}</td>
                      <td className="px-5 py-4 text-right font-semibold tabular-nums">
                        {formatZar(STANDARD_SHIPPING)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-5 py-4 font-semibold">Orders over {formatZar(FREE_SHIPPING_THRESHOLD)}</td>
                      <td className="px-5 py-4 text-slate">{site.legal.deliveryEstimate}</td>
                      <td className="px-5 py-4 text-right font-semibold text-signal-deep">Free</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-slate">
                Delivery is calculated at checkout. Remote areas may take an extra day or two. If
                your address is outside the courier network, we will contact you before dispatch.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold">Tracking your order</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate">
                When your parcel ships, we send a tracking reference on the same WhatsApp or email
                thread you ordered through. If you have not received an update within the delivery
                window, message us and we will chase the courier.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <InfoCard
                  icon={<CheckIcon className="h-4 w-4" />}
                  title="Confirmed"
                  body="We check stock and confirm your total."
                />
                <InfoCard
                  icon={<TruckIcon className="h-4 w-4" />}
                  title="Dispatched"
                  body="You receive a tracking reference."
                />
                <InfoCard
                  icon={<ShieldIcon className="h-4 w-4" />}
                  title="Delivered"
                  body="Signed for at your address."
                />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold">Returns & refunds</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate">
                If something is not right, tell us within {site.legal.returnsDays} days of delivery.
                We will arrange a return, replacement or refund depending on the issue.
              </p>

              <ol className="mt-5 space-y-4">
                <Step
                  number="01"
                  title="Message us"
                  body="Send your order name, the item and a photo if the product arrived damaged or incorrect."
                />
                <Step
                  number="02"
                  title="We confirm the return"
                  body="If the item is eligible, we send the return address and a reference. Do not ship it back before we confirm."
                />
                <Step
                  number="03"
                  title="We inspect and resolve"
                  body="Once received, we check the item and process the refund or replacement. Refunds go back to the original payment method."
                />
              </ol>

              <div className="mt-5 rounded-2xl border border-ink/10 bg-paper p-5">
                <h3 className="text-sm font-semibold">What is eligible?</h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate">
                  <li className="flex items-start gap-2">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-signal-deep" />
                    Unused items in original packaging, within {site.legal.returnsDays} days.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-signal-deep" />
                    Items that arrived damaged, faulty or different from what you ordered.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-signal-deep" />
                    Wrong size or colour, where the listing offered a choice.
                  </li>
                </ul>
                <h3 className="mt-5 text-sm font-semibold">What is not eligible?</h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate" />
                    Used, washed or altered items.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate" />
                    Hygiene-sensitive items that have been opened, unless faulty.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate" />
                    Change-of-mind returns requested after {site.legal.returnsDays} days.
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold">Damaged or missing parcels</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate">
                Please photograph the parcel and the contents before disposing of any packaging, then
                contact us within 48 hours of delivery. We will open a courier claim and make sure
                you are not left out of pocket.
              </p>
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-40">
            <div className="rounded-2xl border border-ink/10 bg-white p-6">
              <h2 className="font-display text-xl font-bold">Need a hand?</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate">
                Message us with your order details and we will check the status for you.
              </p>
              <Link href="/contact/" className="btn-primary mt-5 w-full">
                Contact us
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <a
                href={`mailto:${site.brand.email}`}
                className="btn-ghost mt-3 w-full border-ink/20 text-sm"
              >
                <MailIcon className="h-4 w-4" />
                {site.brand.email}
              </a>
            </div>

            <div className="rounded-2xl border border-ink/10 bg-ink p-6 text-paper">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-acid">
                The short version
              </p>
              <ul className="mt-4 space-y-3 text-sm text-paper/70">
                <li className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-acid" />
                  {formatZar(STANDARD_SHIPPING)} standard tracked delivery.
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-acid" />
                  Free over {formatZar(FREE_SHIPPING_THRESHOLD)}.
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-acid" />
                  {site.legal.deliveryEstimate} after dispatch.
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-acid" />
                  {site.legal.returnsDays}-day returns on eligible items.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function InfoCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white p-4">
      <span className="text-signal-deep">{icon}</span>
      <p className="mt-2 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate">{body}</p>
    </div>
  );
}

function Step({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <li className="flex gap-4">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink font-display text-xs font-bold text-paper">
        {number}
      </span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-slate">{body}</p>
      </div>
    </li>
  );
}
