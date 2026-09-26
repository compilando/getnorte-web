import type { Metadata } from "next";
import { ComparePage } from "@/components/compare-page";
import { metadataFor } from "@/components/root";
import { COPY } from "@/lib/i18n";

export const metadata: Metadata = metadataFor("en", {
  title: COPY.en.comparePage.title,
  description: COPY.en.comparePage.description,
  path: COPY.en.paths.compare,
  paths: { en: COPY.en.paths.compare, es: COPY.es.paths.compare },
});

export default function Page() {
  return <ComparePage lang="en" />;
}
