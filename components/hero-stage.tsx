"use client";

import { track } from "@vercel/analytics";
import { useEffect, useRef, useState } from "react";
import type { Shot } from "@/lib/shots";
import { AppFrame } from "./app-frame";
import { TerminalShot } from "./terminal-screen";

export const DEMO_EVENT = "norte:demo";

type Labels = {
  play: string;
  pause: string;
  real: string;
  fullTitle: string;
  close: string;
};
type Film = { webm: string; mp4: string; poster: string };
export type View = Shot & { id: string; caption: string };
/** The product is the stage. The short film plays without browser chrome; the
 * explicit pause control and reduced-motion poster keep the loop accessible. */
export function HeroStage({
  windows,
  terminals,
  film,
  fullFilm,
  cols,
  labels,
}: {
  windows: View[];
  terminals: View[];
  film?: Film | null;
  fullFilm?: Film | null;
  cols: number;
  labels: Labels;
}) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fullVideoRef = useRef<HTMLVideoElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const userPausedRef = useRef(false);
  const canAutoplayRef = useRef(false);
  const inViewRef = useRef(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const canAutoplay = !media.matches && !connection?.saveData;
    canAutoplayRef.current = canAutoplay;
    setReduceMotion(media.matches);
    if (!canAutoplay) {
      videoRef.current?.pause();
      setPlaying(false);
    } else {
      void videoRef.current?.play().catch(() => {});
    }
    const onDemo = () => {
      window.requestAnimationFrame(() => {
        if (fullFilm && dialogRef.current && fullVideoRef.current) {
          videoRef.current?.pause();
          if (!dialogRef.current.open) dialogRef.current.showModal();
          fullVideoRef.current.currentTime = 0;
          void fullVideoRef.current.play().catch(() => {});
          return;
        }
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = 0;
        void video.play().then(() => setPlaying(true)).catch(() => {});
      });
    };
    const observer = new IntersectionObserver(([entry]) => {
      inViewRef.current = entry.isIntersecting;
      if (!entry.isIntersecting) {
        videoRef.current?.pause();
      } else if (canAutoplayRef.current && !userPausedRef.current && !dialogRef.current?.open) {
        void videoRef.current?.play().catch(() => {});
      }
    }, { threshold: 0.15 });
    if (stageRef.current) observer.observe(stageRef.current);
    window.addEventListener(DEMO_EVENT, onDemo);
    return () => {
      window.removeEventListener(DEMO_EVENT, onDemo);
      observer.disconnect();
    };
  }, [fullFilm]);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPausedRef.current = false;
      void video.play().then(() => setPlaying(true)).catch(() => {});
      track("hero_video_play");
    } else {
      userPausedRef.current = true;
      video.pause();
      setPlaying(false);
      track("hero_video_pause");
    }
  }

  function resumeLoop() {
    fullVideoRef.current?.pause();
    if (canAutoplayRef.current && !userPausedRef.current && inViewRef.current) {
      void videoRef.current?.play().catch(() => {});
    }
  }

  const fallback = windows[0] ?? terminals[0];

  return (
    <div ref={stageRef} className="hero-film group relative isolate overflow-hidden rounded-2xl border border-white/[0.14] bg-black shadow-terminal">
      {film ? (
        <video
          ref={videoRef}
          poster={film.poster}
          loop
          muted
          playsInline
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className="block aspect-video w-full bg-black object-cover"
        >
          <source src={film.webm} type="video/webm" />
          <source src={film.mp4} type="video/mp4" />
        </video>
      ) : (
        <AppFrame title="norte desktop">
          {fallback && <TerminalShot shot={fallback} cols={cols} label={fallback.caption} lazy={false} />}
        </AppFrame>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
      <p className="pointer-events-none absolute bottom-4 left-4 hidden font-mono text-[11px] uppercase tracking-[0.1em] text-white/75 sm:block">
        {labels.real}
      </p>
      {film && !reduceMotion && (
        <button
          type="button"
          onClick={togglePlayback}
          className="absolute bottom-3 right-3 inline-flex h-10 items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 font-mono text-[11px] uppercase tracking-[0.08em] text-white backdrop-blur-md transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:border-white/40 hover:bg-black/80 active:translate-y-0"
        >
          <span aria-hidden>{playing ? "Ⅱ" : "▶"}</span>
          {playing ? labels.pause : labels.play}
        </button>
      )}

      {fullFilm && (
        <dialog
          ref={dialogRef}
          aria-labelledby="hero-demo-title"
          onClose={resumeLoop}
          onClick={(event) => {
            if (event.target === event.currentTarget) event.currentTarget.close();
          }}
          className="m-auto w-[min(1180px,calc(100%-2rem))] max-w-none overflow-hidden rounded-2xl border border-white/15 bg-[#090c0d] p-0 text-ink shadow-terminal backdrop:bg-black/85 backdrop:backdrop-blur-sm"
        >
          <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-5">
            <h2 id="hero-demo-title" className="text-base font-medium tracking-[-0.02em] sm:text-lg">
              {labels.fullTitle}
            </h2>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="inline-flex h-9 items-center rounded-full border border-white/15 px-4 font-mono text-[11px] uppercase tracking-[0.08em] text-ink transition-[transform,background-color,border-color] hover:border-white/35 hover:bg-white/[0.06] active:scale-[0.98]"
            >
              {labels.close}
            </button>
          </div>
          <video
            ref={fullVideoRef}
            poster={fullFilm.poster}
            controls
            playsInline
            preload="metadata"
            onEnded={() => track("demo_complete")}
            className="block aspect-video w-full bg-black"
          >
            <source src={fullFilm.webm} type="video/webm" />
            <source src={fullFilm.mp4} type="video/mp4" />
          </video>
        </dialog>
      )}
    </div>
  );
}
