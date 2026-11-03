export type Channel =
  | "telegram"
  | "bluesky"
  | "mastodon"
  | "pinterest"
  | "instagram"
  | "tiktok"
  | "x";

export type TrendSource = "google-trends" | "reddit" | "google-news" | "aliexpress" | "manual";

export type Confidence = "high" | "medium" | "low";

export type ProductStatus = "draft" | "published" | "archived";

export type PostStatus = "queued" | "published" | "failed" | "manual";

export interface ChannelConfig {
  enabled: boolean;
  mode?: "auto" | "manual";
}

export interface AppConfig {
  brand: {
    name: string;
    tagline: string;
    description: string;
    domain: string;
    email: string;
    whatsapp: string;
    currency: "ZAR";
    market: string;
    locale: string;
  };
  pipeline: {
    trendGeo: string;
    dailyProductLimit: number;
    minTrendScore: number;
    autoPublish: boolean;
    requireSupplierConfidence: Confidence;
    markup: {
      under200: number;
      under500: number;
      over500: number;
    };
    social: {
      maxPostsPerChannelPerRun: number;
      captionLength: Record<Channel, number>;
    };
  };
  channels: Record<Channel, ChannelConfig>;
  legal: {
    companyName: string;
    registrationNumber: string;
    address: string;
    returnsDays: number;
    deliveryEstimate: string;
  };
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
  /** Product search phrase derived from the trend. */
  query: string;
  /** Cultural moment or event driving the trend, when detected. */
  event?: string;
  category: string;
  url?: string;
  traffic?: string;
  /** False when the signal is informational, not a product opportunity. */
  eligible?: boolean;
  observedAt: string;
  signals: TrendSignal[];
}

export interface SupplierOffer {
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
}

export interface ProductSupplier extends SupplierOffer {
  checkedAt: string;
}

export interface ProductTrendRef {
  id: string;
  title: string;
  source: TrendSource;
  score: number;
  event?: string;
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

export interface SocialPost {
  id: string;
  productId: string;
  productSlug: string;
  channel: Channel;
  text: string;
  imageUrl?: string;
  url: string;
  status: PostStatus;
  scheduledFor: string;
  publishedAt?: string;
  externalId?: string;
  error?: string;
}

export interface SocialCopy {
  telegram: string;
  bluesky: string;
  mastodon: string;
  pinterest: string;
  instagram: string;
  tiktok: string;
  x: string;
}

export interface GeneratedContent {
  title: string;
  tagline: string;
  description: string[];
  bullets: string[];
  seo: ProductSeo;
  social: SocialCopy;
}

export interface ResearchReport {
  generatedAt: string;
  trend: Trend;
  offers: SupplierOffer[];
  chosen: SupplierOffer | null;
  decision: string;
}

export interface PipelineState {
  lastRun: string;
  mode: string;
  counts: Record<string, number>;
  errors: string[];
}
