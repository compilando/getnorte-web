import type { Metadata } from "next";
import { PrivacyPage } from "@/components/privacy-page";
import { metadataFor } from "@/components/root";
import { COPY } from "@/lib/i18n";

export const metadata: Metadata = metadataFor("en", {
  title: COPY.en.privacyPage.title,
  description: COPY.en.privacyPage.description,
  path: COPY.en.paths.privacy,
  paths: { en: COPY.en.paths.privacy, es: COPY.es.paths.privacy },
});

export default function Page() {
  return <PrivacyPage lang="en" />;
}
