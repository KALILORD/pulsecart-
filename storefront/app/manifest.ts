import type { MetadataRoute } from "next";
import { getConfig } from "@/lib/data";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  const site = getConfig();

  return {
    name: `${site.brand.name} — ${site.brand.tagline}`,
    short_name: site.brand.name,
    description: site.brand.description,
    start_url: "/",
    display: "standalone",
    background_color: "#F7F5F0",
    theme_color: "#101418",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
