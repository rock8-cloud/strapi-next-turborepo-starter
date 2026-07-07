import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/strapi";

export default function robots(): MetadataRoute.Robots {
  if (!SITE_URL) {
    // No public site URL configured — default to allow everything, no sitemap.
    return { rules: { userAgent: "*", allow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", SITE_URL).href,
  };
}