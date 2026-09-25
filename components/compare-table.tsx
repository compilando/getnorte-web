import { CHECKED, type Cell, LICENSES, PLATFORMS, PRODUCTS, ROWS, SOURCES } from "@/lib/compare";
import { type Copy, fill, type Lang } from "@/lib/i18n";
import { REPO } from "@/lib/product";

const MARK: Record<Cell, { glyph: string; className: string }> = {
  yes: { glyph: "●", className: "text-phosphor" },
  plugin: { glyph: "◐", className: "text-cyan" },
  partial: { glyph: "◔", className: "text-amber" },
  no: { glyph: "—", className: "text-muted/50" },
};

/** The comparison as a table that scrolls sideways on a phone, its first column held. */
export function CompareTable({ t, lang }: { t: Copy["compare"]; lang: Lang }) {
  const date = new Date(`${CHECKED}T12:00:00Z`).toLocaleDateString(lang === "en" ? "en-GB" : "es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-white/[0.09] bg-surface">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead>
            <tr className="border-b border-white/[0.09]">
              <th className="sticky left-0 z-10 bg-surface px-5 py-4 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-muted">
                {t.feature}
              </th>
              {PRODUCTS.map((p, i) => (
                <th key={p} className={`px-4 py-4 text-[13px] font-medium ${i === 0 ? "text-phosphor" : "text-ink"}`}>
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label.en} className="border-b border-white/[0.05] hover:bg-white/[0.02]">
                <th scope="row" className="sticky left-0 z-10 bg-surface px-5 py-3 text-sm font-normal text-ink/80">
                  {row.label[lang]}
                </th>
                {row.cells.map((cell, i) => (
                  <td key={i} className={`px-4 py-3 align-top ${i === 0 ? "bg-phosphor/[0.04]" : ""}`}>
                    <span className={`font-mono text-sm ${MARK[cell].className}`} aria-label={t.legend[cell]} title={t.legend[cell]}>
                      {MARK[cell].glyph}
                    </span>
                    {row.notes?.[i] && <span className="ml-2 text-[11px] text-muted">{row.notes[i]?.[lang]}</span>}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-b border-white/[0.05]">
              <th scope="row" className="sticky left-0 z-10 bg-surface px-5 py-3 text-sm font-normal text-ink/80">
                {t.platforms}
              </th>
              {PLATFORMS[lang].map((p, i) => (
                <td key={i} className={`px-4 py-3 text-[12px] text-ink/70 ${i === 0 ? "bg-phosphor/[0.04]" : ""}`}>
                  {p}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="sticky left-0 z-10 bg-surface px-5 py-3 text-sm font-normal text-ink/80">
                {t.license}
              </th>
              {LICENSES.map((l, i) => (
                <td key={i} className={`px-4 py-3 font-mono text-[11px] text-ink/70 ${i === 0 ? "bg-phosphor/[0.04]" : ""}`}>
                  {l}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] text-muted">
        {(["yes", "plugin", "partial", "no"] as const).map((c) => (
          <span key={c}>
            <span className={MARK[c].className}>{MARK[c].glyph}</span> {t.legend[c]}
          </span>
        ))}
      </div>
      <p className="mt-4 text-[12px] leading-5 text-muted">
        {fill(t.checked, { date })}{" "}
        <a href={`${REPO}/issues/new?title=${encodeURIComponent("Comparison table on getnorte.dev")}`} className="text-ink underline decoration-white/30 underline-offset-2 hover:decoration-phosphor">
          {t.report}
        </a>
        .
      </p>
      <details className="mt-2 text-[12px] text-muted">
        <summary className="cursor-pointer hover:text-ink">{t.sources}</summary>
        <ul className="mt-2 space-y-1">
          {SOURCES.map(([name, url]) => (
            <li key={url}>
              <a href={url} className="hover:text-ink" rel="noopener">
                {name} ↗
              </a>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

/** Three honest reasons to pick something else. */
export function NotFor({ t }: { t: Copy["compare"] }) {
  return (
    <div>
      <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-phosphor">{t.notFor}</h3>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {t.notForItems.map(([title, body]) => (
          <div key={title} className="rounded-2xl border border-white/[0.09] bg-surface p-5">
            <p className="text-[15px] font-medium text-ink">{title}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
