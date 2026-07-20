import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";
import { getAllPublishedProjects } from "@/lib/actions/portfolio";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL;

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/work`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  ];

  let dynamicPages: MetadataRoute.Sitemap = [];
  try {
    const projects = await getAllPublishedProjects();
    dynamicPages = projects.map((p) => ({
      url: `${base}/work/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(p.createdAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
  } catch {
    // ignore — sitemap will just have static pages
  }

  return [...staticPages, ...dynamicPages];
}
