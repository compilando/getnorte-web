import type { Packed } from "@/lib/ansi";
import { COMPARE_ONLY } from "@/lib/compare";
import { COPY, fill, type Lang } from "@/lib/i18n";
import { COMMANDS, DECISIONS, LINKS, RELEASE, REPO, THEME_ACCENTS, THEMES } from "@/lib/product";
import { COLS, guiShot, guiVideo, heroFilm, tuiReel, tuiScene, tuiTheme } from "@/lib/shots";
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
import { Nav } from "./nav";
import { SignalStrip } from "./signal-strip";
import { TerminalScreen } from "./terminal-screen";
import { guidesFor } from "./topic-page";
import { Tour } from "./tour";

/**
 * The home page tells the idea, in this order: what norte is, why, the one
 * core behind the terminal and the window, the agents, the work that goes on
 * and can be undone, then a short tour, plugins, the comparison in brief,
 * what is new and the download. The rest lives on /features and /compare.
 */
export function Landing({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const home = lang === "en" ? "/" : "/es";
  const { screen } = capturesFor(lang);

  // The hero: the clip, then one still per theme.
  const reel = tuiReel(lang);
  const themes = THEMES.flatMap((id) => {
    const s = tuiTheme(lang, id);
    if (!s) return [];
    return [{ id, screen: s, swatch: [s.bg ?? "#000", THEME_ACCENTS[id]] as [string, string] }];
  });
  const windows = THEMES.flatMap((id) => {
    const src = guiShot(lang, `panes-${id}`);
    return src ? [{ id, src }] : [];
  });

  // The short tour: the six steps named in the copy, in the tour's order.
  const tourSteps = t.tour.steps.filter((s) => t.tour.home.includes(s.scene));
  const screens: Record<string, Packed | null> = {};
  for (const step of tourSteps) screens[step.scene] = tuiScene(lang, step.scene);
  const steps = tourSteps.map((s) => ({ ...s, body: fill(s.body, { commands: COMMANDS }) }));

  const guiPanes = guiShot(lang, "panes-catppuccin-mocha") ?? windows[0]?.src ?? null;
  const tuiPanes = tuiScene(lang, "panes");
  const tiles = t.remotes.tiles.filter(([scene]) => t.remotes.home.includes(scene));

  return (
    <main className="min-h-screen overflow-x-clip bg-base text-ink">
      <JsonLd data={softwareApp(t.meta.description, lang)} />
      <Nav t={t.nav} home={home} />

      {/* Hero */}
      <section id="top" className="noise relative overflow-hidden pt-[68px]">
        <div className="aurora-bg pointer-events-none absolute inset-x-0 top-0 h-[860px] opacity-95" />
        <div className="page-grid pointer-events-none absolute inset-x-0 top-0 h-[1080px] opacity-45 [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
        <div className="relative mx-auto max-w-[1440px] px-4 pb-20 pt-10 sm:px-8 sm:pt-16 lg:px-12 lg:pb-28 lg:pt-12">
          <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-[1.3fr_.7fr] lg:gap-12">
            <div className="max-w-5xl">
              <p className="mb-5 font-mono text-[12px] uppercase tracking-[0.16em] text-phosphor">{t.hero.eyebrow}</p>
              <h1 className="max-w-[1000px] text-balance text-[44px] font-medium leading-[0.94] tracking-[-0.07em] text-ink sm:text-[64px] lg:text-[72px] xl:text-[80px]">
                {t.hero.title[0]}
                <span className="text-phosphor">{t.hero.title[1]}</span>
              </h1>
              <p className="mt-6 max-w-3xl text-balance text-xl font-medium leading-snug tracking-[-0.02em] text-ink sm:text-2xl">
                {t.hero.subtitle}
              </p>
              <p className="mt-4 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8" style={{ color: "#d8ded9" }}>
                {t.hero.lede}
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.1] bg-black/35 p-5 backdrop-blur-md lg:mb-2 lg:bg-black/25">
              <HeroCta t={t.hero} />
            </div>
          </div>

          <div id="stage" className="mx-auto mt-10 max-w-[1240px] scroll-mt-24">
            <HeroStage
              reel={reel}
              themes={themes}
              cols={COLS}
              windows={windows}
              video={guiVideo(lang)}
              film={heroFilm(lang)}
              labels={{ ...t.hero.tabs, theme: t.hero.theme, live: t.hero.live, play: t.hero.play, pause: t.hero.pause }}
            />
            <p className="mt-6 text-center font-mono text-[12px] uppercase tracking-[0.1em] text-muted">
              <span className="text-phosphor">●</span> {t.hero.caption}
            </p>
          </div>
        </div>
      </section>

      <SignalStrip signals={t.signals} />

      {/* Why norte */}
      <Section id="why">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
          <div>
            <Eyebrow>{t.principles.eyebrow}</Eyebrow>
            <p className="mt-5 max-w-xs text-sm leading-6 text-muted">{t.principles.lead}</p>
          </div>
          <h2 className="text-balance text-4xl font-medium leading-[1.02] tracking-[-0.055em] text-ink sm:text-6xl lg:text-7xl">
            {t.principles.title}
            <span className="text-muted">{t.principles.muted}</span>
          </h2>
        </div>
        <div className="mt-16 grid grid-cols-1 border-y border-line sm:grid-cols-2 lg:grid-cols-4">
          {t.principles.items.map(([n, title, body], i) => (
            <article key={n} className={`py-8 sm:px-6 lg:py-10 ${i > 0 ? "border-t border-line sm:border-t-0 sm:border-l" : ""} ${i === 0 ? "sm:pl-0" : ""}`}>
              <span className="font-mono text-[11px] text-phosphor">{n}</span>
              <h3 className="mt-3 text-lg font-medium tracking-[-0.025em] text-ink">{title}</h3>
              <p className="mt-3 text-[15px] leading-6 text-muted">{body}</p>
            </article>
          ))}
        </div>
      </Section>

      {/* Free and open source */}
      <Section id="open" className="border-t border-line/60">
        <Heading eyebrow={t.open.eyebrow} title={t.open.title} body={t.open.body} />
        <div className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {t.open.items.map(([title, body]) => (
            <article key={title} className="rise rounded-2xl border border-white/[0.09] bg-surface p-6">
              <p className="font-mono text-[14px] font-semibold text-phosphor">{title}</p>
              <p className="mt-3 text-[15px] leading-6 text-ink/75">{fill(body, { decisions: DECISIONS })}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
          <MoreLink href={REPO}>{t.open.source}</MoreLink>
          <MoreLink href={LINKS.licensing}>{t.open.license}</MoreLink>
          <MoreLink href={LINKS.contributing}>{t.open.contributing}</MoreLink>
        </div>
      </Section>

      {/* One core: the terminal and the window */}
      <Section id="duo" className="border-t border-line/60">
        <Heading eyebrow={t.duo.eyebrow} title={t.duo.title} body={t.duo.body} />
        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <figure className="rise">
            <AppFrame title="ntc">{tuiPanes && <TerminalScreen screen={tuiPanes} cols={COLS} label={t.duo.terminal} />}</AppFrame>
            <figcaption className="mt-3 font-mono text-[12px] text-muted">{t.duo.terminal}</figcaption>
          </figure>
          <figure className="rise">
            <AppFrame title="norte-gui">
              {guiPanes ? (
                // eslint-disable-next-line @next/next/no-img-element -- a capture, served as-is
                <img src={guiPanes} alt={t.duo.window} className="block w-full" />
              ) : (
                <div className="grid aspect-[132/38] place-items-center p-6 text-center font-mono text-[12px] text-muted">{t.duo.missing}</div>
              )}
            </AppFrame>
            <figcaption className="mt-3 font-mono text-[12px] text-muted">{t.duo.window}</figcaption>
          </figure>
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

        <ol className="mt-12 grid grid-cols-1 gap-2 sm:grid-cols-5" aria-label={t.agents.flowLabel}>
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

      {/* Plugins */}
      <Section id="plugins" className="border-t border-line/60">
        <Heading eyebrow={t.plugins.eyebrow} title={t.plugins.title} body={t.plugins.body} />

        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[1.25fr_.75fr] lg:gap-16">
          <figure className="rise">
            <AppFrame title="ada@norte — F12">{screen("grant", t.plugins.grant)}</AppFrame>
            <figcaption className="mt-3 font-mono text-[12px] text-muted">{t.plugins.grant}</figcaption>
          </figure>
          <Points items={t.plugins.points} />
        </div>

        <h3 className="mt-20 font-mono text-[12px] uppercase tracking-[0.16em] text-phosphor">{t.plugins.kindsTitle}</h3>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {t.plugins.kinds.map(([kind, body, examples]) => (
            <article key={kind} className="rise rounded-2xl border border-white/[0.09] bg-surface p-5 transition hover:border-phosphor/40">
              <p className="font-mono text-[14px] font-semibold text-ink">{kind}</p>
              <p className="mt-2 text-[15px] leading-6 text-ink/70">{body}</p>
              <p className="mt-4 font-mono text-[12px] leading-5 text-phosphor/80">{examples}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
          <MoreLink href={`${t.paths.features}#plugins`}>{t.plugins.more}</MoreLink>
          <MoreLink href={LINKS.plugins}>{t.plugins.guide}</MoreLink>
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

      {/* What's new */}
      <Section id="new" className="border-t border-line/60">
        <Eyebrow>{fill(t.news.eyebrow, { version: RELEASE.label })}</Eyebrow>
        <h2 className="mt-5 max-w-4xl text-balance text-4xl font-medium leading-[1.02] tracking-[-0.055em] text-ink sm:text-6xl">{t.news.title}</h2>
        <div className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {t.news.items.map(([title, body, tag]) => (
            <article
              key={title}
              className="rise sheen relative overflow-hidden rounded-2xl border border-white/[0.09] bg-surface p-6 transition hover:border-phosphor/40"
            >
              <p className="font-mono text-[12px] text-phosphor">{tag}</p>
              <h3 className="mt-6 text-xl font-medium tracking-[-0.03em] text-ink">{title}</h3>
              <p className="mt-3 text-[15px] leading-6 text-muted">{body}</p>
            </article>
          ))}
        </div>
        <div className="mt-10">
          <MoreLink href={`${t.paths.features}#new`}>{t.news.more}</MoreLink>
        </div>
      </Section>

      <FinalCta t={t.cta} />
      <Footer t={t.footer} home={home} guides={guidesFor(lang)} />
    </main>
  );
}
