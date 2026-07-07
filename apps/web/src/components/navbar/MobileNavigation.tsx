"use client";

import { useState } from "react";
import { Menu, X, ChevronRight, ChevronLeft } from "lucide-react";
import type { NavbarItem, Link as StrapiLinkType } from "@/lib/strapi";
import { StrapiLink } from "@/components/utilities/StrapiLink";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileNavigationProps {
  items?: NavbarItem[] | null;
  primaryButtons?: StrapiLinkType[] | null;
}

export function MobileNavigation({ items, primaryButtons }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<NavbarItem | null>(null);

  if (!items?.length && !primaryButtons?.length) return null;

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-background transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          {activeItem ? (
            <Button variant="ghost" size="sm" onClick={() => setActiveItem(null)}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          ) : (
            <span className="font-heading text-lg font-semibold">Menu</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsOpen(false);
              setActiveItem(null);
            }}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-col divide-y overflow-y-auto">
          {!activeItem &&
            items?.map((item) => {
              const hasSubItems = !!item.subItems?.length;

              return (
                <div key={item.id} className="px-6 py-4">
                  {item.link ? (
                    <StrapiLink
                      component={item.link}
                      onClick={() => {
                        setIsOpen(false);
                        setActiveItem(null);
                      }}
                      className="text-lg font-medium"
                    />
                  ) : hasSubItems ? (
                    <button
                      onClick={() => setActiveItem(item)}
                      className="flex w-full items-center justify-between text-lg font-medium"
                    >
                      {item.label}
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  ) : (
                    <span className="text-lg font-medium text-muted-foreground">
                      {item.label}
                    </span>
                  )}
                </div>
              );
            })}

          {activeItem &&
            activeItem.subItems?.map((subItem) => (
              <div key={subItem.id} className="px-6 py-4">
                <StrapiLink
                  component={subItem}
                  onClick={() => {
                    setIsOpen(false);
                    setActiveItem(null);
                  }}
                  className="text-lg font-medium"
                />
              </div>
            ))}
        </div>

        {primaryButtons?.length ? (
          <div className="absolute bottom-0 left-0 right-0 border-t bg-background p-6">
            <div className="flex flex-col gap-3">
              {primaryButtons.map((button) => (
                <StrapiLink
                  key={button.id}
                  component={button}
                  variant="button"
                  onClick={() => {
                    setIsOpen(false);
                    setActiveItem(null);
                  }}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
