import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { pack, parseReel, parseScreen, type Packed } from "./ansi";
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

export function tuiReel(lang: Lang): Packed[] {
  const raw = read(path.join(TUI, lang, "reel.ansi"));
  return raw === null ? [] : parseReel(raw, COLS).map(pack);
}

/** Window captures: public/shots/gui/<lang>/<name>.webp, when shoot-gui.sh ran. */
export function guiShot(lang: Lang, name: string): string | null {
  const rel = `/shots/gui/${lang}/${name}.webp`;
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
