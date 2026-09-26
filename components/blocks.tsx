import type { ReactNode } from "react";
import type { Extra, Lang, Scene } from "@/lib/i18n";
import { COLS, guiShot, tuiScene } from "@/lib/shots";
import { TerminalScreen } from "./terminal-screen";

/** The building blocks the home page, the features page and the comparison share. */

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-phosphor">{children}</p>;
}

export function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-5 max-w-4xl text-balance text-4xl font-medium leading-[1.02] tracking-[-0.055em] text-ink sm:text-6xl">
      {children}
    </h2>
  );
}

export function Section({ id, children, className = "" }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={`relative scroll-mt-20 py-24 sm:py-32 ${className}`}>
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">{children}</div>
    </section>
  );
}

/** A section's opening: eyebrow and title on one side, what it says on the other. */
export function Heading({ eyebrow, title, body }: { eyebrow: ReactNode; title: ReactNode; body?: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <H2>{title}</H2>
      </div>
      {body && <div className="max-w-xl text-lg leading-8 text-ink/65">{body}</div>}
    </div>
  );
}

/** Numbered points, a title and a sentence each. */
export function Points({ items }: { items: [string, string][] }) {
  return (
    <div className="space-y-6">
      {items.map(([title, body], i) => (
        <div key={title} className="flex gap-5 border-t border-line pt-6">
          <span className="font-mono text-[12px] text-phosphor">{String(i + 1).padStart(2, "0")}</span>
          <div>
            <h3 className="text-lg font-medium tracking-[-0.025em] text-ink">{title}</h3>
            <p className="mt-2 max-w-md text-[15px] leading-6 text-muted">{body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** A link out of a section, to the page that says more. */
export function MoreLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="group inline-flex items-center gap-2 text-lg font-medium text-ink underline decoration-white/30 underline-offset-4 hover:decoration-phosphor"
    >
      {children}
      <span className="text-phosphor transition-transform group-hover:translate-x-0.5">→</span>
    </a>
  );
}

/**
 * The captures in one language: `screen` for a terminal scene, `shot` for a
 * "tui:<scene>" or "gui:<name>" reference as the copy carries them.
 */
export function capturesFor(lang: Lang) {
  const screen = (scene: Scene | Extra, label: string) => {
    const s = tuiScene(lang, scene);
    return s ? <TerminalScreen screen={s} cols={COLS} label={label} /> : null;
  };
  const shot = (ref: string, label: string) => {
    const [kind, name] = ref.split(":");
    if (kind === "tui") return screen(name as Scene | Extra, label);
    const src = guiShot(lang, name);
    // eslint-disable-next-line @next/next/no-img-element -- a capture, served as-is
    return src ? <img src={src} alt={label} loading="lazy" className="block w-full" /> : null;
  };
  return { screen, shot };
}
