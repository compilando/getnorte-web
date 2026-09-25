"use client";

import { useState } from "react";
import type { Packed } from "@/lib/ansi";
import { TerminalScreen } from "./terminal-screen";

type Item = { caption: string; screen: Packed | null; src: string | null };

/**
 * The same four features, in the terminal or in the window. The terminal side
 * is the default: it is what a first visit has not seen yet by this point.
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
  const [mode, setMode] = useState<"terminal" | "window">("terminal");
  const shown = items.filter((i) => (mode === "terminal" ? i.screen : i.src));

  return (
    <div className="mt-6">
      <div className="inline-flex rounded-full border border-white/[0.12] bg-black/40 p-1" role="tablist">
        {(["terminal", "window"] as const).map((m) => (
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
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {shown.map((item) => (
          <figure key={`${mode}-${item.caption}`} className="animate-[fadein_.35s_ease]">
            <div className="overflow-hidden rounded-lg border border-white/[0.1] transition hover:border-phosphor/40">
              {mode === "terminal" && item.screen ? (
                <TerminalScreen screen={item.screen} cols={cols} label={item.caption} />
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
