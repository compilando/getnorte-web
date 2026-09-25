#!/usr/bin/env python3
"""The hero film: about twenty seconds of real captures, one caption per scene.

Nothing here is drawn by hand: every screen is a capture from shots/tui or the
window's recorded tour, composed onto the aurora with a caption, and chained
with crossfades by ffmpeg.

usage: make-hero.py [lang ...]        (default: en es)
writes public/video/hero-<lang>.{webm,mp4} and hero-<lang>-poster.webp

Needs Pillow, ffmpeg (libvpx-vp9, libx264), and the fonts ansi2png.py uses.
"""
import math
import os
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

sys.path.insert(0, os.path.dirname(__file__))
from ansi2png import render_image  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
W, H, FPS = 1440, 810, 30
FADE = 0.35
PHOSPHOR, INK, MUTED = (183, 255, 82), (241, 245, 239), (137, 147, 140)
BOX = (36, 20, W - 36, 690)  # where the screens go; the caption sits below
SANS = "/usr/share/fonts/Adwaita/AdwaitaSans-Regular.ttf"
MONO = "/usr/share/fonts/TTF/JetBrainsMono-Medium.ttf"
MONO_BOLD = "/usr/share/fonts/TTF/JetBrainsMono-ExtraBold.ttf"

CAPTIONS = {
    "en": [
        "Two panes. Any terminal.",
        "Or a native window. Same core.",
        "One daemon. Every screen sees the same work.",
        "Agents ask. You approve.",
        "Changed your mind? Undo the whole session.",
    ],
    "es": [
        "Dos paneles. En cualquier terminal.",
        "O una ventana nativa. El mismo núcleo.",
        "Un demonio. Todas las pantallas ven el mismo trabajo.",
        "Los agentes piden. Tú apruebas.",
        "¿Te lo has pensado mejor? Deshaz la sesión entera.",
    ],
}
TAGLINE = {
    "en": "The open-source file commander for the agent era.",
    "es": "El gestor de ficheros libre para la era de los agentes.",
}

# (kind, source, seconds, caption). Sources are relative to shots/tui/<lang>.
PLAN = [
    ("ansi", "reel:0", 1.1, 0),
    ("ansi", "reel:1", 1.0, 0),
    ("ansi", "reel:5", 1.0, 0),
    ("ansi", "reel:6", 1.4, 0),
    ("gui", (15.0, 4.2), 4.2, 1),
    ("pair", ("daemon-a", "daemon-b"), 3.8, 2),
    ("ansi", "agent-scope", 1.8, 3),
    ("ansi", "agent-ask", 2.4, 3),
    ("ansi", "agent-timeline", 1.6, 3),
    ("ansi", "agent-undo", 1.8, 4),
    ("ansi", "agent-undone", 1.6, 4),
    ("end", None, 2.8, None),
]


def backdrop():
    img = Image.open(os.path.join(ROOT, "public", "norte-aurora.png")).convert("RGB")
    k = max(W / img.width, H / img.height)
    img = img.resize((math.ceil(img.width * k), math.ceil(img.height * k)), Image.LANCZOS)
    left, top = (img.width - W) // 2, (img.height - H) // 2
    img = img.crop((left, top, left + W, top + H)).filter(ImageFilter.GaussianBlur(6))
    img = ImageEnhance.Brightness(img).enhance(0.32).convert("RGBA")
    # Darker towards the caption, so it reads on any part of the aurora.
    shade = Image.new("L", (1, H))
    for y in range(H):
        shade.putpixel((0, y), int(max(0, (y - H * 0.55) / (H * 0.45)) * 200))
    black = Image.new("RGBA", (W, H), (4, 7, 6, 255))
    return Image.composite(black, img, shade.resize((W, H)))


def fit(img, box):
    x0, y0, x1, y1 = box
    k = min((x1 - x0) / img.width, (y1 - y0) / img.height)
    img = img.resize((round(img.width * k), round(img.height * k)), Image.LANCZOS)
    return img, (x0 + (x1 - x0 - img.width) // 2, y0 + (y1 - y0 - img.height) // 2)


def caption(img, text, n):
    d = ImageDraw.Draw(img)
    num, sans = ImageFont.truetype(MONO, 20), ImageFont.truetype(SANS, 40)
    label = f"{n + 1:02d}"
    tw = d.textlength(text, font=sans)
    lw = d.textlength(label, font=num) + 22
    x = (W - tw - lw) / 2
    y = 732
    d.text((x, y + 13), label, font=num, fill=PHOSPHOR)
    d.text((x + lw, y), text, font=sans, fill=INK)


def compass(d, cx, cy, r, width):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=PHOSPHOR, width=width)
    dx, dy = math.sin(math.radians(28)) * r / 2, math.cos(math.radians(28)) * r / 2
    d.line([(cx - dx, cy + dy), (cx + dx, cy - dy)], fill=PHOSPHOR, width=width + 1)
    d.ellipse([cx - r * 0.11, cy - r * 0.39, cx + r * 0.11, cy - r * 0.17], fill=PHOSPHOR)


def end_card(bg, lang):
    img = bg.copy()
    d = ImageDraw.Draw(img)
    word = ImageFont.truetype(MONO_BOLD, 128)
    ww = d.textlength("norte", font=word)
    x = (W - ww - 150) / 2
    compass(d, x + 56, 300, 56, 5)
    d.text((x + 150, 220), "norte", font=word, fill=INK)
    tag = ImageFont.truetype(SANS, 38)
    t = TAGLINE[lang]
    d.text(((W - d.textlength(t, font=tag)) / 2, 420), t, font=tag, fill=INK)
    mono = ImageFont.truetype(MONO, 30)
    url = "getnorte.dev"
    d.text(((W - d.textlength(url, font=mono)) / 2, 500), url, font=mono, fill=PHOSPHOR)
    return img


