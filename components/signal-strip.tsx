export function SignalStrip({ signals }: { signals: string[] }) {
  const items = [...signals, ...signals];
  return (
    <div className="group mask-fade-x overflow-hidden border-y border-line/80 bg-[#0a0d0e] py-5" aria-label={signals.join(", ")}>
      <div className="marquee flex w-max items-center group-hover:[animation-play-state:paused]">
        {items.map((signal, index) => (
          <div key={`${signal}-${index}`} aria-hidden={index >= signals.length} className="flex items-center gap-7 px-7 font-mono text-sm tracking-[0.02em] text-ink/85">
            <span>{signal}</span><span className="h-1.5 w-1.5 rotate-45 bg-phosphor/70" />
          </div>
        ))}
      </div>
    </div>
  );
}
