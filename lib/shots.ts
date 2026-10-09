import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { pack, parseScreen, type Packed } from "./ansi";
import type { Extra, Lang, Scene } from "./i18n";
import type { Theme } from "./product";

/**
 * What scripts/shots/shoot.sh wrote, read at build time. The page is
 * static: nothing here runs in the browser.
 */

const ROOT = process.cwd();
const TUI = path.join(ROOT, "shots", "tui");
/** The width shoot.sh gives tmux; every screen is padded to it. */
export const COLS = 132;

function read(file: string): string | null {
  return existsSync(file) ? readFileSync(file, "utf8") : null;
}

export function tuiScene(lang: Lang, scene: Scene | Extra): Packed | null {
  const raw = read(path.join(TUI, lang, `${scene}.ansi`));
  return raw === null ? null : pack(parseScreen(raw, COLS));
}

export function tuiTheme(lang: Lang, theme: Theme): Packed | null {
  const raw = read(path.join(TUI, lang, "themes", `${theme}.ansi`));
  return raw === null ? null : pack(parseScreen(raw, COLS));
}

/** A terminal screen: kitty's picture when there is one, tmux's text when not. */
export type Shot = { src?: string | null; screen?: Packed | null };

/**
 * Scenes whose kitty picture is not shown yet: the terminal's disk map paints
 * its rectangles in the text colour and some not at all (norte#423). The text
 * capture shows the same, but smaller.
 */
const TEXT_ONLY = new Set<string>(["disk-map"]);

export function tuiShot(lang: Lang, scene: Scene | Extra): Shot | null {
  const src = TEXT_ONLY.has(scene) ? null : kittyShot(lang, scene);
  if (src) return { src };
  const screen = tuiScene(lang, scene);
  return screen ? { screen } : null;
}

export function tuiThemeShot(lang: Lang, theme: Theme): Shot | null {
  const src = kittyShot(lang, `panes-${theme}`);
  if (src) return { src };
  const screen = tuiTheme(lang, theme);
  return screen ? { screen } : null;
}

/** Window captures: public/shots/gui/<lang>/<name>.webp, when shoot-gui.sh ran. */
export function guiShot(lang: Lang, name: string): string | null {
  const rel = `/shots/gui/${lang}/${name}.webp`;
  return existsSync(path.join(ROOT, "public", rel)) ? rel : null;
}

/**
 * The terminal in kitty: public/shots/kitty/<lang>/<name>.webp. Pictures,
 * not text, because kitty draws what tmux never sees: the panel column's
 * icons and the photos in the viewer.
 */
export function kittyShot(lang: Lang, name: string): string | null {
  const rel = `/shots/kitty/${lang}/${name}.webp`;
  return existsSync(path.join(ROOT, "public", rel)) ? rel : null;
}

/** The hero film, when scripts/video/make-hero.py has made it for this language. */
export function heroFilm(lang: Lang): { webm: string; mp4: string; poster: string } | null {
  const base = `/video/hero-${lang}`;
  const has = (ext: string) => existsSync(path.join(ROOT, "public", `${base}${ext}`));
  return has(".webm") && has(".mp4") && has("-poster.webp")
    ? { webm: `${base}.webm`, mp4: `${base}.mp4`, poster: `${base}-poster.webp` }
    : null;
}

/** The window's recorded tour, when shoot.sh could record it. */
export function guiVideo(lang: Lang): string | null {
  const rel = `/shots/gui/${lang}/tour.webm`;
  return existsSync(path.join(ROOT, "public", rel)) ? rel : null;
}
