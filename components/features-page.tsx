import type { Packed } from "@/lib/ansi";
import { COPY, fill, type Lang } from "@/lib/i18n";
import { COMMANDS, LINKS, RELEASE, THEMES } from "@/lib/product";
import { COLS, guiShot, tuiScene, tuiTheme } from "@/lib/shots";
import { AppFrame } from "./app-frame";
import { capturesFor, Eyebrow, Heading, MoreLink, Points, Section } from "./blocks";
import { CoreDiagram } from "./core-diagram";
import { CopyRow, FinalCta } from "./final-cta";
import { Footer } from "./footer";
import { GalleryTabs } from "./gallery-tabs";
import { JsonLd, softwareApp } from "./json-ld";
import { Nav } from "./nav";
import { TerminalScreen } from "./terminal-screen";
import { guidesFor } from "./topic-page";
import { Tour } from "./tour";

/**
 * Everything the home page leaves out to stay short: the whole tour, both
 * frontends side by side, every remote, the daemon's commands, the themes,
 * the plugins at work and what is new, with its captures.
 */
export function FeaturesPage({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const f = t.features;
  const home = t.paths.home;
  const other: Lang = lang === "en" ? "es" : "en";
  const { screen, shot } = capturesFor(lang);

  const screens: Record<string, Packed | null> = {};
  for (const step of t.tour.steps) screens[step.scene] = tuiScene(lang, step.scene);
  const steps = t.tour.steps.map((s) => ({ ...s, body: fill(s.body, { commands: COMMANDS }) }));
  const gallery = t.duo.gallery.map(([name, caption]) => ({ caption, screen: tuiScene(lang, name), src: guiShot(lang, name) }));
  const themes = THEMES.flatMap((id) => {
    const s = tuiTheme(lang, id);
    return s ? [{ id, screen: s }] : [];
  });
  const featured = t.news.items.filter((item) => item[3]);
  const plain = t.news.items.filter((item) => !item[3]);

  return (
    <main className="min-h-screen overflow-x-clip bg-base text-ink">
      <JsonLd data={softwareApp(f.description, lang)} />
      <Nav t={t.nav} home={home} base={home} otherHref={COPY[other].paths.features} />

      <section className="noise relative overflow-hidden pt-[68px]">
        <div className="aurora-bg pointer-events-none absolute inset-x-0 top-0 h-[620px] opacity-80" />
        <div className="relative mx-auto max-w-[1440px] px-4 pb-16 pt-16 sm:px-8 lg:px-12 lg:pt-24">
          <p className="mb-6 font-mono text-[12px] uppercase tracking-[0.16em] text-ink/70">
            <a href={home} className="hover:text-ink">norte</a> <span className="text-line">/</span> {f.eyebrow}
          </p>
          <h1 className="max-w-5xl text-balance text-[40px] font-medium leading-[0.98] tracking-[-0.06em] text-ink sm:text-[64px] lg:text-[76px]">
            {f.h1}
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-ink/70">{f.lede}</p>
          <nav className="mt-10 flex flex-wrap gap-2" aria-label={f.eyebrow}>
            {f.jump.map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="rounded-full border border-white/[0.14] bg-black/30 px-3.5 py-1.5 font-mono text-[12px] uppercase tracking-[0.08em] text-ink/80 transition hover:border-phosphor/60 hover:text-phosphor"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <Section id="tour" className="border-t border-line/60">
        <Eyebrow>{t.tour.eyebrow}</Eyebrow>
        <h2 className="mt-5 max-w-4xl text-balance text-4xl font-medium leading-[1.02] tracking-[-0.055em] text-ink sm:text-6xl">{t.tour.title}</h2>
        <div className="mt-8">
          <Tour steps={steps} screens={screens} cols={COLS} />
        </div>
      </Section>

      <Section id="duo" className="border-t border-line/60">
        <Heading eyebrow={t.duo.eyebrow} title={f.galleryTitle} body={t.duo.body} />
        <GalleryTabs items={gallery} labels={t.duo.galleryTabs} cols={COLS} />
      </Section>

      <Section id="remotes" className="border-t border-line/60">
        <Heading eyebrow={t.remotes.eyebrow} title={t.remotes.title} body={t.remotes.body} />
        <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2">
          {t.remotes.tiles.map(([scene, tag, caption]) => (
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

      <Section id="core" className="border-t border-line/60">
        <Heading eyebrow={t.core.eyebrow} title={t.core.title} body={t.core.body} />
        <div className="page-grid rise mt-14 rounded-2xl border border-white/[0.09] bg-surface/60 p-4 sm:p-8">
          <CoreDiagram t={t.core} />
        </div>
        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_.9fr] lg:gap-16">
          <Points items={t.core.points} />
          <div>
            <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-black/45">
              <div className="border-b border-white/[0.09] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted sm:px-5">
                {t.core.tryIt}
              </div>
              {t.core.commands.map(([label, command]) => (
                <CopyRow key={command} label={label} command={command} t={t.cta} />
              ))}
            </div>
            <p className="mt-4 font-mono text-[12px] leading-5 text-muted">{t.core.local}</p>
          </div>
        </div>
      </Section>

      <Section id="themes" className="border-t border-line/60">
        <Heading
          eyebrow={t.themes.eyebrow}
          title={t.themes.title}
          body={
            <>
              <p>{t.themes.body}</p>
              <p className="mt-3 font-mono text-[12px] uppercase tracking-[0.1em] text-muted">{f.themesPick}</p>
            </>
          }
        />
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {themes.map(({ id, screen: s }) => (
            <figure key={id} className="rise overflow-hidden rounded-lg border border-white/[0.1]">
              <TerminalScreen screen={s} cols={COLS} label={id} />
              <figcaption className="bg-[#0c0f10] px-3 py-2 font-mono text-[12px] text-muted">{id}</figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section id="plugins" className="border-t border-line/60">
        <Heading eyebrow={t.plugins.eyebrow} title={t.plugins.atWork} body={t.plugins.body} />
        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {t.plugins.shots.map(([scene, caption]) => (
            <figure key={scene} className="rise">
              <AppFrame title={`ada@norte — ${caption.split(":")[0]}`}>{screen(scene, caption)}</AppFrame>
              <figcaption className="mt-3 text-[14px] leading-6 text-muted">{caption}</figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-6 max-w-3xl text-[14px] leading-6 text-muted">{t.plugins.limits}</p>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
          <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-black/45">
            <div className="border-b border-white/[0.09] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted sm:px-5">
              {t.plugins.build}
            </div>
            {t.plugins.buildSteps.map(([label, command]) => (
              <CopyRow key={command} label={label} command={command} t={t.cta} />
            ))}
          </div>
          <div>
            <MoreLink href={LINKS.plugins}>{t.plugins.guide}</MoreLink>
          </div>
        </div>
      </Section>

      <Section id="new" className="border-t border-line/60">
        <Eyebrow>{fill(t.news.eyebrow, { version: RELEASE.label })}</Eyebrow>
        <h2 className="mt-5 max-w-4xl text-balance text-4xl font-medium leading-[1.02] tracking-[-0.055em] text-ink sm:text-6xl">{t.news.title}</h2>
        <div className="mt-14 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {featured.map(([title, body, tag, ref]) => (
            <article key={title} className="rise relative overflow-hidden rounded-2xl border border-white/[0.09] bg-surface">
              <div className="border-b border-white/[0.08]">{ref && shot(ref, title)}</div>
              <div className="p-6">
                <p className="font-mono text-[12px] text-phosphor">{tag}</p>
                <h3 className="mt-4 text-xl font-medium tracking-[-0.03em] text-ink">{title}</h3>
                <p className="mt-2 text-[15px] leading-6 text-muted">{body}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {plain.map(([title, body, tag]) => (
            <article key={title} className="rise relative overflow-hidden rounded-2xl border border-white/[0.09] bg-surface p-6">
              <p className="font-mono text-[12px] text-phosphor">{tag}</p>
              <h3 className="mt-6 text-xl font-medium tracking-[-0.03em] text-ink">{title}</h3>
              <p className="mt-3 text-[15px] leading-6 text-muted">{body}</p>
            </article>
          ))}
        </div>
      </Section>

      <FinalCta t={t.cta} />
      <Footer t={t.footer} home={home} base={home} guides={guidesFor(lang)} />
    </main>
  );
}
