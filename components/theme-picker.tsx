"use client";

import { useState } from "react";
import type { ThemeView } from "@/lib/shots";
import { AppFrame } from "./app-frame";

type Mode = "window" | "terminal";
/** A theme with the alt text of each capture, written on the server so the copy stays out of the bundle. */
export type PickerTheme = ThemeView & { alt: Record<Mode, string> };
type Labels = {
  window: string;
  terminal: string;
  group: string;
  pick: string;
  setting: string;
  importTitle: string;
  importBody: string;
  copy: string;
  copied: string;
};

/** The captures' own sizes, so the frame keeps its height while the next one loads. */
const SIZE: Record<Mode, [number, number]> = { window: [2400, 1600], terminal: [2377, 1483] };
const IMPORT = "norte theme import dracula.json --use";

function Copy({ text, labels }: { text: string; labels: Pick<Labels, "copy" | "copied"> }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch {
          setCopied(false);
        }
      }}
      className="shrink-0 rounded-md border border-white/[0.14] px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted transition hover:border-phosphor/60 hover:text-phosphor"
    >
      {copied ? labels.copied : labels.copy}
    </button>
  );
}

/**
 * Ten themes, each a real capture of the same screen in the window and in the
 * terminal. Only the capture on show is fetched; hovering a swatch warms the
 * next one so the switch does not flash.
 */
export function ThemePicker({ themes, labels }: { themes: PickerTheme[]; labels: Labels }) {
  const [id, setId] = useState(themes[0]?.id);
  const [mode, setMode] = useState<Mode>(themes[0]?.window ? "window" : "terminal");
  const theme = themes.find((t) => t.id === id) ?? themes[0];
  if (!theme) return null;

  const modes = (["window", "terminal"] as const).filter((m) => themes.some((t) => t[m]));
  const src = theme[mode] ?? theme.window ?? theme.terminal;
  const [width, height] = SIZE[theme[mode] ? mode : theme.window ? "window" : "terminal"];
  const setting = `[ui]\ntheme = "${theme.id}"`;

  const warm = (t: PickerTheme) => {
    const next = t[mode];
    if (next) new Image().src = next;
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
      <div>
        <div className="mb-3 inline-flex rounded-full border border-white/[0.12] bg-black/45 p-1" role="tablist" aria-label={labels.group}>
          {modes.map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 font-mono text-[12px] uppercase tracking-[0.08em] transition ${
                mode === m ? "bg-phosphor text-[#0a1008]" : "text-muted hover:text-ink"
              }`}
            >
              {labels[m]}
            </button>
          ))}
        </div>
        <AppFrame title={`${mode === "window" ? "norte-gui" : "ntc"} — ${theme.name}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- a capture, served as-is */}
          <img
            key={src}
            src={src ?? undefined}
            alt={theme.alt[mode]}
            width={width}
            height={height}
            loading="lazy"
            decoding="async"
            className="block h-auto w-full animate-[fadein_.25s_ease]"
          />
        </AppFrame>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">{labels.pick}</p>
          <div role="radiogroup" aria-label={labels.group} className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-2">
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={t.id === theme.id}
                onClick={() => setId(t.id)}
                onMouseEnter={() => warm(t)}
                onFocus={() => warm(t)}
                className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left text-[13px] leading-4 transition ${
                  t.id === theme.id ? "border-phosphor/70 bg-phosphor/[0.06] text-ink" : "border-white/[0.1] text-muted hover:border-white/30 hover:text-ink"
                }`}
              >
                <span
                  aria-hidden
                  className="h-5 w-5 shrink-0 rounded-full border border-white/20"
                  style={{ background: `linear-gradient(135deg, ${t.bg} 0 50%, ${t.accent} 50% 100%)` }}
                />
                <span className="min-w-0 truncate">{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-black/45">
          <div className="flex items-center justify-between gap-3 px-4 pt-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">{labels.setting}</p>
            <Copy text={setting} labels={labels} />
          </div>
          <pre className="overflow-x-auto px-4 pb-3 pt-2 font-mono text-[12px] leading-5 text-ink">
            <span className="text-muted">[ui]</span>
            {"\n"}theme = <span className="text-phosphor">&quot;{theme.id}&quot;</span>
          </pre>
        </div>

        <div className="border-t border-line/60 pt-6">
          <h3 className="text-lg font-medium tracking-[-0.02em] text-ink">{labels.importTitle}</h3>
          <p className="mt-2 text-[14px] leading-6 text-muted">{labels.importBody}</p>
          <div className="mt-3 flex items-start gap-3 rounded-xl border border-white/[0.12] bg-black/45 px-4 py-3">
            <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-[11px] leading-6 text-ink">
              <span className="mr-3 text-phosphor">$</span>
              {IMPORT}
            </code>
            <Copy text={IMPORT} labels={labels} />
          </div>
        </div>
      </div>
    </div>
  );
}
