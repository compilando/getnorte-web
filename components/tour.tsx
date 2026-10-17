"use client";

import { useState } from "react";
import type { Shot } from "@/lib/shots";
import { AppFrame } from "./app-frame";
import { TerminalShot } from "./terminal-screen";

type Step = { scene: string; kicker: string; title: string; body: string; keys: string[] };

/**
 * A compact, user-controlled tour. Four clear choices replace six viewport-
 * height scroll steps, so visitors can scan the whole story without losing
 * their place or fighting an observer-controlled screenshot.
 */
export function Tour({ steps, screens, cols }: { steps: Step[]; screens: Record<string, Shot | null>; cols: number }) {
  const shown = steps.filter((step) => screens[step.scene]);
  const [active, setActive] = useState(0);
  const step = shown[active] ?? shown[0];
  const shot = step ? screens[step.scene] : null;

  if (!step || !shot) return null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[.72fr_1.28fr] lg:items-start lg:gap-10">
      <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1" role="tablist" aria-label="Product tour">
        {shown.map((item, index) => {
          const selected = index === active;
          return (
            <li key={item.scene}>
              <button
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(index)}
                className={`group grid w-full grid-cols-[2.25rem_1fr] gap-3 rounded-xl border px-4 py-4 text-left transition ${
                  selected
                    ? "border-phosphor/50 bg-phosphor/[0.06]"
                    : "border-white/[0.09] bg-surface hover:border-white/20"
                }`}
              >
                <span className={`font-mono text-[12px] ${selected ? "text-phosphor" : "text-muted"}`}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className={`block text-[15px] font-medium leading-5 ${selected ? "text-ink" : "text-ink/65"}`}>{item.kicker}</span>
                  <span className="mt-1 hidden text-[13px] leading-5 text-muted sm:block lg:hidden xl:block">{item.title}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div>
        <AppFrame title={`ada@norte — ${step.kicker}`}>
          <div key={step.scene} className="animate-[fadein_.25s_ease]">
            <TerminalShot shot={shot} cols={cols} label={step.title} lazy={false} />
          </div>
        </AppFrame>
        <div className="mt-5">
          <h3 className="text-balance text-2xl font-medium leading-tight tracking-[-0.035em] text-ink sm:text-3xl">{step.title}</h3>
          <p className="mt-3 max-w-2xl text-[15px] leading-6 text-ink/65">{step.body}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {step.keys.map((key) => (
              <kbd key={key} className="rounded-md border border-white/[0.14] bg-white/[0.04] px-2 py-1 font-mono text-[11px] text-ink/80">
                {key}
              </kbd>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
