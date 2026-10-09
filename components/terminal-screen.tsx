import type { Packed } from "@/lib/ansi";
import type { Shot } from "@/lib/shots";
import { termHtml } from "@/lib/term-html";

/**
 * A captured terminal screen painted as text. It scales with its container
 * (`cqw`): the font is sized so the screen's columns fill the width exactly,
 * which is what keeps the box drawing aligned at any size. It renders on the
 * server and in the browser alike.
 *
 * The rows come in as one HTML string (lib/term-html.ts), and `--rows` gives
 * the box its exact height before it is laid out, so `.term` can skip the
 * work for screens that are off screen without moving anything around.
 */
/**
 * A terminal capture whichever way it was taken: kitty's picture, with the
 * icons and photos only a real terminal draws, or tmux's text.
 */
export function TerminalShot({ shot, cols, label, lazy = true }: { shot: Shot; cols: number; label?: string; lazy?: boolean }) {
  if (shot.src) {
    // eslint-disable-next-line @next/next/no-img-element -- a capture, served as-is
    return <img src={shot.src} alt={label ?? ""} loading={lazy ? "lazy" : undefined} decoding="async" className="block w-full" />;
  }
  return shot.screen ? <TerminalScreen screen={shot.screen} cols={cols} label={label} /> : null;
}

export function TerminalScreen({ screen, cols, label }: { screen: Packed; cols: number; label?: string }) {
  return (
    <div
      className="term"
      style={{ backgroundColor: screen.bg, ["--cols" as string]: cols, ["--rows" as string]: screen.rows.length }}
      dangerouslySetInnerHTML={{ __html: termHtml(screen, label) }}
    />
  );
}
