"use client";

import { useEffect, useRef, useState } from "react";
import type { Shot } from "@/lib/shots";
import { AppFrame } from "./app-frame";
import { TerminalShot } from "./terminal-screen";

export const DEMO_EVENT = "norte:demo";

type Labels = { film: string; terminal: string; window: string; theme: string };
type Film = { webm: string; mp4: string; poster: string };
export type View = Shot & { id: string; caption: string };
type Mode = "window" | "terminal" | "film";

/**
 * One decision at a time: watch the story, inspect the desktop app, or inspect
 * the terminal app. The old eight-thumbnail carousel and theme picker made the
 * hero feel like a control panel before the value proposition had landed.
 */
export function HeroStage({
  windows,
  terminals,
  film,
  cols,
  labels,
}: {
  windows: View[];
  terminals: View[];
  film?: Film | null;
  cols: number;
  labels: Labels;
}) {
  const first: Mode = film ? "film" : windows.length ? "window" : "terminal";
  const [mode, setMode] = useState<Mode>(first);
  const [reduceMotion, setReduceMotion] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const onDemo = () => {
      setMode("film");
      window.requestAnimationFrame(() => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = 0;
        void video.play().catch(() => {});
      });
    };
    window.addEventListener(DEMO_EVENT, onDemo);
    return () => window.removeEventListener(DEMO_EVENT, onDemo);
  }, []);

  const modes = (["film", "window", "terminal"] as const).filter((item) =>
    item === "film" ? Boolean(film) : item === "window" ? windows.length > 0 : terminals.length > 0,
  );
  const view = mode === "window" ? windows[0] : mode === "terminal" ? terminals[0] : undefined;
  const title = mode === "terminal" ? "ntc — terminal" : "norte — desktop";

  function pick(next: Mode) {
    setMode(next);
    if (next === "film") {
      window.requestAnimationFrame(() => {
        const video = videoRef.current;
        if (video?.ended) video.currentTime = 0;
        if (!reduceMotion) void video?.play().catch(() => {});
      });
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.12] bg-black/35 p-2 shadow-terminal backdrop-blur-md sm:p-3">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div className="inline-flex min-w-0 rounded-full border border-white/[0.12] bg-black/45 p-1" role="tablist" aria-label="Product view">
          {modes.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={mode === item}
              onClick={() => pick(item)}
              className={`min-w-0 whitespace-nowrap rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] transition sm:px-4 sm:text-[12px] ${
                mode === item ? "bg-phosphor text-[#0a1008]" : "text-muted hover:text-ink"
              }`}
            >
              {labels[item].split(" · ")[0]}
              {item === "film" && <span className="hidden sm:inline"> · 20 s</span>}
            </button>
          ))}
        </div>
        <span className="hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-muted sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-phosphor shadow-[0_0_8px_#B7FF52]" />
          norte v0.3
        </span>
      </div>

      <div key={mode} className="animate-[fadein_.25s_ease]">
        {mode === "film" && film ? (
          <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-black shadow-[0_24px_70px_rgba(0,0,0,.42)]">
            <video
              ref={videoRef}
              poster={film.poster}
              autoPlay={!reduceMotion}
              controls
              muted
              playsInline
              preload="metadata"
              className="block aspect-video w-full bg-black"
            >
              <source src={film.webm} type="video/webm" />
              <source src={film.mp4} type="video/mp4" />
            </video>
          </div>
        ) : (
          <AppFrame title={title}>
            {view && <TerminalShot shot={view} cols={cols} label={view.caption} lazy={false} />}
          </AppFrame>
        )}
      </div>
    </div>
  );
}
