import type { PageBlock } from "@/lib/strapi";
import { HeroSection } from "./hero";
import { FeaturesSection } from "./features";
import { RichTextSection } from "./rich-text";
import { ImageWithTextSection } from "./image-with-text";
import { CtaSection } from "./cta";

function Block({ block }: { block: PageBlock }) {
  switch (block.__component) {
    case "blocks.hero":
      return <HeroSection block={block} />;
    case "blocks.features":
      return <FeaturesSection block={block} />;
    case "blocks.rich-text":
      return <RichTextSection block={block} />;
    case "blocks.image-with-text":
      return <ImageWithTextSection block={block} />;
    case "blocks.cta":
      return <CtaSection block={block} />;
    default:
      return null;
  }
}

export function BlockRenderer({ blocks }: { blocks: PageBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => (
        <div
          key={`${block.__component}-${block.id}`}
          className="reveal"
          style={{ animationDelay: `${index * 120}ms` }}
        >
          <Block block={block} />
        </div>
      ))}
    </>
  );
}
