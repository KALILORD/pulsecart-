export type TrendSource = "google-trends" | "reddit" | "google-news" | "aliexpress" | "manual";

export type Confidence = "high" | "medium" | "low";

export type ProductStatus = "draft" | "published" | "archived";

export interface ProductTrendRef {
  id: string;
  title: string;
  source: TrendSource;
  score: number;
  event?: string;
}

export interface ProductSupplier {
  supplier: string;
  title: string;
  url: string;
  images: string[];
  costZar: number;
  shippingZar: number;
  deliveryDays: [number, number];
  rating?: number;
  orders?: number;
  inStock: boolean;
  confidence: Confidence;
  notes?: string;
  checkedAt: string;
}

export interface ProductSeo {
  title: string;
  description: string;
  keywords: string[];
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string[];
  bullets: string[];
  priceZar: number;
  compareAtPriceZar?: number;
  currency: "ZAR";
  images: string[];
  category: string;
  tags: string[];
  trend: ProductTrendRef;
  supplier: ProductSupplier;
  seo: ProductSeo;
  status: ProductStatus;
  demo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrendSignal {
  source: TrendSource;
  title: string;
  url?: string;
  traffic?: string;
  score: number;
}

export interface Trend {
  id: string;
  title: string;
  source: TrendSource;
  geo: string;
  score: number;
  keywords: string[];
  query: string;
  event?: string;
  category: string;
  url?: string;
  traffic?: string;
  eligible?: boolean;
  observedAt: string;
  signals: TrendSignal[];
}

export interface BrandConfig {
  name: string;
  tagline: string;
  description: string;
  domain: string;
  email: string;
  whatsapp: string;
  currency: "ZAR";
  market: string;
  locale: string;
}

export interface LegalConfig {
  companyName: string;
  registrationNumber: string;
  address: string;
  returnsDays: number;
  deliveryEstimate: string;
}

export interface SiteConfig {
  brand: BrandConfig;
  legal: LegalConfig;
}

export interface CartItem {
  slug: string;
  title: string;
  priceZar: number;
  image: string;
  quantity: number;
}
