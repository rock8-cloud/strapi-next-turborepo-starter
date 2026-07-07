import ReactMarkdown from "react-markdown";
import type { RichTextBlock } from "@/lib/strapi";

export function RichTextSection({ block }: { block: RichTextBlock }) {
  return (
    <section className="mx-auto w-full max-w-2xl px-6 py-16">
      <div className="dropcap prose prose-neutral dark:prose-invert max-w-none prose-headings:font-heading prose-headings:font-semibold prose-headings:tracking-tight prose-a:decoration-primary prose-a:underline-offset-4 prose-blockquote:border-l-primary prose-strong:text-foreground">
        <ReactMarkdown>{block.content}</ReactMarkdown>
      </div>
    </section>
  );
}
