import type { Footer } from "@/lib/strapi";
import { StrapiImageWithLink } from "@/components/utilities/StrapiImageWithLink";
import { StrapiLink } from "@/components/utilities/StrapiLink";

interface FooterInnerProps {
  footer: Footer;
}

export function FooterInner({ footer }: FooterInnerProps) {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand + bottom links */}
          <div className="md:col-span-4">
            {footer.logoImage ? (
              <StrapiImageWithLink component={footer.logoImage} />
            ) : (
              <span className="font-heading text-2xl font-semibold tracking-tight">
                Blockpress<span className="text-primary">.</span>
              </span>
            )}
            {footer.links?.length ? (
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                {footer.links.map((link) => (
                  <li key={link.id}>
                    <StrapiLink
                      component={link}
                      className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-primary"
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* Link sections */}
          {footer.sections?.length ? (
            <div className="grid gap-8 sm:grid-cols-2 md:col-span-8 md:grid-cols-3">
              {footer.sections.map((section) => (
                <div key={section.id}>
                  <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    {section.title}
                  </h2>
                  {section.links?.length ? (
                    <ul className="mt-4 space-y-2">
                      {section.links.map((link) => (
                        <li key={link.id}>
                          <StrapiLink
                            component={link}
                            className="text-sm text-foreground transition-colors hover:text-primary"
                          />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {footer.copyright && (
          <div className="mt-12 border-t pt-6 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
            <p>{footer.copyright}</p>
          </div>
        )}
      </div>
    </footer>
  );
}