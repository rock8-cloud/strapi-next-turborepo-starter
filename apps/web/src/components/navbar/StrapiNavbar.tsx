import Link from "next/link";
import { getNavbar } from "@/lib/strapi";
import { NavbarInner } from "./NavbarInner";

export async function StrapiNavbar() {
  const navbar = await getNavbar();

  if (!navbar) {
    // Fallback header when Strapi is unreachable or no navbar is configured
    return (
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-heading text-2xl font-semibold tracking-tight">
            Blockpress<span className="text-primary">.</span>
          </Link>
        </div>
      </header>
    );
  }

  return <NavbarInner navbar={navbar} />;
}
