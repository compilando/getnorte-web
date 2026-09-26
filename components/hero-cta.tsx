"use client";

import { track } from "@vercel/analytics";
import { useState } from "react";
import type { Copy } from "@/lib/i18n";
import { LINKS, RELEASE } from "@/lib/product";
import { DEMO_EVENT } from "./hero-stage";
import { HeroInstall } from "./hero-install";

/**
 * The hero's two actions and what is true about them: Linux has binaries,
 * macOS and Windows build from source. The commands and packages wait behind
 * the install button, so the first screen says what norte is before how.
 */
export function HeroCta({ t }: { t: Copy["hero"] }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="hero-install"
          onClick={() => {
            setOpen((o) => !o);
            if (!open) track("install_open", { from: "hero" });
          }}
          className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-phosphor bg-phosphor px-6 font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[#0a1008] transition duration-200 hover:-translate-y-0.5 hover:bg-[#c6ff74] hover:shadow-glow"
        >
          {t.cta.install}
          <span className={`transition-transform ${open ? "rotate-180" : ""}`} aria-hidden>
            ↓
          </span>
        </button>
        <a
          href="#stage"
          onClick={() => {
            window.dispatchEvent(new CustomEvent(DEMO_EVENT));
            track("demo_play", { from: "hero" });
          }}
          className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-line bg-base/45 px-6 font-mono text-xs font-semibold uppercase tracking-[0.08em] text-ink backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:border-muted/70 hover:bg-elevated/80"
        >
          <span className="text-phosphor" aria-hidden>
            ▶
          </span>
          {t.cta.demo}
        </a>
      </div>

      <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[12px] text-ink/80">
        <span className="h-1.5 w-1.5 rounded-full bg-phosphor shadow-[0_0_9px_#B7FF52]" />
        v{RELEASE.version}
        <span className="text-line">·</span>
        {t.cta.available}
      </p>
      <p className="mt-1.5 text-[13px] leading-5 text-muted">{t.cta.elsewhere}</p>

      <div id="hero-install" hidden={!open} className="mt-5 border-t border-white/[0.09] pt-5">
        <HeroInstall t={t.install} docs={LINKS.readme} docsLabel={t.secondary} detect={false} />
      </div>

      <p className="mt-5 font-mono text-[12px] uppercase tracking-[0.12em] text-muted">{t.cta.trust.join(" · ")}</p>
    </div>
  );
}
