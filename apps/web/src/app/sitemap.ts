import type { MetadataRoute } from "next";
import { SITE_URL, getAllPages, pagePathForSlug } from "@/lib/strapi";

// Re-evaluate on each request so newly published pages appear without a
// redeploy (cached via the STRAPI_CACHE_TAG, revalidated on Strapi publish).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!SITE_URL) return [];

  const pages = await getAllPages();

  return pages.map((page) => ({
    url: new URL(pagePathForSlug(page.slug), SITE_URL).href,
    lastModified: page.updatedAt ?? page.createdAt ?? undefined,
    changeFrequency: "monthly",
    priority: page.slug === "home" ? 1 : 0.7,
  }));
}