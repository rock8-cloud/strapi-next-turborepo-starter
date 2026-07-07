"use client";

import Link from "next/link";
import { getLinkHref, type Link as StrapiLinkType } from "@/lib/strapi-shared";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface StrapiLinkProps {
  component?: StrapiLinkType | null;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  variant?: "link" | "button";
}

export function StrapiLink({
  component,
  className,
  onClick,
  children,
  variant = "link",
}: StrapiLinkProps) {
  if (!component) return null;

  const href = getLinkHref(component);
  const label = children ?? component.label;
  const isExternal = component.type === "external" || !href.startsWith("/");
  const target = component.newTab ? "_blank" : undefined;
  const rel = component.newTab
    ? isExternal
      ? "noopener noreferrer"
      : "noopener"
    : undefined;

  const linkClassName = cn(
    variant === "button"
      ? "inline-flex items-center justify-center"
      : "text-primary underline-offset-4 hover:underline",
    className
  );

  const content = isExternal ? (
    <a
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      className={variant === "button" ? undefined : linkClassName}
    >
      {label}
    </a>
  ) : (
    <Link
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      className={variant === "button" ? undefined : linkClassName}
    >
      {label}
    </Link>
  );

  if (variant === "button") {
    return <Button asChild className={linkClassName}>{content}</Button>;
  }

  return content;
}
