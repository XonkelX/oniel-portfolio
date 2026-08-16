import type { MetadataRoute } from "next";
import { siteConfig } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const englishRoutes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.siteUrl,
      lastModified: "2026-07-17",
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteConfig.siteUrl}/work/relay`,
      lastModified: "2026-08-09",
      changeFrequency: "monthly",
      priority: 0.95,
    },
    {
      url: `${siteConfig.siteUrl}/work/sinmanos`,
      lastModified: "2026-08-13",
      changeFrequency: "monthly",
      priority: 0.95,
    },
    {
      url: `${siteConfig.siteUrl}/work/careerflow`,
      lastModified: "2026-08-04",
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteConfig.siteUrl}/work/next`,
      lastModified: "2026-08-04",
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteConfig.siteUrl}/about`,
      lastModified: "2026-07-17",
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const spanishRoutes = [
    { path: "/es", priority: 1 },
    { path: "/es/work/sinmanos", priority: 0.95 },
    { path: "/es/work/relay", priority: 0.95 },
    { path: "/es/work/next", priority: 0.9 },
    { path: "/es/work/careerflow", priority: 0.9 },
    { path: "/es/about", priority: 0.7 },
  ] as const;

  return [
    ...englishRoutes,
    ...spanishRoutes.map((route) => ({
      url: `${siteConfig.siteUrl}${route.path}`,
      lastModified: "2026-08-15",
      changeFrequency: "monthly" as const,
      priority: route.priority,
    })),
  ];
}
