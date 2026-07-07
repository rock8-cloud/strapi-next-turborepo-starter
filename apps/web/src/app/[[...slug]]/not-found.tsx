import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-32 text-center">
      <p className="mb-6 font-mono text-xs uppercase tracking-[0.25em] text-primary">
        Error 404
      </p>
      <h1 className="max-w-xl text-balance font-heading text-5xl font-semibold leading-tight tracking-tight sm:text-7xl">
        This page wasn&rsquo;t published.
      </h1>
      <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
        Either the slug doesn&rsquo;t exist in Strapi, or the page is still a
        draft. Head back home, or open the CMS to publish it.
      </p>
      <div className="mt-10 flex items-center gap-4">
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          ← Back to home
        </Link>
      </div>
    </main>
  );
}