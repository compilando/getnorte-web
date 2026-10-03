import type { Metadata } from "next";
import { PrivacyPage } from "@/components/privacy-page";
import { metadataFor } from "@/components/root";
import { COPY } from "@/lib/i18n";

export const metadata: Metadata = metadataFor("es", {
  title: COPY.es.privacyPage.title,
  description: COPY.es.privacyPage.description,
  path: COPY.es.paths.privacy,
  paths: { en: COPY.en.paths.privacy, es: COPY.es.paths.privacy },
});

export default function Page() {
  return <PrivacyPage lang="es" />;
}
