import { COPY, fill, type Lang } from "@/lib/i18n";
import { themeViews } from "@/lib/shots";
import { Heading, Section } from "./blocks";
import { ThemePicker } from "./theme-picker";

/** The themes, on the home page and on /features: the same section, the same picker. */
export function ThemesSection({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const th = t.themes;
  const themes = themeViews(lang).map((v) => ({
    ...v,
    alt: {
      window: fill(th.alt, { theme: v.name, mode: th.window.toLowerCase() }),
      terminal: fill(th.alt, { theme: v.name, mode: th.terminal.toLowerCase() }),
    },
  }));
  if (!themes.length) return null;

  return (
    <Section id="themes" className="border-t border-line/60">
      <Heading eyebrow={th.eyebrow} title={th.title} body={th.body} />
      <div className="mt-10">
        <ThemePicker
          themes={themes}
          labels={{
            window: th.window,
            terminal: th.terminal,
            group: th.group,
            pick: th.pick,
            setting: th.setting,
            importTitle: th.importTitle,
            importBody: th.importBody,
            copy: t.cta.copy,
            copied: t.cta.copied,
          }}
        />
      </div>
    </Section>
  );
}
