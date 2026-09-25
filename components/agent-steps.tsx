"use client";

import { type ReactNode, useEffect, useState } from "react";
import { AppFrame } from "./app-frame";

type Step = { title: string; body: string; frame: string };

/**
 * The agent scene, one step at a time. The screens arrive rendered by the
 * server; this only chooses which one shows. It walks on its own until the
 * visitor picks a step, and stays put with reduced motion.
 */
export function AgentSteps({ steps, screens, caption }: { steps: Step[]; screens: ReactNode[]; caption: string }) {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setAuto(false);
  }, []);
  useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % steps.length), 5200);
    return () => window.clearInterval(id);
  }, [auto, steps.length]);

  return (
    <div>
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="tablist">
        {steps.map((s, i) => (
          <li key={s.title}>
            <button
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => {
                setActive(i);
                setAuto(false);
              }}
              className={`relative h-full w-full overflow-hidden rounded-xl border px-3 py-3 text-left transition ${
                i === active ? "border-phosphor/50 bg-phosphor/[0.06]" : "border-white/[0.09] bg-surface hover:border-white/20"
              }`}
            >
              <span className={`font-mono text-[12px] ${i === active ? "text-phosphor" : "text-muted"}`}>{String(i + 1).padStart(2, "0")}</span>
              <span className={`mt-1 block text-[14px] font-medium leading-5 ${i === active ? "text-ink" : "text-ink/60"}`}>{s.title}</span>
              {i === active && auto && (
                <span key={active} className="absolute inset-x-0 bottom-0 h-0.5 origin-left animate-[step-progress_5.2s_linear] bg-phosphor" />
              )}
            </button>
          </li>
        ))}
      </ol>

      <p className="mt-5 min-h-[3rem] max-w-2xl text-sm leading-6 text-ink/70">{steps[active].body}</p>

      <div className="mt-4">
        {screens.map((screen, i) => (
          <div key={i} hidden={i !== active} className={i === active ? "animate-[fadein_.35s_ease]" : undefined}>
            <AppFrame title={steps[i].frame}>{screen}</AppFrame>
          </div>
        ))}
      </div>
      <p className="mt-3 font-mono text-[12px] text-muted">{caption}</p>
    </div>
  );
}
