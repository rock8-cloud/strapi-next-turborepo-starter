/**
 * Pure (server- and client-safe) types and helpers shared between the Strapi
 * data layer and React components.
 *
 * This module MUST NOT import anything from "next/headers" or other
 * server-only APIs, because it is imported by client components.
 */

export interface StrapiPageRef {
  slug: string;
}

export interface Link {
  id: number;
  type: "external" | "page";
  label: string;
  href?: string | null;
  page?: StrapiPageRef | null;
  newTab: boolean;
}

/**
 * Resolves the href for a Strapi link component.
 * Internal page links point to the page slug; "home" is served at `/`.
 */
export function getLinkHref(link: Link): string {
  if (link.type === "external") {
    return link.href ?? "#";
  }

  const slug = link.page?.slug;
  if (!slug) return "#";
  return slug === "home" ? "/" : `/${slug}`;
}