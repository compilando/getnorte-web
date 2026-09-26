import type { Metadata } from "next";
import { FeaturesPage } from "@/components/features-page";
import { metadataFor } from "@/components/root";
import { COPY } from "@/lib/i18n";

export const metadata: Metadata = metadataFor("es", {
  title: COPY.es.features.title,
  description: COPY.es.features.description,
  path: COPY.es.paths.features,
  paths: { en: COPY.en.paths.features, es: COPY.es.paths.features },
});

export default function Page() {
  return <FeaturesPage lang="es" />;
}
