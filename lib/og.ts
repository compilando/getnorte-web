import { COPY, LANGS, type Lang } from "./i18n";
import { TOPIC_COPY, TOPICS } from "./topics";

/**
 * The share card each page shows when a link to it is posted: a kicker and
 * the page's own headline, drawn by app/og/[key]/route.tsx at build time.
 * Keys are `<page>-<lang>`; a page without a card falls back to /og.jpg.
 */
export type Card = { eyebrow: string; title: string };

function cardsFor(lang: Lang): [string, Card][] {
  const t = COPY[lang];
  const topics = TOPICS.map((topic): [string, Card] => {
    const c = TOPIC_COPY[topic][lang];
    return [`${topic}-${lang}`, { eyebrow: c.label, title: c.h1 }];
  });
  return [
    [`home-${lang}`, { eyebrow: t.hero.eyebrow, title: t.hero.title.join(" ") }],
    [`features-${lang}`, { eyebrow: t.features.eyebrow, title: t.features.h1 }],
    [`compare-${lang}`, { eyebrow: t.nav.links.find(([, href]) => href === t.paths.compare)?.[0] ?? t.compare.eyebrow, title: t.comparePage.title }],
    ...topics,
  ];
}

export const CARDS: Record<string, Card> = Object.fromEntries(LANGS.flatMap(cardsFor));

export function cardPath(key: string): string {
  return `/og/${key}`;
}
