import type { Copy } from "@/lib/i18n";

type Box = { x: number; y: number; w: number; h: number };

const PHOSPHOR = "#B7FF52";
const LINE = "#2f3739";

function Daemon({ box, t }: { box: Box; t: Copy["core"] }) {
  const cx = box.x + 46;
  const cy = box.y + box.h / 2;
  return (
    <g>
      <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={16} fill="#0d1311" stroke={PHOSPHOR} strokeOpacity={0.55} />
      <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={16} fill="url(#core-glow)" />
      {/* The brand's compass: a ring, a tilted needle, a dot. */}
      <circle cx={cx} cy={cy} r={20} fill="none" stroke={PHOSPHOR} strokeOpacity={0.5} strokeWidth={1.5} className="compass-pulse" />
      <line x1={cx - 5} y1={cy + 9} x2={cx + 5} y2={cy - 9} stroke={PHOSPHOR} strokeWidth={2} strokeLinecap="round" />
      <circle cx={cx} cy={cy - 6} r={3} fill={PHOSPHOR} />
      <text x={box.x + 82} y={cy - 4} fill="#F1F5EF" fontSize={19} fontWeight={600} fontFamily="var(--font-jetbrains), monospace">
        {t.daemon}
      </text>
      <text x={box.x + 82} y={cy + 19} fill="#89938C" fontSize={11.5} fontFamily="var(--font-jetbrains), monospace">
        {t.daemonNote}
      </text>
    </g>
  );
}

function Client({ box, name, role }: { box: Box; name: string; role: string }) {
  return (
    <g>
      <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={12} fill="#0e1214" stroke="#ffffff" strokeOpacity={0.14} />
      <text x={box.x + 18} y={box.y + box.h / 2 - 3} fill="#F1F5EF" fontSize={16} fontWeight={600} fontFamily="var(--font-jetbrains), monospace">
        {name}
      </text>
      <text x={box.x + 18} y={box.y + box.h / 2 + 16} fill="#89938C" fontSize={11} fontFamily="var(--font-jetbrains), monospace">
        {role}
      </text>
    </g>
  );
}

function Wire({ d, i }: { d: string; i: number }) {
  return (
    <g>
      <path d={d} fill="none" stroke={LINE} strokeWidth={2} />
      <path
        d={d}
        fill="none"
        stroke={PHOSPHOR}
        strokeWidth={2.4}
        strokeLinecap="round"
        className="wire-flow"
        style={{ animationDelay: `${i * -0.4}s` }}
      />
    </g>
  );
}

function Defs() {
  return (
    <defs>
      <radialGradient id="core-glow" cx="30%" cy="50%" r="80%">
        <stop offset="0%" stopColor={PHOSPHOR} stopOpacity={0.14} />
        <stop offset="100%" stopColor={PHOSPHOR} stopOpacity={0} />
      </radialGradient>
    </defs>
  );
}

function Socket({ x, y, label }: { x: number; y: number; label: string }) {
  const w = label.length * 7.4 + 28;
  return (
    <g>
      <rect x={x - w / 2} y={y - 13} width={w} height={26} rx={13} fill="#07090a" stroke={PHOSPHOR} strokeOpacity={0.35} />
      <text x={x} y={y + 4} textAnchor="middle" fill={PHOSPHOR} fontSize={11} fontFamily="var(--font-jetbrains), monospace">
        {label}
      </text>
    </g>
  );
}

/**
 * The daemon and its clients. Wide: the daemon in the middle, two clients on
 * each side. Narrow: the daemon on top and the clients hanging off one bus, so
 * the labels stay readable on a phone. Traffic walks the wires; the reduced
 * motion rule in globals.css stills it.
 */
export function CoreDiagram({ t }: { t: Copy["core"] }) {
  const [a, b, c, d] = t.clients;

  const core: Box = { x: 320, y: 150, w: 360, h: 100 };
  const size = { w: 200, h: 64 };
  const wide: [Box, (typeof t.clients)[number]][] = [
    [{ x: 30, y: 40, ...size }, a],
    [{ x: 30, y: 296, ...size }, b],
    [{ x: 770, y: 40, ...size }, c],
    [{ x: 770, y: 296, ...size }, d],
  ];
  const wireTo = (box: Box, i: number) => {
    const left = box.x < core.x;
    const x1 = left ? box.x + box.w : box.x;
    const y1 = box.y + box.h / 2;
    const x2 = left ? core.x : core.x + core.w;
    const y2 = core.y + core.h / 2 + (y1 < core.y ? -18 : 18);
    const mx = (x1 + x2) / 2;
    // Traffic flows towards the daemon from the left and out of it to the right.
    return left ? `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}` : `M${x2},${y2} C${mx},${y2} ${mx},${y1} ${x1},${y1}`;
  };

  const nCore: Box = { x: 10, y: 16, w: 340, h: 96 };
  const narrow: Box[] = [0, 1, 2, 3].map((i) => ({ x: 70, y: 150 + i * 84, w: 270, h: 64 }));
  const trunk = 40;

  return (
    <div role="img" aria-label={`${t.daemon}: ${t.clients.map(([n]) => n).join(", ")}`}>
      <svg viewBox="0 0 1000 400" className="hidden w-full sm:block" aria-hidden>
        <Defs />
        {wide.map(([box], i) => (
          <Wire key={i} d={wireTo(box, i)} i={i} />
        ))}
        <Daemon box={core} t={t} />
        {wide.map(([box, [name, role]]) => (
          <Client key={name} box={box} name={name} role={role} />
        ))}
        <Socket x={500} y={296} label={t.socket} />
      </svg>

      <svg viewBox="0 0 360 480" className="w-full sm:hidden" aria-hidden>
        <Defs />
        <Wire d={`M${trunk},${narrow[3].y + 32} L${trunk},${nCore.y + nCore.h}`} i={0} />
        {narrow.map((box, i) => (
          <Wire key={i} d={`M${box.x},${box.y + 32} L${trunk},${box.y + 32}`} i={i + 1} />
        ))}
        <Daemon box={nCore} t={t} />
        {narrow.map((box, i) => (
          <Client key={i} box={box} name={t.clients[i][0]} role={t.clients[i][1]} />
        ))}
      </svg>
    </div>
  );
}
