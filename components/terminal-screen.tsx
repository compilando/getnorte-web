import type { Packed } from "@/lib/ansi";
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
export function TerminalScreen({ screen, cols, label }: { screen: Packed; cols: number; label?: string }) {
  return (
    <div
      className="term"
      style={{ backgroundColor: screen.bg, ["--cols" as string]: cols, ["--rows" as string]: screen.rows.length }}
      dangerouslySetInnerHTML={{ __html: termHtml(screen, label) }}
    />
  );
}
