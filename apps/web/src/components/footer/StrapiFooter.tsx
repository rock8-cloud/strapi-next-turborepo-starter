import { getFooter } from "@/lib/strapi";
import { FooterInner } from "./FooterInner";

export async function StrapiFooter() {
  const footer = await getFooter();

  if (!footer) {
    // Fallback: minimal footer when Strapi is unreachable or none configured.
    return (
      <footer className="mt-auto border-t">
        <div className="mx-auto max-w-6xl px-6 py-10 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <p>Content by Strapi · Rendered by Next.js · Deployed on Rock8Cloud</p>
        </div>
      </footer>
    );
  }

  return <FooterInner footer={footer} />;
}