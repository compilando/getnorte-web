import { RELEASE, REPO, SITE } from "@/lib/product";

/** Structured data for search engines: one script tag, its object as JSON. */
export function JsonLd({ data }: { data: object }) {
  // "<" is escaped so no string inside can close the script element.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

/** norte as a SoftwareApplication: what it is, where it runs, what it costs. */
export function softwareApp(description: string, lang: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "norte",
    url: SITE,
    description,
    inLanguage: lang,
    applicationCategory: "UtilitiesApplication",
    applicationSubCategory: "File manager",
    operatingSystem: "Linux (x86_64 binaries); macOS and Windows from source",
    softwareVersion: RELEASE.version,
    downloadUrl: RELEASE.latest,
    codeRepository: REPO,
    license: "https://www.gnu.org/licenses/agpl-3.0.html",
    image: `${SITE}/og.png`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  };
}

/** A page's questions and answers, as FAQPage. */
export function faqPage(faq: [string, string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
}
