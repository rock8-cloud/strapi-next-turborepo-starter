import { mediaUrl, type BasicImage, type StrapiMedia } from "@/lib/strapi";

interface StrapiBasicImageProps {
  component?: BasicImage | StrapiMedia | null;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
}

function isMedia(component: BasicImage | StrapiMedia): component is StrapiMedia {
  return "url" in component;
}

export function StrapiBasicImage({
  component,
  className,
  width,
  height,
  fill,
}: StrapiBasicImageProps) {
  if (!component) return null;

  const media = isMedia(component) ? component : component.image;
  if (!media) return null;

  const alt = isMedia(component) ? media.alternativeText ?? "" : component.alt ?? media.alternativeText ?? "";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={mediaUrl(media.url)}
      alt={alt}
      width={width ?? media.width ?? undefined}
      height={height ?? media.height ?? undefined}
      className={className}
      {...(fill ? { style: { width: "100%", height: "100%" } } : {})}
    />
  );
}
