"use client";

import { useEffect, useState } from "react";

type Props = {
  links: [string, string][];
  download: [string, string];
  other: [string, string, string];
  github: string;
  labels: { open: string; close: string };
};

/**
 * The nav below 1280px, where the links do not fit on one line: a button that
 * opens them as a panel under the header. It closes on a choice, on Escape,
 * or on the button again.
 */
export function MobileMenu({ links, download, other, github, labels }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? labels.close : labels.open}
        onClick={() => setOpen((o) => !o)}
        className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white/[0.03] text-ink transition hover:border-muted/70"
      >
        <span aria-hidden className="relative block h-3 w-4">
          <span className={`absolute left-0 h-0.5 w-4 bg-current transition ${open ? "top-[5px] rotate-45" : "top-0"}`} />
          <span className={`absolute left-0 top-[5px] h-0.5 w-4 bg-current transition ${open ? "opacity-0" : ""}`} />
          <span className={`absolute left-0 h-0.5 w-4 bg-current transition ${open ? "top-[5px] -rotate-45" : "top-[10px]"}`} />
        </span>
      </button>

      {open && (
        <div
          id="mobile-menu"
          // Opaque and full height: a blur inside the header's own backdrop blur does nothing.
          className="fixed inset-x-0 top-[68px] z-40 h-[calc(100dvh-68px)] overflow-y-auto border-t border-white/[0.08] bg-base px-4 pb-8 pt-4 sm:px-8"
        >
          <nav aria-label={labels.open} className="mx-auto max-w-[1440px]">
            <ul className="divide-y divide-white/[0.06]">
              {links.map(([label, href]) => (
                <li key={href}>
                  <a href={href} onClick={() => setOpen(false)} className="block py-3.5 text-[17px] text-ink/85 transition hover:text-ink">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={download[1]}
                onClick={() => setOpen(false)}
                className="inline-flex h-11 items-center rounded-full bg-phosphor px-5 font-mono text-[13px] font-semibold uppercase tracking-[0.08em] text-[#0a1008]"
              >
                {download[0]}
              </a>
              <a
                href={other[1]}
                hrefLang={other[2]}
                className="inline-flex h-11 items-center rounded-full border border-line px-5 font-mono text-[13px] uppercase tracking-[0.08em] text-ink"
              >
                {other[0]}
              </a>
              <a href={github} className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 font-mono text-[13px] uppercase tracking-[0.08em] text-ink">
                GitHub <span className="text-phosphor">↗</span>
              </a>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