def reel_frame(lang, i):
    raw = open(os.path.join(ROOT, "shots", "tui", lang, "reel.ansi"), encoding="utf-8").read()
    return [f for f in raw.split("\f\n") if f.strip()][i]


def screen(lang, src):
    if src.startswith("reel:"):
        img = render_image(reel_frame(lang, int(src[5:])))
    else:
        img = render_image(open(os.path.join(ROOT, "shots", "tui", lang, f"{src}.ansi"), encoding="utf-8").read())
    # ansi2png leaves a wide margin for its shadow; keep just enough of it.
    return img.crop((52, 52, img.width - 52, img.height - 30))


def still(bg, lang, kind, src, cap):
    img = bg.copy()
    if kind == "ansi":
        s, at = fit(screen(lang, src), BOX)
        img.alpha_composite(s, at)
    elif kind == "pair":
        mid = W // 2
        for part, box in zip(src, [(BOX[0], BOX[1], mid - 6, BOX[3]), (mid + 6, BOX[1], BOX[2], BOX[3])]):
            s, at = fit(screen(lang, part), box)
            img.alpha_composite(s, at)
    elif kind == "end":
        img = end_card(bg, lang)
    if cap is not None:
        caption(img, CAPTIONS[lang][cap], cap)
    return img


def gui_box():
    """Where the window's video goes: its 3:2 fitted into BOX, framed."""
    bw, bh = BOX[2] - BOX[0], BOX[3] - BOX[1] - 20
    k = min(bw / 1200, bh / 800)
    w, h = int(1200 * k) // 2 * 2, int(800 * k) // 2 * 2
    return (BOX[0] + (bw - w) // 2) // 2 * 2, (BOX[1] + 10) // 2 * 2, w, h


def gui_backdrop(bg, lang, cap):
    img = bg.copy()
    x, y, w, h = gui_box()
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle([x, y + 16, x + w, y + h + 16], 14, fill=(0, 0, 0, 150))
    img.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(22)))
    ImageDraw.Draw(img).rounded_rectangle([x - 1, y - 1, x + w, y + h], 10, outline=(255, 255, 255, 40), width=2)
    caption(img, CAPTIONS[lang][cap], cap)
    return img


def run(*args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)


def build(lang):
    tmp = tempfile.mkdtemp(prefix=f"norte-hero-{lang}-")
    bg = backdrop()
    clips, durations = [], []
    for i, (kind, src, secs, cap) in enumerate(PLAN):
        out = f"{tmp}/c{i:02d}.mp4"
        if kind == "gui":
            start, length = src
            png = f"{tmp}/c{i:02d}.png"
            gui_backdrop(bg, lang, cap).convert("RGB").save(png)
            x, y, w, h = gui_box()
            video = os.path.join(ROOT, "public", "shots", "gui", lang, "tour.webm")
            run("-loop", "1", "-t", str(secs), "-i", png, "-ss", str(start), "-t", str(length), "-i", video,
                "-filter_complex", f"[1:v]scale={w}:{h},fps={FPS}[v];[0:v][v]overlay={x}:{y}:shortest=1,format=yuv420p",
                "-r", str(FPS), "-c:v", "libx264", "-crf", "10", "-preset", "fast", out)
        else:
            png = f"{tmp}/c{i:02d}.png"
            still(bg, lang, kind, src, cap).convert("RGB").save(png)
            if i == 0:
                Image.open(png).save(os.path.join(ROOT, "public", "video", f"hero-{lang}-poster.webp"), quality=86)
            run("-loop", "1", "-t", str(secs), "-i", png, "-vf", "format=yuv420p", "-r", str(FPS),
                "-c:v", "libx264", "-crf", "10", "-preset", "fast", out)
        clips.append(out)
        durations.append(secs)

    # Crossfade each clip into the next.
    inputs = [a for c in clips for a in ("-i", c)]
    graph, last, offset = [], "[0:v]", 0.0
    for k in range(1, len(clips)):
        offset += durations[k - 1] - FADE
        label = f"[x{k}]"
        graph.append(f"{last}[{k}:v]xfade=transition=fade:duration={FADE}:offset={offset:.3f}{label}")
        last = label
    joined = f"{tmp}/joined.mp4"
    run(*inputs, "-filter_complex", ";".join(graph), "-map", last, "-r", str(FPS),
        "-c:v", "libx264", "-crf", "8", "-preset", "fast", "-pix_fmt", "yuv420p", joined)

    base = os.path.join(ROOT, "public", "video", f"hero-{lang}")
    run("-i", joined, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "38", "-row-mt", "1", "-deadline", "good",
        "-cpu-used", "2", "-pix_fmt", "yuv420p", "-an", f"{base}.webm")
    run("-i", joined, "-c:v", "libx264", "-crf", "27", "-preset", "slow", "-pix_fmt", "yuv420p",
        "-movflags", "+faststart", "-an", f"{base}.mp4")
    total = sum(durations) - FADE * (len(durations) - 1)
    sizes = ", ".join(f"{ext} {os.path.getsize(f'{base}.{ext}') / 1e6:.1f} MB" for ext in ("webm", "mp4"))
    print(f"{lang}: {total:.1f} s, {sizes}")


if __name__ == "__main__":
    os.makedirs(os.path.join(ROOT, "public", "video"), exist_ok=True)
    for lang in sys.argv[1:] or ["en", "es"]:
        build(lang)
