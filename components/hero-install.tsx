"use client";

import { track } from "@vercel/analytics";
import { useEffect, useState } from "react";
import type { Copy } from "@/lib/i18n";
import { INSTALL_LINE, megabytes, RELEASE, REPO, SOURCE_INSTALL } from "@/lib/product";

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
    <div className="flex items-start gap-3 rounded-lg border border-white/[0.12] bg-black/55 p-3">
      <code className="min-w-0 flex-1 break-all font-mono text-[10.5px] leading-[1.55] text-ink/90">
        <span className="mr-2 select-none text-phosphor">$</span>
        {line}
      </code>
      <button
        type="button"
        onClick={copy}
        className={`shrink-0 rounded-md px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] transition ${
          copied ? "bg-white/10 text-phosphor" : "bg-phosphor text-[#0a1008] hover:bg-[#c6ff74]"
        }`}
      >
        {copied ? t.copied : t.copy}
      </button>
    </div>
  );
}

/**
 * The hero's install box: the command for the visitor's system, ready to copy.
 * The server renders Linux, where the binaries are; the browser then switches
 * to what it detects, and the tabs let anyone pick another.
 */
export function HeroInstall({ t, docs, docsLabel }: { t: Copy["hero"]["install"]; docs: string; docsLabel: string }) {
  const [os, setOs] = useState<Os>("linux");
  useEffect(() => setOs(detect()), []);

  return (
    <div>
      <div className="flex items-center gap-1" role="tablist" aria-label={t.label}>
        {(["linux", "macos", "windows"] as const).map((o) => (
          <button
            key={o}
            type="button"
            role="tab"
            aria-selected={os === o}
            onClick={() => setOs(o)}
            className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition ${
              os === o ? "bg-white/[0.12] text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {t.os[o]}
          </button>
        ))}
        <span className="ml-auto font-mono text-[9px] text-muted">v{RELEASE.version}</span>
      </div>

      <div className="mt-3">
        {os === "linux" ? (
          <>
            <Command line={INSTALL_LINE} t={t} os={os} />
            <p className="mt-2 font-mono text-[9px] text-muted">{fill(t.linuxNote, { size: megabytes(RELEASE.binariesBytes) })}</p>
            <p className="mt-4 text-[12px] text-ink/60">{t.window}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {RELEASE.packages.map((p) => (
                <a
                  key={p.ext}
                  href={p.url}
                  onClick={() => track("package_download", { ext: p.ext })}
                  className="group inline-flex items-baseline gap-2 rounded-md border border-white/[0.12] bg-black/40 px-2.5 py-1.5 transition hover:border-phosphor/50"
                >
                  <span className="font-mono text-[11px] font-semibold text-ink">{p.ext}</span>
                  <span className="font-mono text-[9px] text-muted">{megabytes(p.bytes)}</span>
                  <span className="text-[10px] text-phosphor transition-transform group-hover:translate-y-0.5">↓</span>
                </a>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-[13px] font-medium text-ink">{fill(t.otherTitle, { os: t.os[os] })}</p>
            <p className="mt-1 text-[12px] leading-5 text-ink/60">{t.otherBody}</p>
            <div className="mt-3">
              <Command line={SOURCE_INSTALL} t={t} os={os} />
            </div>
            <a
              href={REPO}
              onClick={() => track("watch_releases", { os })}
              className="mt-3 inline-flex items-center gap-2 rounded-md border border-white/[0.14] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-ink transition hover:border-phosphor/60 hover:text-phosphor"
            >
              ★ {t.notify} ↗
            </a>
          </>
        )}
      </div>

      <a href={docs} className="mt-5 inline-block font-mono text-[10px] uppercase tracking-[0.1em] text-muted transition hover:text-ink">
        {docsLabel} →
      </a>
    </div>
  );
}
