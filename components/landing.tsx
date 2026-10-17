import { COMPARE_ONLY } from "@/lib/compare";
import { COPY, fill, type Lang, type Scene } from "@/lib/i18n";
import { COMMANDS } from "@/lib/product";
import { COLS, guiShot, heroFilm, type Shot, tuiShot, tuiThemeShot } from "@/lib/shots";
import { AgentSteps } from "./agent-steps";
import { AppFrame } from "./app-frame";
import { capturesFor, Eyebrow, Heading, MoreLink, Points, Section } from "./blocks";
import { NotFor } from "./compare-table";
import { CoreDiagram } from "./core-diagram";
import { CopyRow, FinalCta } from "./final-cta";
import { Footer } from "./footer";
import { HeroCta } from "./hero-cta";
import { JsonLd, softwareApp } from "./json-ld";
import { HeroStage } from "./hero-stage";
import { Join } from "./join";
import { Nav } from "./nav";
import { SignalStrip } from "./signal-strip";
import { guidesFor } from "./topic-page";
import { Tour } from "./tour";

/** The hero's views, in order; shoot.sh's hero theme paints the panes. */
const HERO_VIEWS = ["panes"];
const HERO_THEME = "catppuccin-mocha";

/**
 * The home page tells the idea, in this order: what norte is, why, the one
 * work that carries on in the background, remotes, governed agents, a short
 * product tour, an honest comparison and the next step. Detail lives on
 * /features and /compare instead of making the home page carry the whole manual.
 */
