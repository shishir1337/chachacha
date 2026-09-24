import type { MetadataRoute } from "next";

// Add each page here as it is built.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://chachainsurance.com/", changeFrequency: "monthly", priority: 1 }];
}
