import { isWide, isZero, type Packed, type Style } from "./ansi";

/**
 * A captured screen as one HTML string: the same markup TerminalScreen used to
 * build out of React elements, one span per run. A screen is thousands of
 * spans, and as elements they cost twice: once in the HTML, once more as a
 * tree in the page's React payload, and again whenever the hero's reel swapped
 * a frame. As a string they travel once, hydrate as a single node, and a swap
 * is one innerHTML. Pure: it runs on the server and in the browser alike.
 */

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function css(r: Style, screen: Packed): string {
  let fg = r.fg;
  let bg = r.bg;
  if (r.reverse) [fg, bg] = [bg ?? screen.bg, fg ?? screen.fg];
  // Dim blends the INK towards its background; opacity would fade the background too.
  if (r.dim) fg = `color-mix(in srgb, ${fg ?? screen.fg ?? "currentColor"} 55%, ${bg ?? screen.bg ?? "transparent"})`;
  let s = "";
  if (fg) s += `color:${fg};`;
  if (bg && bg !== screen.bg) s += `background-color:${bg};`;
  if (r.bold) s += "font-weight:700;";
  if (r.italic) s += "font-style:italic;";
  if (r.underline) s += "text-decoration:underline;";
  return s;
}

/**
 * Wide characters get a two-cell box of their own; a zero-width one (a
 * combining accent, VS16) stays glued to the character it modifies.
 */
function text(t: string): string {
  if (![...t].some(isWide)) return escape(t);
  let out = "";
  let open = false;
  for (const ch of t) {
    if (isZero(ch)) {
      out += escape(ch);
      continue;
    }
    if (open) {
      out += "</span>";
      open = false;
    }
    if (isWide(ch)) {
      out += `<span class="term-wide">${escape(ch)}`;
      open = true;
    } else out += escape(ch);
  }
  return open ? `${out}</span>` : out;
}

/** The `<pre>` inside `.term`: rows of runs, each run a span when it has a style. */
export function termHtml(screen: Packed, label?: string): string {
  const styles = screen.styles.map((s) => css(s, screen));
  const aria = label ? ` aria-label="${escape(label)}"` : "";
  const color = screen.fg ? ` style="color:${screen.fg}"` : "";
  let out = `<pre role="img"${aria}${color}>`;
  for (const row of screen.rows) {
    out += "<span>";
    for (const [t, s] of row) out += styles[s] ? `<span style="${styles[s]}">${text(t)}</span>` : text(t);
    out += "\n</span>";
  }
  return `${out}</pre>`;
}
