import { COPY, type Lang } from "@/lib/i18n";
import { CompareTable, NotFor } from "./compare-table";
import { FinalCta } from "./final-cta";
import { Footer } from "./footer";
import { JsonLd, softwareApp } from "./json-ld";
import { Nav } from "./nav";
import { guidesFor } from "./topic-page";

/** The whole comparison, which the home page only sums up. */
export function ComparePage({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const home = t.paths.home;
  const other: Lang = lang === "en" ? "es" : "en";

  return (
    <main className="min-h-screen overflow-x-clip bg-base text-ink">
      <JsonLd data={softwareApp(t.comparePage.description, lang)} />
      <Nav t={t.nav} home={home} base={home} otherHref={COPY[other].paths.compare} />

      <section className="noise relative overflow-hidden pt-[68px]">
        <div className="aurora-bg pointer-events-none absolute inset-x-0 top-0 h-[620px] opacity-80" />
        <div className="relative mx-auto max-w-[1440px] px-4 pb-12 pt-16 sm:px-8 lg:px-12 lg:pt-24">
          <p className="mb-6 font-mono text-[12px] uppercase tracking-[0.16em] text-ink/70">
            <a href={home} className="hover:text-ink">norte</a> <span className="text-line">/</span> {t.compare.eyebrow}
          </p>
          <h1 className="max-w-5xl text-balance text-[40px] font-medium leading-[0.98] tracking-[-0.06em] text-ink sm:text-[64px] lg:text-[76px]">
            {t.comparePage.h1}
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-ink/70">{t.compare.body}</p>
        </div>
      </section>

      <section className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
          <CompareTable t={t.compare} lang={lang} />
          <div className="mt-16">
            <NotFor t={t.compare} />
          </div>
        </div>
      </section>

      <FinalCta t={t.cta} />
      <Footer t={t.footer} home={home} base={home} guides={guidesFor(lang)} />
    </main>
  );
}
