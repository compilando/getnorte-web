import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { pack, parseScreen, type Packed } from "./ansi";
import type { Extra, Lang, Scene } from "./i18n";
import { type Theme, THEME_LOOKS, THEMES } from "./product";
import { SHOT_SIZE, type ShotKind } from "./shot-sizes";

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

/** A WebP's width and height, from its header: lossy (VP8), lossless (VP8L) or extended (VP8X). */
function webpSize(file: string): [number, number] | null {
  const b = readFileSync(file);
  if (b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WEBP") return null;
  const chunk = b.toString("ascii", 12, 16);
  if (chunk === "VP8 ") return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  if (chunk === "VP8L") {
    const bits = b.readUInt32LE(21);
    return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
  }
  if (chunk === "VP8X") return [b.readUIntLE(24, 3) + 1, b.readUIntLE(27, 3) + 1];
  return null;
}

/** The capture's public path if it exists, after checking it has the size SHOT_SIZE promises the page. */
function capture(kind: ShotKind, lang: Lang, name: string): string | null {
  const rel = `/shots/${kind}/${lang}/${name}.webp`;
  const file = path.join(ROOT, "public", rel);
  if (!existsSync(file)) return null;
  const size = webpSize(file);
  const [w, h] = SHOT_SIZE[kind];
  if (!size || size[0] !== w || size[1] !== h) {
    throw new Error(`${rel} is ${size ? size.join("x") : "not a WebP"}, not ${w}x${h}: update SHOT_SIZE in lib/shot-sizes.ts`);
  }
  return rel;
}

/** Window captures: public/shots/gui/<lang>/<name>.webp, when shoot-gui.sh ran. */
export function guiShot(lang: Lang, name: string): string | null {
  return capture("gui", lang, name);
}

/**
 * The terminal in kitty: public/shots/kitty/<lang>/<name>.webp. Pictures,
 * not text, because kitty draws what tmux never sees: the panel column's
 * icons and the photos in the viewer.
 */
export function kittyShot(lang: Lang, name: string): string | null {
  return capture("kitty", lang, name);
}

/** One theme for the theme picker: its look, and the panes scene in it, in the window and in kitty. */
export type ThemeView = { id: Theme; name: string; bg: string; accent: string; window: string | null; terminal: string | null };

export function themeViews(lang: Lang): ThemeView[] {
  return THEMES.map((id) => ({
    id,
    ...THEME_LOOKS[id],
    window: guiShot(lang, `panes-${id}`),
    terminal: kittyShot(lang, `panes-${id}`),
  })).filter((v) => v.window || v.terminal);
}

type Film = { webm: string; mp4: string; poster: string };

function film(lang: Lang, name: "hero" | "hero-full"): Film | null {
  const base = `/video/${name}-${lang}`;
  const has = (ext: string) => existsSync(path.join(ROOT, "public", `${base}${ext}`));
  return has(".webm") && has(".mp4") && has("-poster.webp")
    ? { webm: `${base}.webm`, mp4: `${base}.mp4`, poster: `${base}-poster.webp` }
    : null;
}

/** The looping hero and the longer, user-invoked demo made by make-hero.py. */
export function heroFilm(lang: Lang): Film | null {
  return film(lang, "hero");
}

export function heroFullFilm(lang: Lang): Film | null {
  return film(lang, "hero-full");
}

/** The window's recorded tour, when shoot.sh could record it. */
export function guiVideo(lang: Lang): string | null {
  const rel = `/shots/gui/${lang}/tour.webm`;
  return existsSync(path.join(ROOT, "public", rel)) ? rel : null;
}
