import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { CtaBlock } from "@/lib/strapi";

export function CtaSection({ block }: { block: CtaBlock }) {
  return (
    <section className="relative overflow-hidden border-y-4 border-double border-foreground bg-foreground text-background">
      {/* Oversized ornament */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-10 select-none font-heading text-[14rem] leading-none text-background/10"
      >
        ✳
      </span>

      <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-5 px-6 py-20">
        <h2 className="max-w-2xl text-balance font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          {block.heading}
        </h2>
        {block.text && <p className="max-w-xl text-lg opacity-80">{block.text}</p>}
        <Button
          asChild
          size="lg"
          className="mt-2 rounded-none bg-primary px-8 text-primary-foreground hover:bg-primary/90"
        >
          <Link href={block.buttonHref}>
            {block.buttonLabel} <span aria-hidden>→</span>
          </Link>
        </Button>
      </div>
    </section>
  );
}
