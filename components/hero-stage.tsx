"use client";

import { useEffect, useRef, useState } from "react";
import type { Packed } from "@/lib/ansi";
import { AppFrame } from "./app-frame";
import { TerminalScreen } from "./terminal-screen";

export const THEME_EVENT = "norte:theme";

type Labels = { film: string; terminal: string; window: string; theme: string; live: string; play: string; pause: string };
type Film = { webm: string; mp4: string; poster: string };

/**
 * The hero: the terminal tour playing frame by frame, a switch to the window,
 * and one chip per theme that freezes the tour on that theme's capture. The
 * frames arrive rendered by the server; this only chooses which one is shown.
 */
export function HeroStage({
  reel,
  themes,
  windows,
  labels,
  cols,
  video,
  film,
}: {
  video?: string | null;
  /** The hero film (scripts/video/make-hero.py): what a first visit sees. */
  film?: Film | null;
  reel: Packed[];
  themes: { id: string; swatch: [string, string]; screen: Packed }[];
  cols: number;
  windows: { id: string; src: string }[];
  labels: Labels;
}) {
  const [mode, setMode] = useState<"film" | "terminal" | "window">(film ? "film" : "terminal");
  const [theme, setTheme] = useState<string | null>(null);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [still, setStill] = useState(false);
  const filmRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPlaying(false);
      setStill(true);
      // The server rendered autoplay, and the browser may have started already.
      filmRef.current?.pause();
    }
    const onTheme = (e: Event) => {
      setTheme((e as CustomEvent<string>).detail);
      setMode("terminal");
    };
    window.addEventListener(THEME_EVENT, onTheme);
    return () => window.removeEventListener(THEME_EVENT, onTheme);
  }, []);

  useEffect(() => {
    if (!playing || theme !== null || mode !== "terminal" || reel.length < 2) return;
    const id = window.setInterval(() => setFrame((f) => (f + 1) % reel.length), 1500);
    return () => window.clearInterval(id);
  }, [playing, theme, mode, reel.length]);

  const windowFor = windows.find((w) => w.id === theme) ?? windows[0];
  const shownTheme = theme === null ? undefined : themes.find((t) => t.id === theme);
  const title = mode === "terminal" ? "ada@norte: ~ — ntc" : mode === "film" ? "norte — 20 s" : "norte";
  const modes = film ? (["film", "terminal", "window"] as const) : (["terminal", "window"] as const);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full border border-white/[0.12] bg-black/40 p-1 backdrop-blur-md" role="tablist">
          {modes.map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              disabled={m === "window" && windows.length === 0}
              onClick={() => setMode(m)}
              className={`rounded-full px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] transition disabled:cursor-not-allowed disabled:opacity-35 ${
                mode === m ? "bg-phosphor text-[#0a1008]" : "text-muted hover:text-ink"
              }`}
            >
              {labels[m]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5" aria-label={labels.theme}>
          <span className="mr-1 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">{labels.theme}</span>
          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              title={t.id}
              aria-label={t.id}
              aria-pressed={theme === t.id}
              onClick={() => {
                setTheme(theme === t.id ? null : t.id);
                if (mode === "film") setMode("terminal");
              }}
              className={`h-6 w-6 overflow-hidden rounded-full border transition hover:scale-110 ${
                theme === t.id ? "border-phosphor ring-2 ring-phosphor/40" : "border-white/20"
              }`}
              style={{ background: `linear-gradient(135deg, ${t.swatch[0]} 50%, ${t.swatch[1]} 50%)` }}
            />
          ))}
        </div>
      </div>

      <div className="tilt">
        <AppFrame
          title={title}
          right={
            mode === "terminal" && theme === null ? (
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted hover:text-ink"
              >
                <span className={`h-1.5 w-1.5 rounded-full ${playing ? "bg-[#ff5f57] shadow-[0_0_8px_#ff5f57]" : "bg-muted"}`} />
                {playing ? labels.live : labels.play}
              </button>
            ) : (
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">{mode === "film" ? "" : (theme ?? "")}</span>
            )
          }
        >
          {/* Only the screen on show is in the DOM: each one is thousands of spans. */}
          <div
            key={mode === "film" ? "film" : mode === "window" ? `w${windowFor?.id}` : (theme ?? `r${frame}`)}
            className="animate-[fadein_.35s_ease]"
          >
            {mode === "film" && film && (
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
            {mode === "terminal" && theme === null && reel[frame] && <TerminalScreen screen={reel[frame]} cols={cols} />}
            {mode === "terminal" && shownTheme && <TerminalScreen screen={shownTheme.screen} cols={cols} label={shownTheme.id} />}
            {mode === "window" && theme === null && video && (
              <video src={video} poster={windows[0]?.src} autoPlay muted loop playsInline className="block w-full" />
            )}
            {mode === "window" && (theme !== null || !video) && windowFor && (
              // eslint-disable-next-line @next/next/no-img-element -- a capture, served as-is
              <img src={windowFor.src} alt="" className="block w-full" />
            )}
          </div>
        </AppFrame>
      </div>
    </div>
  );
}
