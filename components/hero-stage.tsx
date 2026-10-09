"use client";

import { useEffect, useRef, useState } from "react";
import { useAfterPaint } from "@/lib/after-paint";
import type { Shot } from "@/lib/shots";
import { AppFrame } from "./app-frame";
import { TerminalShot } from "./terminal-screen";

export const THEME_EVENT = "norte:theme";
/** The hero's "watch the demo": the film, from the start. */
export const DEMO_EVENT = "norte:demo";

type Labels = { film: string; terminal: string; window: string; theme: string };
type Film = { webm: string; mp4: string; poster: string };
export type View = Shot & { id: string; caption: string };
type Mode = "window" | "terminal" | "film";

/** How long each view stays before the next, while nobody has touched it. */
const CYCLE_MS = 5000;

/**
 * The hero: the window first, view by view, then the same in the terminal
 * (kitty, so its icons and photos show), then the film. A theme chip paints
 * the two panes in that theme, in the window or the terminal.
 */
export function HeroStage({
  windows,
  terminals,
  themes,
  film,
  cols,
  labels,
}: {
  windows: View[];
  terminals: View[];
  themes: { id: string; swatch: [string, string]; window?: Shot; terminal?: Shot }[];
  /** The hero film (scripts/video/make-hero.py). */
  film?: Film | null;
  cols: number;
  labels: Labels;
}) {
  const first: Mode = windows.length ? "window" : terminals.length ? "terminal" : "film";
  const [mode, setMode] = useState<Mode>(first);
  const [index, setIndex] = useState<Record<"window" | "terminal", number>>({ window: 0, terminal: 0 });
  const [theme, setTheme] = useState<string | null>(null);
  // The views turn by themselves until someone picks one, or with reduced motion never.
  const [cycling, setCycling] = useState(true);
  const [hover, setHover] = useState(false);
  const [still, setStill] = useState(false);
  const [demo, setDemo] = useState(0);
  const filmRef = useRef<HTMLVideoElement>(null);
  const hasFilm = Boolean(film);

  const views = mode === "terminal" ? terminals : windows;
  const panesAt = (m: "window" | "terminal") => Math.max(0, (m === "window" ? windows : terminals).findIndex((v) => v.id === "panes"));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCycling(false);
      setStill(true);
      filmRef.current?.pause();
    }
    const onTheme = (e: Event) => {
      setTheme((e as CustomEvent<string>).detail);
      setCycling(false);
      setMode((m) => (m === "film" ? first : m));
      setIndex({ window: panesAt("window"), terminal: panesAt("terminal") });
    };
    const onDemo = () => {
      setCycling(false);
      setMode(hasFilm ? "film" : first);
      // Asked for, the film plays from the start, reduced motion or not.
      setDemo((n) => n + 1);
    };
    window.addEventListener(THEME_EVENT, onTheme);
    window.addEventListener(DEMO_EVENT, onDemo);
    return () => {
      window.removeEventListener(THEME_EVENT, onTheme);
      window.removeEventListener(DEMO_EVENT, onDemo);
    };
    // panesAt reads props that do not change after the first render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasFilm, first]);

  useEffect(() => {
    if (!cycling || hover || theme !== null || mode === "film" || views.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => ({ ...i, [mode]: (i[mode] + 1) % views.length })), CYCLE_MS);
    return () => window.clearInterval(id);
  }, [cycling, hover, theme, mode, views.length]);

  // A click repaints the tab at once; the screen it asks for follows after that paint.
  const shownMode = useAfterPaint(mode);
  useEffect(() => {
    const v = filmRef.current;
    if (demo === 0 || shownMode !== "film" || !v) return;
    v.currentTime = 0;
    void v.play().catch(() => {});
  }, [demo, shownMode]);

  const shownViews = shownMode === "terminal" ? terminals : windows;
  const view = shownMode === "film" ? undefined : shownViews[index[shownMode]] ?? shownViews[0];
  const themed = view?.id === "panes" && theme ? themes.find((t) => t.id === theme)?.[shownMode as "window" | "terminal"] : undefined;
  const shot: Shot | undefined = themed ?? view;

  const pick = (m: Mode, i?: number) => {
    setCycling(false);
    setMode(m);
    if (i !== undefined && m !== "film") {
      setIndex((x) => ({ ...x, [m]: i }));
      // Another view than the panes shows itself, not a theme.
      if ((m === "window" ? windows : terminals)[i]?.id !== "panes") setTheme(null);
    }
  };

  const modes = (["window", "terminal", "film"] as const).filter((m) =>
    m === "window" ? windows.length > 0 : m === "terminal" ? terminals.length > 0 : hasFilm,
  );
  const title =
    shownMode === "film" ? "norte — 20 s" : shownMode === "terminal" ? `ada@norte — ntc · kitty` : `norte — ${view?.caption ?? ""}`;

  return (
    <div onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-white/[0.12] bg-black/40 p-1 backdrop-blur-md" role="tablist">
          {modes.map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => pick(m)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.1em] transition sm:px-4 ${
                mode === m ? "bg-phosphor text-[#0a1008]" : "text-muted hover:text-ink"
              }`}
            >
              {/* "Window · norte-gui": on a phone, just "Window". */}
              {labels[m].split(" · ")[0]}
              {labels[m].includes(" · ") && <span className="hidden sm:inline"> · {labels[m].split(" · ")[1]}</span>}
            </button>
          ))}
        </div>
        {mode !== "film" && (
          <div className="flex flex-wrap items-center gap-1.5" aria-label={labels.theme}>
            <span className="mr-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">{labels.theme}</span>
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                title={t.id}
                aria-label={t.id}
                aria-pressed={theme === t.id}
                onClick={() => {
                  setCycling(false);
                  setTheme(theme === t.id ? null : t.id);
                  setIndex({ window: panesAt("window"), terminal: panesAt("terminal") });
                }}
                className={`h-6 w-6 overflow-hidden rounded-full border transition ${
                  theme === t.id ? "border-phosphor ring-2 ring-phosphor/40" : "border-white/20 hover:border-white/50"
                }`}
                style={{ background: `linear-gradient(135deg, ${t.swatch[0]} 50%, ${t.swatch[1]} 50%)` }}
              />
            ))}
          </div>
        )}
      </div>

      <AppFrame
        title={title}
        right={<span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">{themed ? theme : ""}</span>}
      >
        {/* Only the screen on show is in the DOM. */}
        <div key={shownMode === "film" ? "film" : `${shownMode}-${view?.id}-${themed ? theme : ""}`} className="animate-[fadein_.35s_ease]">
          {shownMode === "film" && film && (
            // Muted, looping, inline: the only way a browser plays a video on its own.
            // With reduced motion it waits, with controls, on its poster.
            <video
              ref={filmRef}
              poster={film.poster}
              autoPlay={!still}
              controls={still}
              muted
              loop
              playsInline
              preload="metadata"
              className="block aspect-video w-full bg-black"
            >
              <source src={film.webm} type="video/webm" />
              <source src={film.mp4} type="video/mp4" />
            </video>
          )}
          {shownMode !== "film" && shot && <TerminalShot shot={shot} cols={cols} label={view?.caption} lazy={false} />}
        </div>
      </AppFrame>

      {mode !== "film" && views.length > 1 && (
        <ol className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          {views.map((v, i) => {
            const on = index[mode] === i;
            return (
              <li key={`${mode}-${v.id}`}>
                <button
                  type="button"
                  aria-pressed={on}
                  title={v.caption}
                  onClick={() => pick(mode, i)}
                  className={`group block w-full overflow-hidden rounded-lg border text-left transition ${
                    on ? "border-phosphor/70 bg-phosphor/[0.06]" : "border-white/[0.1] hover:border-white/30"
                  }`}
                >
                  {v.src && (
                    // eslint-disable-next-line @next/next/no-img-element -- a capture, served as-is
                    <img
                      src={v.src}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className={`block aspect-[3/2] w-full object-cover object-left-top transition ${on ? "" : "opacity-60 group-hover:opacity-100"}`}
                    />
                  )}
                  <span className={`block truncate px-2 py-1.5 font-mono text-[11px] ${on ? "text-ink" : "text-muted group-hover:text-ink"}`}>
                    {v.caption}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
