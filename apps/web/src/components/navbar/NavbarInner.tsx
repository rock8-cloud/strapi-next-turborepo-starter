import Link from "next/link";
import type { Navbar } from "@/lib/strapi";
import { StrapiImageWithLink } from "@/components/utilities/StrapiImageWithLink";
import { StrapiLink } from "@/components/utilities/StrapiLink";
import { DesktopNavigation } from "./DesktopNavigation";
import { MobileNavigation } from "./MobileNavigation";

interface NavbarInnerProps {
  navbar: Navbar;
}

export function NavbarInner({ navbar }: NavbarInnerProps) {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          {navbar.logoImage ? (
            <StrapiImageWithLink component={navbar.logoImage} />
          ) : (
            <Link href="/" className="font-heading text-2xl font-semibold tracking-tight">
              Blockpress<span className="text-primary">.</span>
            </Link>
          )}
        </div>

        {/* Desktop Navigation */}
        <DesktopNavigation items={navbar.items} />

        {/* Right side: primary buttons + mobile toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-3 md:flex">
            {navbar.primaryButtons?.map((button) => (
              <StrapiLink
                key={button.id}
                component={button}
                variant="button"
              />
            ))}
          </div>
          <MobileNavigation items={navbar.items} primaryButtons={navbar.primaryButtons} />
        </div>
      </div>
    </header>
  );
}