export function Landing({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const home = lang === "en" ? "/" : "/es";
  const { screen } = capturesFor(lang);

  // The hero: the window's views first, then the terminal's (kitty, or the
  // text of tmux when there are no kitty shots), and per theme the panes in both.
  const heroView = (id: string, shot: Shot | null) => (shot ? [{ id, caption: t.hero.views[id] ?? id, ...shot }] : []);
  const heroWindows = HERO_VIEWS.flatMap((id) => {
    const src = guiShot(lang, id === "panes" ? `panes-${HERO_THEME}` : id);
    return heroView(id, src ? { src } : null);
  });
  // The disk map is left out until kitty paints it right (lib/shots.ts).
  const heroTerminals = HERO_VIEWS.filter((id) => id !== "disk-map").flatMap((id) =>
    heroView(id, id === "panes" ? tuiThemeShot(lang, HERO_THEME) : tuiShot(lang, id as Scene)),
  );
  // The short tour: the six steps named in the copy, in the tour's order.
  const tourSteps = t.tour.steps.filter((s) => t.tour.home.includes(s.scene));
  const screens: Record<string, Shot | null> = {};
  for (const step of tourSteps) screens[step.scene] = tuiShot(lang, step.scene);
  const steps = tourSteps.map((s) => ({ ...s, body: fill(s.body, { commands: COMMANDS }) }));

  const tiles = t.remotes.tiles.filter(([scene]) => t.remotes.home.includes(scene));

  return (
    <main className="min-h-screen overflow-x-clip bg-base text-ink">
      <JsonLd data={softwareApp(t.meta.description, lang)} />
      <Nav t={t.nav} home={home} />

      {/* Hero */}
      <section id="top" className="noise relative overflow-hidden pt-[68px]">
        <div className="aurora-bg pointer-events-none absolute inset-x-0 top-0 h-full opacity-90" />
        <div className="page-grid pointer-events-none absolute inset-0 opacity-35 [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />
        <div className="relative mx-auto max-w-[1540px] px-4 pb-14 pt-7 sm:px-8 sm:pb-16 sm:pt-9 lg:px-10 lg:pb-20 lg:pt-8">
          <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-[.7fr_1.3fr] lg:gap-14 xl:gap-20">
            <div className="max-w-2xl">
              <p className="mb-5 font-mono text-[12px] uppercase tracking-[0.16em] text-phosphor">{t.hero.eyebrow}</p>
              <h1 className="text-balance text-[50px] font-medium leading-[0.93] tracking-[-0.068em] text-ink sm:text-[68px] lg:text-[64px] xl:text-[72px]">
                {t.hero.title[0]}
                <span className="text-phosphor"> {t.hero.title[1]}</span>
              </h1>
              <p className="mt-7 max-w-xl text-balance text-lg font-medium leading-7 tracking-[-0.02em] text-ink sm:text-xl sm:leading-8">
                {t.hero.subtitle}
              </p>
              <p className="mt-5 max-w-xl border-l border-phosphor/40 pl-4 text-[15px] leading-6 text-ink/75 sm:text-base sm:leading-7">
                {t.hero.lede}
              </p>
              <div className="mt-9">
                <HeroCta t={t.hero} />
              </div>
              <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.1em] text-ink/60">
                {t.hero.cta.trust.join(" · ")}
              </p>
            </div>
            <div id="stage" className="min-w-0 scroll-mt-24">
              <HeroStage
                windows={heroWindows}
                terminals={heroTerminals}
                cols={COLS}
                film={heroFilm(lang)}
                labels={{ ...t.hero.tabs, theme: t.hero.theme }}
              />
              <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.09em] text-muted">
                <span className="text-phosphor">●</span> {t.hero.caption}
              </p>
            </div>
          </div>
        </div>
      </section>

      <SignalStrip signals={t.signals} />

      {/* Why norte */}
      <Section id="why">
        <div className="max-w-6xl">
          <Eyebrow>{t.principles.eyebrow}</Eyebrow>
          <h2 className="mt-5 text-balance text-4xl font-medium leading-[1.02] tracking-[-0.055em] text-ink sm:text-6xl lg:text-7xl">
            {t.principles.title}
            <span className="text-muted">{t.principles.muted}</span>
          </h2>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-ink/70 sm:text-xl">
            {t.principles.lead}
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-12 border-t border-line pt-10 lg:grid-cols-[1.12fr_.88fr] lg:gap-16">
          <article className="rise">
            <div className="flex items-start gap-5">
              <span className="pt-1 font-mono text-[13px] text-phosphor">{t.principles.items[0][0]}</span>
              <div>
                <h3 className="text-3xl font-medium leading-tight tracking-[-0.045em] text-ink sm:text-4xl">{t.principles.items[0][1]}</h3>
                <p className="mt-4 max-w-xl text-base leading-7 text-ink/70">{t.principles.items[0][2]}</p>
              </div>
            </div>
            <div className="mt-8">
              <AppFrame title="ada@norte — SFTP">{screen("sftp", t.principles.items[0][1])}</AppFrame>
            </div>
            <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.11em] text-phosphor">
              Local <span className="px-2 text-muted">→</span> SFTP <span className="px-2 text-muted">→</span> S3
              <span className="px-2 text-muted">→</span> ZIP / TAR / RAR
            </p>
          </article>

          <ol className="rise divide-y divide-line border-y border-line">
            {t.principles.items.slice(1).map(([n, title, body]) => (
              <li key={n} className="grid grid-cols-[2.5rem_1fr] gap-4 py-8 first:pt-1 lg:py-9">
                <span className="pt-1 font-mono text-[13px] text-phosphor">{n}</span>
                <div>
                  <h3 className="text-2xl font-medium leading-tight tracking-[-0.035em] text-ink">{title}</h3>
                  <p className="mt-3 max-w-lg text-[15px] leading-6 text-ink/70">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* Remotes and archives */}
      <Section id="remotes" className="border-t border-line/60">
        <Heading eyebrow={t.remotes.eyebrow} title={t.remotes.title} body={t.remotes.body} />
        <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2">
          {tiles.map(([scene, tag, caption]) => (
            <figure key={scene} className="rise">
              <AppFrame title={`ada@norte — ${tag}`}>{screen(scene, caption)}</AppFrame>
              <figcaption className="mt-3">
                <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-phosphor">{tag}</span>
                <span className="mt-1 block text-[15px] leading-6 text-muted">{caption}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* Agents */}
      <Section id="agents" className="border-t border-line/60">
        <Heading eyebrow={t.agents.eyebrow} title={t.agents.title} body={t.agents.body} />

        <ol className="mt-12 grid grid-cols-1 gap-2 sm:grid-cols-4" aria-label={t.agents.flowLabel}>
          {t.agents.flow.map(([who, what], i) => (
            <li key={who} className="relative rounded-xl border border-white/[0.09] bg-surface px-4 py-3">
              <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-phosphor">{who}</span>
              <span className="mt-1 block text-[15px] leading-6 text-ink/85">{what}</span>
              {i < t.agents.flow.length - 1 && (
                <span className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 text-phosphor sm:block" aria-hidden>
                  →
                </span>
              )}
            </li>
          ))}
        </ol>

        <div className="rise mt-10">
          <AgentSteps
            steps={t.agents.steps.map(([, title, body, frame]) => ({ title, body, frame }))}
            screens={t.agents.steps.map(([scene, title]) => screen(scene, title))}
            caption={t.agents.stepsCaption}
          />
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_.9fr] lg:gap-16">
          <Points items={t.agents.points} />
          <div className="self-start overflow-hidden rounded-xl border border-white/[0.12] bg-black/45">
            <CopyRow label={t.agents.hookup} command={t.agents.hookupCommand} t={t.cta} />
          </div>
        </div>
      </Section>

      {/* Work in the background, and the journal */}
      <Section id="core" className="border-t border-line/60">
        <Heading eyebrow={t.core.eyebrow} title={t.core.title} body={t.core.body} />

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {(
            [
              ["daemon-a", "ada@norte — ntc #1", t.core.first],
              ["daemon-b", "ada@norte — ntc #2", t.core.second],
            ] as const
          ).map(([scene, title, caption]) => (
            <figure key={scene} className="rise">
              <AppFrame title={title}>{screen(scene, caption)}</AppFrame>
              <figcaption className="mt-3 flex items-start gap-2 font-mono text-[12px] text-muted">
                <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-phosphor shadow-[0_0_8px_#B7FF52]" />
                {caption}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_.9fr] lg:gap-16">
          <Points items={t.core.points} />
          <div className="page-grid rise self-start rounded-2xl border border-white/[0.09] bg-surface/60 p-4 sm:p-6">
            <CoreDiagram t={t.core} />
          </div>
        </div>
      </Section>

      {/* Tour, short */}
      <Section id="tour" className="border-t border-line/60">
        <Eyebrow>{t.tour.eyebrow}</Eyebrow>
        <h2 className="mt-5 max-w-4xl text-balance text-4xl font-medium leading-[1.02] tracking-[-0.055em] text-ink sm:text-6xl">{t.tour.title}</h2>
        <div className="mt-8">
          <Tour steps={steps} screens={screens} cols={COLS} />
        </div>
        <div className="mt-10">
          <MoreLink href={t.paths.features}>{t.tour.more}</MoreLink>
        </div>
      </Section>

      {/* The comparison, in brief */}
      <Section id="compare" className="border-t border-line/60">
        <Heading eyebrow={t.compare.eyebrow} title={t.compare.title} body={t.compare.summary} />
        <div className="mt-14 rounded-2xl border border-white/[0.09] bg-surface p-6 sm:p-8">
          <h3 className="font-mono text-[12px] uppercase tracking-[0.16em] text-phosphor">{t.compare.onlyTitle}</h3>
          <ul className="mt-6 grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
            {COMPARE_ONLY.map((row) => (
              <li key={row.label.en} className="flex items-start gap-3 text-[16px] leading-6 text-ink/90">
                <span className="text-lg font-semibold leading-6 text-phosphor" aria-hidden>
                  ✓
                </span>
                {row.label[lang]}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <MoreLink href={t.paths.compare}>{t.compare.more}</MoreLink>
          </div>
        </div>
        <div className="mt-14">
          <NotFor t={t.compare} />
        </div>
      </Section>

      <Join t={t.join} contributing={t.open.contributing} />

      <FinalCta t={t.cta} />
      <Footer t={t.footer} home={home} guides={guidesFor(lang)} />
    </main>
  );
}
