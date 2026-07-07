import { StrapiBasicImage } from "./StrapiBasicImage";
import { StrapiLink } from "./StrapiLink";
import type { ImageWithLink } from "@/lib/strapi";

interface StrapiImageWithLinkProps {
  component?: ImageWithLink | null;
}

export function StrapiImageWithLink({ component }: StrapiImageWithLinkProps) {
  if (!component) return null;

  return (
    <StrapiLink component={component.link}>
      <StrapiBasicImage component={component.image} />
    </StrapiLink>
  );
}
