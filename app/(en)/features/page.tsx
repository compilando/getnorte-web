import type { Metadata } from "next";
import { FeaturesPage } from "@/components/features-page";
import { metadataFor } from "@/components/root";
import { COPY } from "@/lib/i18n";

export const metadata: Metadata = metadataFor("en", {
  title: COPY.en.features.title,
  description: COPY.en.features.description,
  path: COPY.en.paths.features,
  paths: { en: COPY.en.paths.features, es: COPY.es.paths.features },
});

export default function Page() {
  return <FeaturesPage lang="en" />;
}
