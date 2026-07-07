import type { FeaturesBlock } from "@/lib/strapi";

export function FeaturesSection({ block }: { block: FeaturesBlock }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="max-w-2xl">
        {block.eyebrow && (
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-primary">
            {block.eyebrow}
          </p>
        )}
        <h2 className="text-balance font-heading text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          {block.heading}
        </h2>
        {block.subheading && (
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {block.subheading}
          </p>
        )}
      </div>

      {block.items?.length ? (
        <div className="mt-16 grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {block.items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 bg-background p-8 transition-colors hover:bg-muted/40"
            >
              {item.icon && (
                <span className="text-3xl leading-none" aria-hidden>
                  {item.icon}
                </span>
              )}
              <h3 className="font-heading text-xl font-semibold tracking-tight">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}