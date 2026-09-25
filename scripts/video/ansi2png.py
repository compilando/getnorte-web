#!/usr/bin/env python3
"""Render a tmux `capture-pane -e` .ansi dump to a PNG inside a window frame.

Used by make-hero.py for the hero film, and on its own for the README's
terminal captures: ansi2png.py <in.ansi> <out.png>. Needs Pillow, JetBrains
Mono (Nerd Font) and Noto Color Emoji.
"""
import functools
import re
import sys
import unicodedata

from PIL import Image, ImageDraw, ImageFilter, ImageFont

FONT_DIR = "/usr/share/fonts"
SCALE = 2
FONT_SIZE = 14 * SCALE
PAD = 18 * SCALE
BAR = 34 * SCALE
MARGIN = 40 * SCALE
RADIUS = 12 * SCALE

BASE16 = [
    (30, 30, 46), (243, 139, 168), (166, 227, 161), (249, 226, 175),
    (137, 180, 250), (245, 194, 231), (148, 226, 213), (186, 194, 222),
    (88, 91, 112), (243, 139, 168), (166, 227, 161), (249, 226, 175),
    (137, 180, 250), (245, 194, 231), (148, 226, 213), (166, 173, 200),
]


def xterm256(n):
    if n < 16:
        return BASE16[n]
    if n < 232:
        n -= 16
        steps = [0, 95, 135, 175, 215, 255]
        return (steps[n // 36], steps[(n // 6) % 6], steps[n % 6])
    v = 8 + (n - 232) * 10
    return (v, v, v)


def find_font(style):
    import glob
    pats = {
        "regular": "*JetBrainsMonoNerdFontMono-Regular.ttf",
        "bold": "*JetBrainsMonoNerdFontMono-Bold.ttf",
    }
    hits = glob.glob(f"{FONT_DIR}/**/{pats[style]}", recursive=True)
    if not hits:
        hits = glob.glob(f"{FONT_DIR}/**/JetBrainsMono-{style.capitalize()}.ttf", recursive=True)
    return ImageFont.truetype(hits[0], FONT_SIZE)


EMOJI_FONT = "/usr/share/fonts/noto/NotoColorEmoji.ttf"


@functools.lru_cache(maxsize=None)
def emoji(ch, size):
    font = ImageFont.truetype(EMOJI_FONT, 109)
    img = Image.new("RGBA", (136, 128), (0, 0, 0, 0))
    ImageDraw.Draw(img).text((0, 0), ch, font=font, embedded_color=True)
    img = img.crop(img.getbbox())
    img.thumbnail((size, size), Image.LANCZOS)
    return img


SGR = re.compile(r"\x1b\[([0-9;]*)m")
OTHER = re.compile(r"\x1b\[[0-9;?]*[A-Za-ln-z]")


def parse(text, default_fg, default_bg):
    rows = []
    fg, bg, bold, dim, rev, ul = default_fg, default_bg, False, False, False, False
    for line in text.rstrip("\n").split("\n"):
        line = OTHER.sub("", line)
        cells = []
        pos = 0
        for m in SGR.finditer(line + "\x1b[m"):
            for ch in line[pos:m.start()]:
                f, b = (bg, fg) if rev else (fg, bg)
                if dim:
                    f = tuple(int(c * 0.6 + b[i] * 0.4) for i, c in enumerate(f))
                cells.append((ch, f, b, bold, ul))
                if unicodedata.east_asian_width(ch) in ("W", "F"):
                    cells.append((None, f, b, bold, ul))
            pos = m.end()
            params = [int(p) if p else 0 for p in m.group(1).split(";")] if m.group(1) else [0]
            i = 0
            while i < len(params):
                p = params[i]
                if p == 0:
                    fg, bg, bold, dim, rev, ul = default_fg, default_bg, False, False, False, False
                elif p == 1:
                    bold = True
                elif p == 2:
                    dim = True
                elif p == 4:
                    ul = True
                elif p == 7:
                    rev = True
                elif p == 22:
                    bold = dim = False
                elif p == 24:
                    ul = False
                elif p == 27:
                    rev = False
                elif p in (38, 48):
                    if params[i + 1] == 2:
                        col = tuple(params[i + 2:i + 5])
                        i += 4
                    else:
                        col = xterm256(params[i + 2])
                        i += 2
                    if p == 38:
                        fg = col
                    else:
                        bg = col
                elif p == 39:
                    fg = default_fg
                elif p == 49:
                    bg = default_bg
                elif 30 <= p <= 37:
                    fg = BASE16[p - 30]
                elif 90 <= p <= 97:
                    fg = BASE16[p - 90 + 8]
                elif 40 <= p <= 47:
                    bg = BASE16[p - 40]
                elif 100 <= p <= 107:
                    bg = BASE16[p - 100 + 8]
                i += 1
        rows.append(cells)
    return rows


def dominant_bg(rows, fallback):
    counts = {}
    for r in rows:
        for c in r:
            counts[c[2]] = counts.get(c[2], 0) + 1
    return max(counts, key=counts.get) if counts else fallback


def render_image(text):
    """The screen, in a window frame with a soft shadow, as an RGBA image."""
    probe = parse(text, (205, 214, 244), (30, 30, 46))
    term_bg = dominant_bg(probe, (30, 30, 46))
    rows = parse(text, (205, 214, 244), term_bg)
    reg, bold = find_font("regular"), find_font("bold")
    cw = round(reg.getlength("M"))
    asc, desc = reg.getmetrics()
    ch = asc + desc
    cols = max(len(r) for r in rows)
    tw, th = cols * cw + PAD * 2, len(rows) * ch + PAD * 2
    ww, wh = tw, th + BAR

    win = Image.new("RGB", (ww, wh), term_bg)
    d = ImageDraw.Draw(win)
    bar_bg = tuple(max(0, int(c * 0.82)) for c in term_bg)
    d.rectangle([0, 0, ww, BAR], fill=bar_bg)
    for k, col in enumerate([(255, 95, 87), (254, 188, 46), (40, 200, 64)]):
        cx, cy, r = PAD + k * 22 * SCALE, BAR // 2, 6 * SCALE
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col)
    y0 = BAR + PAD
    for y, r in enumerate(rows):
        for x, (c, f, b, bo, ul) in enumerate(r):
            px, py = PAD + x * cw, y0 + y * ch
            if b != term_bg:
                d.rectangle([px, py, px + cw, py + ch], fill=b)
        for x, (c, f, b, bo, ul) in enumerate(r):
            if c is None or c == " ":
                continue
            px, py = PAD + x * cw, y0 + y * ch
            if ord(c) >= 0x1F000:
                e = emoji(c, int(ch * 0.8))
                win.paste(e, (px + (2 * cw - e.width) // 2, py + (ch - e.height) // 2), e)
                continue
            d.text((px, py + (ch - asc - desc) // 2), c, font=bold if bo else reg, fill=f)
            if ul:
                d.line([px, py + ch - 3, px + cw, py + ch - 3], fill=f, width=SCALE)

    mask = Image.new("L", (ww, wh), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, ww - 1, wh - 1], RADIUS, fill=255)
    out = Image.new("RGBA", (ww + MARGIN * 2, wh + MARGIN * 2), (0, 0, 0, 0))
    shadow = Image.new("RGBA", out.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        [MARGIN, MARGIN + 10 * SCALE, MARGIN + ww, MARGIN + wh + 10 * SCALE], RADIUS, fill=(0, 0, 0, 120))
    out = Image.alpha_composite(out, shadow.filter(ImageFilter.GaussianBlur(16 * SCALE)))
    out.paste(win, (MARGIN, MARGIN), mask)
    return out


def render(src, dst):
    render_image(open(src, encoding="utf-8", errors="replace").read()).save(dst, optimize=True)


if __name__ == "__main__":
    render(sys.argv[1], sys.argv[2])
