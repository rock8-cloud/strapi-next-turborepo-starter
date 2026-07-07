"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { NavbarItem } from "@/lib/strapi";
import { StrapiLink } from "@/components/utilities/StrapiLink";
import { cn } from "@/lib/utils";

interface DesktopNavigationProps {
  items?: NavbarItem[] | null;
}

export function DesktopNavigation({ items }: DesktopNavigationProps) {
  const [openId, setOpenId] = useState<number | null>(null);

  if (!items?.length) return null;

  return (
    <nav className="hidden items-center gap-6 md:flex">
      {items.map((item) => {
        const hasSubItems = !!item.subItems?.length;

        return (
          <div
            key={item.id}
            className="relative"
            onMouseEnter={() => hasSubItems && setOpenId(item.id)}
            onMouseLeave={() => setOpenId(null)}
          >
            {item.link ? (
              <StrapiLink
                component={item.link}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              />
            ) : (
              <span className="flex cursor-default items-center gap-1 text-sm font-medium text-muted-foreground">
                {item.label}
                {hasSubItems && <ChevronDown className="h-4 w-4" />}
              </span>
            )}

            {hasSubItems && (
              <div
                className={cn(
                  "absolute left-0 top-full z-50 min-w-[12rem] rounded-md border bg-background p-2 shadow-lg",
                  openId === item.id ? "block" : "hidden"
                )}
              >
                {item.subItems?.map((subItem) => (
                  <StrapiLink
                    key={subItem.id}
                    component={subItem}
                    className="block rounded px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
