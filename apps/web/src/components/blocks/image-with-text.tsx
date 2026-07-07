import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { mediaUrl, type ImageWithTextBlock } from "@/lib/strapi";

export function ImageWithTextSection({ block }: { block: ImageWithTextBlock }) {
  const imageLeft = block.imagePosition !== "right";

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="grid items-center gap-10 md:grid-cols-12">
        <figure className={cn("md:col-span-7", imageLeft ? "md:order-1" : "md:order-2")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mediaUrl(block.image.url)}
            alt={block.image.alternativeText ?? ""}
            width={block.image.width ?? undefined}
            height={block.image.height ?? undefined}
            className={cn("plate w-full object-cover", imageLeft ? "rotate-1" : "-rotate-1")}
          />
          {block.image.alternativeText && (
            <figcaption className="mt-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Fig. — {block.image.alternativeText}
            </figcaption>
          )}
        </figure>

        <div className={cn("md:col-span-5", imageLeft ? "md:order-2" : "md:order-1")}>
          {block.heading && (
            <h2 className="mb-4 border-t-2 border-foreground pt-4 font-heading text-3xl font-semibold tracking-tight">
              {block.heading}
            </h2>
          )}
          {block.content && (
            <div className="prose prose-neutral dark:prose-invert prose-a:decoration-primary prose-a:underline-offset-4">
              <ReactMarkdown>{block.content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
