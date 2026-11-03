export function whatsappLink(number: string, message?: string): string {
  const digits = number.replace(/[^0-9]/g, "");
  if (!digits) return "";
  const suffix = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${suffix}`;
}

export function contactHref(brand: { whatsapp: string; email: string }): string {
  return whatsappLink(brand.whatsapp) || `mailto:${brand.email}`;
}
