import type { MetadataRoute } from "next";
import { getConfig, getProducts } from "@/lib/data";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getConfig();
  const base = site.brand.domain.replace(/\/+$/, "");
  const now = new Date();

  const staticRoutes = [
    { path: "/", priority: 1, changeFrequency: "daily" as const },
    { path: "/shop/", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/trends/", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/about/", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/contact/", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/shipping/", priority: 0.4, changeFrequency: "monthly" as const },
    { path: "/privacy/", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/terms/", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  const products = getProducts();
  const categories = Array.from(new Set(products.map((product) => product.category)));

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...categories.map((category) => ({
      url: `${base}/category/${category}/`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...products.map((product) => ({
      url: `${base}/products/${product.slug}/`,
      lastModified: new Date(product.updatedAt || now),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
