import { draftMode } from "next/headers";

// Re-export pure (client-safe) types and helpers so server components can keep
// importing everything from "@/lib/strapi". Client components import these
// from "@/lib/strapi-shared" instead to avoid pulling in next/headers.
export { getLinkHref } from "./strapi-shared";
export type { Link, StrapiPageRef } from "./strapi-shared";

const STRAPI_URL = process.env.STRAPI_URL ?? "http://localhost:1337";
const PUBLIC_STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ?? process.env.STRAPI_URL ?? "http://localhost:1337";

export const STRAPI_CACHE_TAG = "strapi";

export const PUBLISHED_REVALIDATE = 30;

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";

export interface StrapiMedia {
  url: string;
  alternativeText?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface BasicImage {
  id: number;
  image?: StrapiMedia | null;
  alt?: string | null;
}

import type { Link } from "./strapi-shared";

export interface ImageWithLink {
  id: number;
  image?: BasicImage | null;
  link?: Link | null;
}

export interface NavbarItem {
  id: number;
  label?: string | null;
  link?: Link | null;
  subItems?: Link[] | null;
}

export interface Navbar {
  documentId: string;
  logoImage?: ImageWithLink | null;
  items?: NavbarItem[] | null;
  primaryButtons?: Link[] | null;
}

export interface FooterItem {
  id: number;
  title: string;
  links?: Link[] | null;
}

export interface Footer {
  documentId: string;
  logoImage?: ImageWithLink | null;
  sections?: FooterItem[] | null;
  links?: Link[] | null;
  copyright?: string | null;
}

export interface Seo {
  id: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaImage?: StrapiMedia | null;
  canonicalUrl?: string | null;
  metaRobots?: "all" | "noindex" | "noindex,nofollow" | null;
}

export interface FeatureItem {
  id: number;
  icon?: string | null;
  title: string;
  description?: string | null;
}

export interface HeroBlock {
  __component: "blocks.hero";
  id: number;
  heading: string;
  subheading?: string | null;
  image?: StrapiMedia | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
}

export interface FeaturesBlock {
  __component: "blocks.features";
  id: number;
  eyebrow?: string | null;
  heading: string;
  subheading?: string | null;
  items: FeatureItem[];
}

export interface RichTextBlock {
  __component: "blocks.rich-text";
  id: number;
  content: string;
}

export interface ImageWithTextBlock {
  __component: "blocks.image-with-text";
  id: number;
  heading?: string | null;
  content?: string | null;
  image: StrapiMedia;
  imagePosition: "left" | "right";
}

export interface CtaBlock {
  __component: "blocks.cta";
  id: number;
  heading: string;
  text?: string | null;
  buttonLabel: string;
  buttonHref: string;
}

export type PageBlock =
  | HeroBlock
  | FeaturesBlock
  | RichTextBlock
  | ImageWithTextBlock
  | CtaBlock;

export interface Page {
  documentId: string;
  title: string;
  slug: string;
  seo?: Seo | null;
  blocks: PageBlock[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

/** The page with this slug is served at the root path `/`. */
export const HOME_SLUG = "home";

/** Returns the public path for a page slug (the home page → `/`). */
export function pagePathForSlug(slug: string): string {
  return slug === HOME_SLUG ? "/" : `/${slug}`;
}

/**
 * Dynamic-zone population: each component is listed explicitly (the `on`
 * fragment syntax) so media fields come back populated. The SEO component is
 * populated separately because it lives on the page, not in the dynamic zone.
 */
const POPULATE_BLOCKS = [
  "populate[seo][populate][metaImage]=true",
  "populate[blocks][on][blocks.hero][populate]=image",
  "populate[blocks][on][blocks.features][populate]=items",
  "populate[blocks][on][blocks.rich-text]=true",
  "populate[blocks][on][blocks.image-with-text][populate]=image",
  "populate[blocks][on][blocks.cta]=true",
].join("&");

async function strapiFetch(path: string, query: string): Promise<Response> {
  const { isEnabled: isDraft } = await draftMode();

  const url = `${STRAPI_URL}${path}?${query}${isDraft ? "&status=draft" : ""}`;

  const headers: Record<string, string> = {};
  if (process.env.STRAPI_API_TOKEN) {
    headers.Authorization = `Bearer ${process.env.STRAPI_API_TOKEN}`;
  }

  return fetch(url, {
    headers,
    // Draft requests are always fresh. Published content is cached for a short
    // window so Strapi isn't hit on every request, but it revalidates on its
    // own after `PUBLISHED_REVALIDATE` seconds — so edits show up even without
    // the webhook. When the Strapi webhook hits /api/revalidate the `strapi`
    // tag is invalidated and changes appear immediately.
    ...(isDraft
      ? { cache: "no-store" as const }
      : { next: { revalidate: PUBLISHED_REVALIDATE, tags: [STRAPI_CACHE_TAG] } }),
  });
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const query = `filters[slug][$eq]=${encodeURIComponent(slug)}&${POPULATE_BLOCKS}`;

  try {
    const res = await strapiFetch("/api/pages", query);
    if (!res.ok) {
      console.error(`Strapi responded ${res.status} for slug "${slug}"`);
      return null;
    }
    const { data } = (await res.json()) as { data: Page[] };
    return data[0] ?? null;
  } catch (error) {
    // Strapi may be unreachable (e.g. during a Docker image build) —
    // render gracefully instead of failing the build.
    console.error(`Could not reach Strapi at ${STRAPI_URL}:`, error);
    return null;
  }
}

export interface PageListEntry {
  slug: string;
  updatedAt?: string | null;
  createdAt?: string | null;
}

export async function getAllPages(): Promise<PageListEntry[]> {
  try {
    const res = await strapiFetch(
      "/api/pages",
      "fields[0]=slug&fields[1]=createdAt&fields[2]=updatedAt&pagination[pageSize]=100"
    );
    if (!res.ok) return [];
    const { data } = (await res.json()) as { data: PageListEntry[] };
    return data;
  } catch {
    return [];
  }
}

export async function getAllPageSlugs(): Promise<string[]> {
  return (await getAllPages()).map((page) => page.slug);
}

const POPULATE_NAVBAR = [
  "populate[logoImage][populate][image]=true",
  "populate[logoImage][populate][link][populate]=page",
  "populate[items][populate][link][populate]=page",
  "populate[items][populate][subItems][populate]=page",
  "populate[primaryButtons][populate]=page",
].join("&");

export async function getNavbar(): Promise<Navbar | null> {
  try {
    const res = await strapiFetch("/api/navbar", POPULATE_NAVBAR);
    if (!res.ok) {
      console.error(`Strapi responded ${res.status} for navbar`);
      return null;
    }
    const { data } = (await res.json()) as { data: Navbar };
    return data ?? null;
  } catch (error) {
    console.error(`Could not reach Strapi at ${STRAPI_URL}:`, error);
    return null;
  }
}

const POPULATE_FOOTER = [
  "populate[logoImage][populate][image]=true",
  "populate[logoImage][populate][link][populate]=page",
  "populate[sections][populate][links][populate]=page",
  "populate[links][populate]=page",
].join("&");

export async function getFooter(): Promise<Footer | null> {
  try {
    const res = await strapiFetch("/api/footer", POPULATE_FOOTER);
    if (!res.ok) {
      console.error(`Strapi responded ${res.status} for footer`);
      return null;
    }
    const { data } = (await res.json()) as { data: Footer };
    return data ?? null;
  } catch (error) {
    console.error(`Could not reach Strapi at ${STRAPI_URL}:`, error);
    return null;
  }
}

/**
 * Media URLs are relative when Strapi stores files on the local filesystem
 * (/uploads/…) and absolute when they come from S3 storage.
 */
export function mediaUrl(url: string): string {
  return url.startsWith("http") ? url : `${PUBLIC_STRAPI_URL}${url}`;
}

/** Absolute URL for the given site-relative path, or null if no SITE_URL. */
export function absoluteUrl(path: string): string | null {
  if (!SITE_URL) return null;
  return new URL(path, SITE_URL).href;
}