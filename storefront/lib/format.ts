export const FREE_SHIPPING_THRESHOLD = 500;
export const STANDARD_SHIPPING = 65;

export function formatZar(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
  return `R${text}`;
}

export function shippingFor(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
}

export function deliveryWindow(supplier: { deliveryDays: [number, number] }): string {
  return `${supplier.deliveryDays[0]}–${supplier.deliveryDays[1]} working days`;
}

export function shortDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function trendSourceLabel(source: string): string {
  switch (source) {
    case "aliexpress":
      return "Marketplace signal";
    case "google-trends":
      return "Google Trends ZA";
    case "google-news":
      return "Google News";
    case "reddit":
      return "Reddit";
    case "manual":
      return "Curated pick";
    default:
      return "Trend radar";
  }
}

export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}
