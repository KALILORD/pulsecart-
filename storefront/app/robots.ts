import type { MetadataRoute } from "next";
import { getConfig } from "@/lib/data";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const site = getConfig();
  const base = site.brand.domain.replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/cart/", "/checkout/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
