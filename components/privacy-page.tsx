import { COPY, fill, type Lang } from "@/lib/i18n";
import { EMAIL } from "@/lib/product";
import { Footer } from "./footer";
import { Nav } from "./nav";
import { guidesFor } from "./topic-page";

/** When the policy last changed: bump it with every edit to `privacyPage`. */
const UPDATED = "2026-10-08";

/** What the program and the site collect, which is the address signers and stores ask for. */
export function PrivacyPage({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const p = t.privacyPage;
  const home = t.paths.home;
  const other: Lang = lang === "en" ? "es" : "en";
  const date = new Date(UPDATED).toLocaleDateString(lang === "en" ? "en-US" : "es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <main className="min-h-screen overflow-x-clip bg-base text-ink">
      <Nav t={t.nav} home={home} base={home} otherHref={COPY[other].paths.privacy} />

      <section className="noise relative overflow-hidden pt-[68px]">
        <div className="aurora-bg pointer-events-none absolute inset-x-0 top-0 h-[620px] opacity-80" />
        <div className="relative mx-auto max-w-[1440px] px-4 pb-12 pt-16 sm:px-8 lg:px-12 lg:pt-24">
          <p className="mb-6 font-mono text-[12px] uppercase tracking-[0.16em] text-ink/70">
            <a href={home} className="hover:text-ink">norte</a> <span className="text-line">/</span> {p.eyebrow}
          </p>
          <h1 className="max-w-5xl text-balance text-[40px] font-medium leading-[0.98] tracking-[-0.06em] text-ink sm:text-[64px] lg:text-[76px]">
            {p.h1}
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-ink/70">{p.lede}</p>
          <p className="mt-6 font-mono text-[12px] uppercase tracking-[0.12em] text-muted">
            {fill(p.updated, { date })}
          </p>
        </div>
      </section>

      <section className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-[1440px] space-y-14 px-4 sm:px-8 lg:px-12">
          {p.sections.map(([heading, paragraphs]) => (
            <div key={heading} className="max-w-3xl">
              <h2 className="text-2xl font-medium tracking-[-0.04em] text-ink sm:text-3xl">{heading}</h2>
              <div className="mt-5 space-y-4">
                {paragraphs.map((text) => (
                  <p key={text} className="text-base leading-7 text-ink/70">
                    {fill(text, { email: EMAIL })}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer t={t.footer} home={home} base={home} guides={guidesFor(lang)} />
    </main>
  );
}
