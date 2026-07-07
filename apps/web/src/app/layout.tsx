import type { Metadata } from "next";
import { Fraunces, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { draftMode } from "next/headers";
import { StrapiNavbar } from "@/components/navbar/StrapiNavbar";
import { StrapiFooter } from "@/components/footer/StrapiFooter";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Blockpress — Strapi × Next.js starter",
    template: "%s | Blockpress",
  },
  description:
    "Turborepo starter with Strapi 5, Next.js, live preview and Rock8Cloud deployment.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isEnabled: isDraft } = await draftMode();

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${instrumentSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {isDraft && (
          <div className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-primary px-4 py-2 font-mono text-xs uppercase tracking-widest text-primary-foreground">
            Draft mode — previewing unpublished content
            {/* Deliberately not <Link>: this is a route handler, and it must
                only run on an explicit click (never on prefetch). */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/api/exit-preview" className="underline underline-offset-4">
              Exit
            </a>
          </div>
        )}

        <StrapiNavbar />

        {children}

        <StrapiFooter />
      </body>
    </html>
  );
}
