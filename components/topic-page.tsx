import type { ReactNode } from "react";
import { COPY, type Extra, type Lang, type Scene } from "@/lib/i18n";
import { LINKS } from "@/lib/product";
import { COLS, guiShot, tuiScene } from "@/lib/shots";
import { type Topic, TOPIC_COPY, TOPICS, topicPath } from "@/lib/topics";
import { AppFrame } from "./app-frame";
import { CompareTable, NotFor } from "./compare-table";
import { CopyRow, FinalCta } from "./final-cta";
import { Footer } from "./footer";
import { HeroInstall } from "./hero-install";
import { faqPage, JsonLd, softwareApp } from "./json-ld";
import { Nav } from "./nav";
import { TerminalScreen } from "./terminal-screen";

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-phosphor">{children}</p>;
}

/** Every topic, in this language, as the footer's "Guides" column. */
export function guidesFor(lang: Lang): [string, string][] {
  return TOPICS.map((t) => [TOPIC_COPY[t][lang].label, topicPath(t, lang)]);
}

/**
 * One topic: a hero with the install box, a few sections each with its real
 * capture, what else the topic needs (the comparison, the agent setup), the
 * questions people ask, and the same download section as the home page.
 */
export function TopicPage({ topic, lang }: { topic: Topic; lang: Lang }) {
  const t = COPY[lang];
  const c = TOPIC_COPY[topic][lang];
  const home = lang === "en" ? "/" : "/es";
  const other: Lang = lang === "en" ? "es" : "en";

  const shot = (ref: string, label: string) => {
    const [kind, name] = ref.split(":");
    if (kind === "tui") {
      const s = tuiScene(lang, name as Scene | Extra);
      return s ? <TerminalScreen screen={s} cols={COLS} label={label} /> : null;
    }
    const src = guiShot(lang, name);
    // eslint-disable-next-line @next/next/no-img-element -- a capture, served as-is
    return src ? <img src={src} alt={label} loading="lazy" className="block w-full" /> : null;
  };

  return (
    <main className="min-h-screen overflow-x-clip bg-base text-ink">
      <JsonLd data={softwareApp(c.description, lang)} />
      <JsonLd data={faqPage(c.faq)} />
      <Nav t={t.nav} home={home} base={home} otherHref={topicPath(topic, other)} />

      <section className="noise relative overflow-hidden pt-[68px]">
        <div className="aurora-bg pointer-events-none absolute inset-x-0 top-0 h-[720px] opacity-80" />
        <div className="relative mx-auto grid max-w-[1440px] grid-cols-1 items-end gap-10 px-4 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.25fr_.75fr] lg:px-12 lg:pt-24">
          <div>
            <p className="mb-6 font-mono text-[12px] uppercase tracking-[0.16em] text-ink/70">
              <a href={home} className="hover:text-ink">norte</a> <span className="text-line">/</span> {c.eyebrow}
            </p>
            <h1 className="max-w-4xl text-balance text-[40px] font-medium leading-[0.98] tracking-[-0.06em] text-ink sm:text-[64px] lg:text-[76px]">
              {c.h1}
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-ink/70">{c.lede}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.1] bg-black/40 p-5 backdrop-blur-md">
            <HeroInstall t={t.hero.install} docs={LINKS.readme} docsLabel={t.hero.secondary} />
          </div>
        </div>
      </section>

      {c.sections.map((s, i) => (
        <section key={s.h2} className="border-t border-line/60 py-20 sm:py-28">
          <div
            className={`mx-auto grid max-w-[1440px] items-center gap-10 px-4 sm:px-8 lg:gap-16 lg:px-12 ${
              i % 2 ? "lg:grid-cols-[1.2fr_.8fr]" : "lg:grid-cols-[.8fr_1.2fr]"
            }`}
          >
            <div className={i % 2 ? "lg:order-last" : ""}>
              <Eyebrow>{String(i + 1).padStart(2, "0")}</Eyebrow>
              <h2 className="mt-4 text-balance text-3xl font-medium leading-[1.05] tracking-[-0.045em] text-ink sm:text-5xl">{s.h2}</h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-ink/65 sm:text-lg sm:leading-8">{s.body}</p>
            </div>
            <figure className="rise">
              <AppFrame title={s.frame}>{shot(s.shot, s.h2)}</AppFrame>
            </figure>
          </div>
        </section>
      ))}

      {c.extras?.includes("agentSetup") && (
        <section className="border-t border-line/60 py-20 sm:py-28">
          <div className="mx-auto max-w-[1100px] px-4 sm:px-8">
            <Eyebrow>{t.agents.hookup}</Eyebrow>
            <div className="mt-6 overflow-hidden rounded-xl border border-white/[0.12] bg-black/45">
              <CopyRow label="Claude Code" command={t.agents.hookupCommand} t={t.cta} />
              <CopyRow
                label={lang === "en" ? "policy.toml: agents ask (read at the daemon's start)" : "policy.toml: los agentes preguntan (se lee al arrancar el daemon)"}
                command={`printf '[[rule]]\\nactor = "agent"\\naction = "ask"\\n' >> ~/.config/norte/policy.toml`}
                t={t.cta}
              />
              <CopyRow label="norte" command="norte policy grant <request_id>   ·   norte undo <session>" t={t.cta} />
            </div>
          </div>
        </section>
      )}

      {c.extras?.includes("compare") && (
        <section className="border-t border-line/60 py-20 sm:py-28">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
            <Eyebrow>{t.compare.eyebrow}</Eyebrow>
            <h2 className="mt-4 max-w-4xl text-balance text-3xl font-medium leading-[1.05] tracking-[-0.045em] text-ink sm:text-5xl">
              {t.compare.title}
            </h2>
            <div className="mt-12">
              <CompareTable t={t.compare} lang={lang} />
            </div>
            <div className="mt-14">
              <NotFor t={t.compare} />
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-line/60 py-20 sm:py-28">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-8">
          <Eyebrow>FAQ</Eyebrow>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {c.faq.map(([q, a]) => (
              <details key={q} className="group py-5" open>
                <summary className="cursor-pointer list-none text-lg font-medium tracking-[-0.02em] text-ink">
                  <span className="mr-3 font-mono text-[12px] text-phosphor transition-transform group-open:rotate-90">›</span>
                  {q}
                </summary>
                <p className="mt-3 max-w-3xl pl-6 text-sm leading-7 text-muted">{a}</p>
              </details>
            ))}
          </div>
          <p className="mt-10 text-sm text-muted">
            <a href={home} className="text-ink underline decoration-white/30 underline-offset-4 hover:decoration-phosphor">
              {lang === "en" ? "See everything norte does →" : "Todo lo que hace norte →"}
            </a>
          </p>
        </div>
      </section>

      <FinalCta t={t.cta} />
      <Footer t={t.footer} home={home} base={home} guides={guidesFor(lang)} />
    </main>
  );
}
