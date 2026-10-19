"use client";

import { track } from "@vercel/analytics";
import { useEffect, useId, useRef, useState } from "react";
import type { Shot } from "@/lib/shots";
import { AppFrame } from "./app-frame";
import { TerminalShot } from "./terminal-screen";

type Step = { scene: string; title: string; body: string };

function StoryFrame({ step, shot, cols }: { step: Step; shot: Shot; cols: number }) {
  return (
    <div key={step.scene} className="story-frame">
      <AppFrame title={`norte / ${step.title}`}>
        <TerminalShot shot={shot} cols={cols} label={step.title} lazy={false} />
      </AppFrame>
    </div>
  );
}

/** Three real product states. Desktop advances as each explanation reaches the
 * reading line; mobile stays compact and user-controlled. */
export function ScrollStory({
  steps,
  screens,
  cols,
  label,
}: {
  steps: Step[];
  screens: Record<string, Shot | null>;
  cols: number;
  label: string;
}) {
  const shown = steps.filter((step) => screens[step.scene]);
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const instance = useId().replace(/:/g, "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = Number((entry.target as HTMLElement).dataset.storyStep);
          if (Number.isFinite(index)) setActive(index);
        }
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: 0 },
    );

    const nodes = stepRefs.current;
    nodes.forEach((node) => node && observer.observe(node));
    return () => nodes.forEach((node) => node && observer.unobserve(node));
  }, [shown.length]);

  const current = shown[active] ?? shown[0];
  const shot = current ? screens[current.scene] : null;
  if (!current || !shot) return null;

  function select(index: number) {
    setActive(index);
    track("story_step_select", { scene: shown[index]?.scene ?? String(index) });
  }

  return (
    <div>
      <div className="lg:hidden">
        <div className="grid grid-cols-3 gap-1" role="tablist" aria-label={label}>
          {shown.map((item, index) => (
            <button
              key={item.scene}
              type="button"
              role="tab"
              id={`${instance}-tab-${index}`}
              aria-controls={`${instance}-panel`}
              aria-selected={active === index}
              onClick={() => select(index)}
              className={`min-h-12 border-b px-2 py-3 text-left text-[13px] font-medium leading-4 transition-colors ${
                active === index ? "border-phosphor text-ink" : "border-line text-muted"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>
        <div
          id={`${instance}-panel`}
          role="tabpanel"
          aria-labelledby={`${instance}-tab-${active}`}
          className="mt-5"
        >
          <StoryFrame step={current} shot={shot} cols={cols} />
          <p className="mt-4 text-[15px] leading-6 text-ink/70">{current.body}</p>
        </div>
      </div>

      <div className="hidden grid-cols-[1.32fr_.68fr] items-start gap-14 lg:grid xl:gap-20">
        <div className="sticky top-24 py-10">
          <StoryFrame step={current} shot={shot} cols={cols} />
        </div>

        <ol aria-label={label}>
          {shown.map((item, index) => {
            const selected = active === index;
            return (
              <li
                key={item.scene}
                ref={(node) => {
                  stepRefs.current[index] = node;
                }}
                data-story-step={index}
                className="flex min-h-[62vh] items-center"
              >
                <button
                  type="button"
                  onClick={() => select(index)}
                  onFocus={() => setActive(index)}
                  className={`w-full border-l-2 py-3 pl-7 text-left transition-[border-color,opacity,transform] duration-300 ${
                    selected ? "translate-x-0 border-phosphor opacity-100" : "translate-x-1 border-line opacity-45 hover:opacity-75"
                  }`}
                >
                  <span className="block text-balance text-3xl font-medium leading-tight tracking-[-0.045em] text-ink xl:text-4xl">
                    {item.title}
                  </span>
                  <span className="mt-4 block max-w-md text-base leading-7 text-ink/70">{item.body}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
