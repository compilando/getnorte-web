import type { MetadataRoute } from "next";
import { COPY } from "@/lib/i18n";
import { SITE } from "@/lib/product";
import { TOPICS, topicPath } from "@/lib/topics";

/** Every page in both languages, each naming its other-language twin. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const home: MetadataRoute.Sitemap[number] = {
    url: `${SITE}/`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 1,
    alternates: { languages: { en: `${SITE}/`, es: `${SITE}/es` } },
  };
  const homeEs = { ...home, url: `${SITE}/es` };
  const topics = TOPICS.flatMap((topic) =>
    (["en", "es"] as const).map((lang) => ({
      url: `${SITE}${topicPath(topic, lang)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      alternates: { languages: { en: `${SITE}${topicPath(topic, "en")}`, es: `${SITE}${topicPath(topic, "es")}` } },
    })),
  );
  const pages = (["features", "compare"] as const).flatMap((page) =>
    (["en", "es"] as const).map((lang) => ({
      url: `${SITE}${COPY[lang].paths[page]}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
      alternates: { languages: { en: `${SITE}${COPY.en.paths[page]}`, es: `${SITE}${COPY.es.paths[page]}` } },
    })),
  );
  return [home, homeEs, ...pages, ...topics];
}
