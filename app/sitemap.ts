import type { MetadataRoute } from "next";
import { publicConfig } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const nu = new Date();
  return [
    { url: publicConfig.siteUrl, lastModified: nu, changeFrequency: "monthly", priority: 1 },
    {
      url: new URL("/oplossingen", publicConfig.siteUrl).toString(),
      lastModified: nu,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: new URL("/automatisatiescan", publicConfig.siteUrl).toString(),
      lastModified: nu,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];
}
