import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { COPY, type Lang } from "@/lib/i18n";
import { SITE } from "@/lib/product";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

/** Served by this site: the card must not depend on another repository's layout. */
const ogImage = `${SITE}/og.png`;

/** A page other than the home page: its own words, and its twin in the other language. */
export type PageMeta = { title: string; description: string; path: string; paths: Record<Lang, string> };

export function metadataFor(lang: Lang, page?: PageMeta): Metadata {
  const t = page ?? { ...COPY[lang].meta, path: lang === "en" ? "/" : "/es", paths: { en: "/", es: "/es" } };
  return {
    metadataBase: new URL(SITE),
    title: t.title,
    description: t.description,
    alternates: { canonical: t.path, languages: { ...t.paths, "x-default": t.paths.en } },
    keywords: ["file manager", "orthodox file manager", "terminal file manager", "TUI", "Rust", "open source", "MCP", "AI agents", "SFTP", "S3"],
    authors: [{ name: "norte contributors" }],
    openGraph: {
      type: "website",
      siteName: "norte",
      locale: lang === "en" ? "en_US" : "es_ES",
      title: t.title,
      description: t.description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: "norte" }],
    },
    twitter: { card: "summary_large_image", title: t.title, description: t.description, images: [ogImage] },
  };
}

/** Both languages are root layouts of their own, so `<html lang>` is right on each. */
export function Root({ lang, children }: { lang: Lang; children: ReactNode }) {
  return (
    <html lang={lang} className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.variable} ${mono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
