"use client";

import { useState } from "react";
import { useAfterPaint } from "@/lib/after-paint";
import type { Shot } from "@/lib/shots";
import { TerminalShot } from "./terminal-screen";

type Item = { caption: string; screen: Shot | null; src: string | null };

/**
 * The same six features, in the window or in the terminal. The window comes
 * first, as everywhere on the site.
 */
export function GalleryTabs({
  items,
  labels,
  cols,
}: {
  items: Item[];
  labels: { terminal: string; window: string };
  cols: number;
}) {
  const hasWindow = items.some((i) => i.src);
  const [mode, setMode] = useState<"terminal" | "window">(hasWindow ? "window" : "terminal");
  // The tab repaints at once; the screens follow after that paint.
  const shownMode = useAfterPaint(mode);
  const shown = items.filter((i) => (shownMode === "terminal" ? i.screen : i.src));

  return (
    <div className="mt-6">
      <div className="inline-flex rounded-full border border-white/[0.12] bg-black/40 p-1" role="tablist">
        {(["window", "terminal"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            disabled={m === "window" && !hasWindow}
            onClick={() => setMode(m)}
            className={`rounded-full px-4 py-1.5 font-mono text-[12px] uppercase tracking-[0.1em] transition disabled:cursor-not-allowed disabled:opacity-35 ${
              mode === m ? "bg-phosphor text-[#0a1008]" : "text-muted hover:text-ink"
            }`}
          >
            {labels[m]}
          </button>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((item) => (
          <figure key={`${shownMode}-${item.caption}`} className="animate-[fadein_.35s_ease]">
            <div className="overflow-hidden rounded-lg border border-white/[0.1] transition hover:border-phosphor/40">
              {shownMode === "terminal" && item.screen ? (
                <TerminalShot shot={item.screen} cols={cols} label={item.caption} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- a capture, served as-is
                <img src={item.src ?? ""} alt={item.caption} loading="lazy" className="block w-full" />
              )}
            </div>
            <figcaption className="mt-2 font-mono text-[12px] text-muted">{item.caption}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
