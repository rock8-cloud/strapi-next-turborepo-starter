import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import {
  HOME_SLUG,
  getAllPageSlugs,
  getPageBySlug,
  mediaUrl,
} from "@/lib/strapi";

// Safety net: pages are re-rendered at most every 30s even if the Strapi
// revalidation webhook is not configured. Must stay in sync with
// PUBLISHED_REVALIDATE in @/lib/strapi. (Next requires a static literal here.)
// The Strapi webhook (→ /api/revalidate) makes edits appear immediately.
export const revalidate = 30;
export const dynamicParams = true;

function slugFromParams(slug?: string[]): string {
  return slug?.length ? slug.join("/") : HOME_SLUG;
}

type Props = { params: Promise<{ slug?: string[] }> };

export async function generateStaticParams() {
  const slugs = await getAllPageSlugs();
  return slugs.map((slug) => ({
    slug: slug === HOME_SLUG ? [] : slug.split("/"),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slugFromParams(slug));

  if (!page) {
    return { title: "Page not found" };
  }

  const seo = page.seo;
  const title = seo?.metaTitle || page.title;
  const description = seo?.metaDescription ?? undefined;
  const cover = seo?.metaImage ? mediaUrl(seo.metaImage.url) : undefined;
  const canonical = seo?.canonicalUrl ?? undefined;
  const robots = ((): Metadata["robots"] => {
    switch (seo?.metaRobots) {
      case "noindex":
        return { index: false, follow: true };
      case "noindex,nofollow":
        return { index: false, follow: false };
      default:
        return { index: true, follow: true };
    }
  })();

  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title,
      description,
      type: "website",
      ...(cover ? { images: [{ url: cover }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(cover ? { images: [cover] } : {}),
    },
    robots,
  };
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPageBySlug(slugFromParams(slug));

  if (!page) {
    notFound();
  }

  return (
    <main className="flex-1">
      <BlockRenderer blocks={page.blocks ?? []} />
    </main>
  );
}
