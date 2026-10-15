"use client";

import { track } from "@vercel/analytics";
import { useEffect, useState } from "react";
import type { Copy } from "@/lib/i18n";
import { megabytes, NOTIFY, RELEASE, SOURCE_INSTALL, TUI_INSTALL_LINE } from "@/lib/product";

type Os = "linux" | "macos" | "windows";

/** lib/i18n's `fill`, without pulling both languages' copy into the browser. */
const fill = (text: string, vars: Record<string, string>) => text.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);

/** The visitor's system, as far as the browser says. Anything unknown is Linux. */
function detect(): Os {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const p = `${nav.userAgentData?.platform ?? ""} ${navigator.userAgent}`.toLowerCase();
  if (/android|iphone|ipad/.test(p)) return "linux";
  if (/mac/.test(p)) return "macos";
  if (/win/.test(p)) return "windows";
  return "linux";
}

/** A command to inspect and copy. The visible text is exactly what gets copied. */
function Command({ line, t, os }: { line: string; t: Copy["hero"]["install"]; os: Os }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(line);
      setCopied(true);
      track("install_copy", { os });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="flex flex-col items-start gap-2 rounded-lg border border-white/[0.12] bg-black/55 p-3 sm:flex-row sm:gap-3">
      <code className="min-w-0 flex-1 whitespace-pre-wrap break-words font-mono text-[12px] leading-[1.65] text-ink/90 [overflow-wrap:anywhere] sm:text-[13px]">
        <span className="mr-2 select-none text-phosphor">$</span>
        {line}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-live="polite"
        className={`shrink-0 self-end rounded-md px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] transition sm:self-auto ${
          copied ? "bg-white/10 text-phosphor" : "bg-phosphor text-[#0a1008] hover:bg-[#c6ff74]"
        }`}
      >
        {copied ? t.copied : t.copy}
      </button>
    </div>
  );
}

function InstallOption({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-white/[0.1] bg-white/[0.025] p-3.5">
      <h3 className="font-mono text-[12px] font-semibold uppercase tracking-[0.1em] text-ink">{title}</h3>
      <p className="mt-1.5 text-[13px] leading-5 text-ink/60">{body}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function PackageLinks({ os }: { os: "linux" | "windows" }) {
  const packages = os === "linux" ? RELEASE.packages : RELEASE.windows;
  return (
    <div className="flex flex-wrap gap-2">
      {packages.map((p) => (
        <a
          key={p.ext}
          href={p.url}
          onClick={() => track("package_download", { ext: p.ext })}
          className="group inline-flex items-baseline gap-2 rounded-md border border-white/[0.12] bg-black/40 px-2.5 py-1.5 transition hover:border-phosphor/50"
        >
          <span className="font-mono text-[12px] font-semibold text-ink">{p.ext}</span>
          <span className="font-mono text-[11px] text-muted">{megabytes(p.bytes)}</span>
          <span className="text-[12px] text-phosphor transition-transform group-hover:translate-y-0.5">↓</span>
        </a>
      ))}
    </div>
  );
}

/**
 * The hero's install box: the command for the visitor's system, ready to copy.
 * The server renders Linux, where the binaries are; the browser then switches
 * to what it detects, and the tabs let anyone pick another. Behind the hero's
 * "Install on Linux" it stays on Linux: that is what was asked for.
 */
export function HeroInstall({
  t,
  docs,
  docsLabel,
  detect: detectOs = true,
}: {
  t: Copy["hero"]["install"];
  docs: string;
  docsLabel: string;
  detect?: boolean;
}) {
  const [os, setOs] = useState<Os>("linux");
  useEffect(() => {
    if (detectOs) setOs(detect());
  }, [detectOs]);

  return (
    <div>
      <div className="flex items-center gap-1" role="group" aria-label={t.label}>
        {(["linux", "macos", "windows"] as const).map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={os === o}
            onClick={() => setOs(o)}
            className={`rounded-full px-3 py-1 font-mono text-[12px] uppercase tracking-[0.1em] transition ${
              os === o ? "bg-white/[0.12] text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {t.os[o]}
          </button>
        ))}
        <span className="ml-auto whitespace-nowrap font-mono text-[11px] text-muted">v{RELEASE.version}</span>
      </div>

      <div className="mt-3">
        {os === "linux" ? (
          <div className="space-y-3">
            <InstallOption title={t.tuiTitle} body={t.tuiBody}>
              <Command line={TUI_INSTALL_LINE} t={t} os={os} />
              <p className="mt-2 font-mono text-[11px] text-muted">{fill(t.tuiNote, { size: megabytes(RELEASE.tuiBytes) })}</p>
            </InstallOption>
            <InstallOption title={t.guiTitle} body={t.guiBody}>
              <PackageLinks os="linux" />
            </InstallOption>
          </div>
        ) : os === "windows" ? (
          <InstallOption title={t.guiTitle} body={t.guiBody}>
            <PackageLinks os="windows" />
            <p className="mt-2 font-mono text-[11px] text-muted">{t.windowsNote}</p>
          </InstallOption>
        ) : (
          <InstallOption title={t.tuiTitle} body={`${fill(t.otherTitle, { os: t.os[os] })} ${t.otherBody}`}>
            <div>
              <Command
                line={SOURCE_INSTALL}
                t={t}
                os={os}
              />
            </div>
            <a
              href={NOTIFY[os]}
              onClick={() => track("notify_me", { os })}
              className="mt-3 inline-flex items-center gap-2 rounded-md border border-white/[0.14] px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.08em] text-ink transition hover:border-phosphor/60 hover:text-phosphor"
            >
              👍 {fill(t.notify, { os: t.os[os] })} ↗
            </a>
          </InstallOption>
        )}
      </div>

      <a href={docs} className="mt-5 inline-block font-mono text-[12px] uppercase tracking-[0.1em] text-muted transition hover:text-ink">
        {docsLabel} →
      </a>
    </div>
  );
}
