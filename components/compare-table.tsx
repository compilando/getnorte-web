import { CHECKED, type Cell, LICENSES, PLATFORMS, PRODUCTS, ROWS, SOURCES } from "@/lib/compare";
import { type Copy, fill, type Lang } from "@/lib/i18n";
import { REPO } from "@/lib/product";

/** A cell's verdict, readable without a legend: a tick, a dash, or a word. */
function Mark({ cell, t }: { cell: Cell; t: Copy["compare"] }) {
  if (cell === "yes")
    return (
      <span className="text-xl font-semibold leading-none text-phosphor" aria-label={t.legend.yes}>
        ✓
      </span>
    );
  if (cell === "no")
    return (
      <span className="text-xl leading-none text-muted/45" aria-label={t.legend.no}>
        —
      </span>
    );
  const tone = cell === "plugin" ? "border-cyan/35 bg-cyan/10 text-cyan" : "border-amber/35 bg-amber/10 text-amber";
  return <span className={`inline-block rounded-md border px-2 py-0.5 text-[13px] leading-5 ${tone}`}>{t.legend[cell]}</span>;
}

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
        <table className="w-full min-w-[960px] border-collapse text-left">
          <thead>
            <tr className="border-b border-white/[0.12]">
              <th className="sticky left-0 z-10 w-[26%] bg-surface px-5 py-5 font-mono text-[12px] font-normal uppercase tracking-[0.12em] text-muted">
                {t.feature}
              </th>
              {PRODUCTS.map((p, i) => (
                <th
                  key={p}
                  className={`px-4 py-5 text-[16px] font-semibold tracking-[-0.01em] ${i === 0 ? "bg-phosphor/[0.06] text-phosphor" : "text-ink"}`}
                >
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label.en} className="border-b border-white/[0.06] hover:bg-white/[0.025]">
                <th scope="row" className="sticky left-0 z-10 bg-surface px-5 py-4 text-[15px] font-normal leading-6 text-ink/90">
                  {row.label[lang]}
                </th>
                {row.cells.map((cell, i) => (
                  <td key={i} className={`px-4 py-4 align-top ${i === 0 ? "bg-phosphor/[0.06]" : ""}`}>
                    <Mark cell={cell} t={t} />
                    {row.notes?.[i] && <span className="mt-1.5 block text-[13px] leading-5 text-ink/60">{row.notes[i]?.[lang]}</span>}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-b border-white/[0.06]">
              <th scope="row" className="sticky left-0 z-10 bg-surface px-5 py-4 text-[15px] font-normal text-ink/90">
                {t.platforms}
              </th>
              {PLATFORMS[lang].map((p, i) => (
                <td key={i} className={`px-4 py-4 text-[14px] leading-5 text-ink/80 ${i === 0 ? "bg-phosphor/[0.06]" : ""}`}>
                  {p}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="sticky left-0 z-10 bg-surface px-5 py-4 text-[15px] font-normal text-ink/90">
                {t.license}
              </th>
              {LICENSES.map((l, i) => (
                <td key={i} className={`px-4 py-4 font-mono text-[13px] leading-5 text-ink/80 ${i === 0 ? "bg-phosphor/[0.06]" : ""}`}>
                  {l}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-[14px] text-ink/70">
        {(["yes", "plugin", "partial", "no"] as const).map((c) => (
          <span key={c} className="inline-flex items-center gap-2">
            <Mark cell={c} t={t} />
            {c === "yes" || c === "no" ? t.legend[c] : null}
          </span>
        ))}
      </div>
      <p className="mt-4 text-[13px] leading-5 text-muted">
        {fill(t.checked, { date })}{" "}
        <a href={`${REPO}/issues/new?title=${encodeURIComponent("Comparison table on getnorte.dev")}`} className="text-ink underline decoration-white/30 underline-offset-2 hover:decoration-phosphor">
          {t.report}
        </a>
        .
      </p>
      <details className="mt-2 text-[13px] text-muted">
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
      <h3 className="font-mono text-[12px] uppercase tracking-[0.16em] text-phosphor">{t.notFor}</h3>
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        {t.notForItems.map(([title, body]) => (
          <div key={title} className="rounded-2xl border border-white/[0.09] bg-surface p-5">
            <p className="text-[15px] font-medium text-ink">{title}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 max-w-3xl border-l-2 border-phosphor/60 pl-4 text-[15px] leading-7 text-ink/80">{t.family}</p>
    </div>
  );
}
