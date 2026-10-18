import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { CARDS } from "@/lib/og";

/** Every card is drawn once, at build time: nothing here runs per request. */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(CARDS).map((key) => ({ key }));
}

/** assets/og: the aurora background, the compass and JetBrains Mono (OFL), as files Satori can read. */
function asset(name: string): Buffer {
  return readFileSync(path.join(process.cwd(), "assets", "og", name));
}

const PHOSPHOR = "#B7FF52";
const INK = "#F1F5EF";
const BASE = "#07090A";

export function GET(_request: Request, { params }: { params: { key: string } }) {
  const card = CARDS[params.key];
  if (!card) return new Response("Not found", { status: 404 });

  const background = `data:image/jpeg;base64,${asset("background.jpg").toString("base64")}`;
  const symbol = `data:image/svg+xml;base64,${asset("symbol.svg").toString("base64")}`;
  // Long headlines step down a size so they stay within three lines.
  const size = card.title.length > 64 ? 50 : card.title.length > 44 ? 58 : 66;

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", backgroundColor: BASE, fontFamily: "JetBrains Mono" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori draws plain img */}
        <img src={background} width={1200} height={630} style={{ position: "absolute", inset: 0 }} alt="" />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(90deg, ${BASE} 0%, rgba(7,9,10,0.92) 45%, rgba(7,9,10,0.35) 100%)`,
          }}
        />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- Satori draws plain img */}
            <img src={symbol} width={64} height={64} alt="" />
            <div style={{ fontSize: 44, fontWeight: 500, color: INK, letterSpacing: "-0.02em" }}>norte</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1000 }}>
            <div style={{ fontSize: 24, color: PHOSPHOR, textTransform: "uppercase", letterSpacing: "0.12em" }}>{card.eyebrow}</div>
            <div style={{ fontSize: size, fontWeight: 500, color: INK, lineHeight: 1.1, letterSpacing: "-0.03em" }}>{card.title}</div>
          </div>
          <div style={{ fontSize: 22, color: "rgba(241,245,239,0.6)" }}>getnorte.dev · open source · AGPL-3.0</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "JetBrains Mono", data: asset("JetBrainsMono-Regular.ttf"), weight: 400, style: "normal" },
        { name: "JetBrains Mono", data: asset("JetBrainsMono-Medium.ttf"), weight: 500, style: "normal" },
      ],
    },
  );
}
