import { RELEASE, REPO, SITE } from "@/lib/product";

/** Structured data for search engines: one script tag, its object as JSON. */
export function JsonLd({ data }: { data: object }) {
  // "<" is escaped so no string inside can close the script element.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

/** The project behind the program and the site; `sameAs` ties "norte" to this norte and no other. */
const project = {
  "@type": "Organization",
  "@id": `${SITE}/#project`,
  name: "norte",
  url: SITE,
  logo: `${SITE}/icon-512.png`,
  sameAs: [REPO],
};

/** norte as a SoftwareApplication: what it is, where it runs, what it costs. */
export function softwareApp(description: string, lang: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE}/#app`,
    name: "norte",
    url: SITE,
    description,
    inLanguage: lang,
    applicationCategory: "UtilitiesApplication",
    applicationSubCategory: "File manager",
    operatingSystem: "Linux, Windows, macOS",
    softwareVersion: RELEASE.version,
    dateModified: RELEASE.date,
    releaseNotes: RELEASE.latest,
    downloadUrl: RELEASE.latest,
    codeRepository: REPO,
    sameAs: [REPO],
    license: "https://www.gnu.org/licenses/agpl-3.0.html",
    image: `${SITE}/og.jpg`,
    screenshot: `${SITE}/shots/kitty/${lang}/panes.webp`,
    author: project,
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  };
}

/** The site itself, on the home page: its name, so results can say "norte" rather than the domain. */
export function webSite(lang: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE}/#site`,
    name: "norte",
    url: SITE,
    inLanguage: lang,
    publisher: project,
  };
}

/** Where a page sits under the home page, as the visible "norte / …" line says. */
export function breadcrumbs(home: string, name: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "norte", item: `${SITE}${home === "/" ? "" : home}` },
      { "@type": "ListItem", position: 2, name, item: `${SITE}${path}` },
    ],
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
