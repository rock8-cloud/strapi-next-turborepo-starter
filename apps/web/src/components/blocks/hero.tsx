import Link from "next/link";
import { Button } from "@/components/ui/button";
import { mediaUrl, type HeroBlock } from "@/lib/strapi";

export function HeroSection({ block }: { block: HeroBlock }) {
  return (
    <section className="relative overflow-hidden border-b">
      {/* Halftone texture bleeding in from the corner */}
      <div
        aria-hidden
        className="halftone absolute -right-16 -top-16 h-72 w-72 rounded-full [mask-image:radial-gradient(closest-side,black,transparent)]"
      />

      <div className="mx-auto max-w-6xl px-6 pb-20 pt-16">
        <p className="mb-8 font-mono text-xs uppercase tracking-[0.25em] text-primary">
          № 01 — From the CMS
        </p>

        <h1 className="max-w-4xl text-balance font-heading text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl">
          {block.heading}
        </h1>

        <div className="mt-10 grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            {block.subheading && (
              <p className="border-t-2 border-foreground pt-4 text-lg leading-relaxed text-muted-foreground">
                {block.subheading}
              </p>
            )}
            {block.ctaLabel && block.ctaHref && (
              <Button asChild size="lg" className="mt-6 rounded-none px-8">
                <Link href={block.ctaHref}>
                  {block.ctaLabel} <span aria-hidden>→</span>
                </Link>
              </Button>
            )}
          </div>

          {block.image && (
            <div className="md:col-span-7">
              {/* Plain <img>: media hosts (S3 storage) are only known at
                  runtime, so next/image remotePatterns can't be configured
                  at build time. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaUrl(block.image.url)}
                alt={block.image.alternativeText ?? ""}
                width={block.image.width ?? undefined}
                height={block.image.height ?? undefined}
                className="plate w-full -rotate-1 object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
