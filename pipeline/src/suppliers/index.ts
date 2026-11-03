import { categoryRule } from "../lib/taxonomy";
import type { SupplierOffer, Trend } from "../types";
import { estimateShipping, searchAliExpress, searchWeb } from "./web";

function estimatedOffer(trend: Trend): SupplierOffer {
  const category = categoryRule(trend.category);
  const [low, high] = category.costRange;
  const costZar = Math.round((low + high) / 2);
  const { shippingZar, deliveryDays } = estimateShipping(costZar);

  return {
    supplier: "Estimated — verify supplier",
    title: trend.query,
    url: "",
    images: [],
    costZar,
    shippingZar,
    deliveryDays,
    inStock: true,
    confidence: "low",
    notes:
      "No verifiable supplier price found automatically. Confirm a supplier, landed cost, and image before publishing.",
  };
}

export interface DiscoveryResult {
  offers: SupplierOffer[];
  localLeads: Array<{ title: string; url: string; snippet: string }>;
}

export async function discoverOffers(trend: Trend): Promise<DiscoveryResult> {
  const [aliExpress, localLeads] = await Promise.all([
    searchAliExpress(trend.query),
    searchWeb(`${trend.query} wholesale supplier South Africa`, 5),
  ]);

  const offers: SupplierOffer[] = aliExpress.map((offer) => {
    const { shippingZar, deliveryDays } = estimateShipping(offer.costZar);
    return {
      supplier: "AliExpress",
      title: offer.title,
      url: offer.url,
      images: offer.images,
      costZar: offer.costZar,
      shippingZar,
      deliveryDays,
      inStock: offer.inStock,
      confidence: offer.confidence,
      notes: "Auto-discovered from public product data. Re-check price and stock before dispatch.",
    };
  });

  return {
    offers,
    localLeads: localLeads.map((lead) => ({
      title: lead.title,
      url: lead.url,
      snippet: lead.snippet,
    })),
  };
}

export function bestOffer(offers: SupplierOffer[], trend: Trend): SupplierOffer {
  const rank = { high: 2, medium: 1, low: 0 };
  const sorted = [...offers].sort((a, b) => {
    const confidence = rank[b.confidence] - rank[a.confidence];
    if (confidence !== 0) return confidence;
    const landedA = a.costZar + a.shippingZar;
    const landedB = b.costZar + b.shippingZar;
    return landedA - landedB;
  });
  return sorted[0] ?? estimatedOffer(trend);
}
