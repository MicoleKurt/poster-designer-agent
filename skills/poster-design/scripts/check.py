"""Measure a poster against the rules, instead of trusting that it looks fine.

    python check.py poster.html --format a3
    python check.py poster.html --format ig-portrait --brief brief.json

Exit code 1 if anything FAILS. WARN means "justify it or fix it".

What it measures on the rendered page:
    type      typefaces in use, number of sizes, headline-to-body scale, smallest size
    layout    text inside the safe margin, nothing clipped or overflowing, alignment variety
    contrast  every piece of text against what is actually behind it (WCAG ratio)
    colour    number of distinct hues, default "AI" gradients
    copy      word count, placeholder text, emoji used as icons
    brief     with --brief: every word on the poster must come from the brief (no invented facts)
"""
import argparse
import colorsys
import io
import json
import pathlib
import re
import sys

from PIL import Image
from playwright.sync_api import sync_playwright

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from render import parse_format  # noqa: E402

COLLECT = r"""
() => {
  const W = innerWidth, H = innerHeight
  const out = []
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  let n
  while ((n = walker.nextNode())) {
    const text = n.textContent.replace(/\s+/g, ' ').trim()
    if (!text) continue
    const el = n.parentElement
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) === 0) continue
    if (el.closest('[aria-hidden="true"], [data-decor]')) continue
    const range = document.createRange(); range.selectNodeContents(n)
    const r = range.getBoundingClientRect()
    if (r.width < 1 || r.height < 1) continue
    out.push({
      text, x: r.left, y: r.top, w: r.width, h: r.height,
      size: parseFloat(cs.fontSize), weight: cs.fontWeight,
      family: cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(),
      color: cs.color, align: cs.textAlign,
      clipped: el.scrollWidth > el.clientWidth + 1 && cs.overflow !== 'visible',
      bleed: !!el.closest('[data-bleed]'),
      shadow: cs.textShadow !== 'none',
    })
  }
  const css = [...document.querySelectorAll('style')].map(s => s.textContent).join('\n')
    + [...document.querySelectorAll('[style]')].map(e => e.getAttribute('style')).join('\n')
  const margin = getComputedStyle(document.documentElement).getPropertyValue('--margin').trim()
  const probe = document.createElement('div'); probe.style.cssText = 'position:fixed;width:' + (margin || '6vmin')
  document.body.appendChild(probe); const marginPx = probe.getBoundingClientRect().width; probe.remove()
  return { W, H, items: out, css, marginPx }
}
"""

# deliberate bleed and decor type stays visible: reading text must clear it too
HIDE_TEXT = "*:not([data-bleed],[data-bleed] *,[data-decor],[data-decor] *){color:transparent!important;text-shadow:none!important;-webkit-text-stroke:0!important;caret-color:transparent!important}"
PLACEHOLDER = re.compile(r"lorem ipsum|dolor sit|your (text|title|headline|logo|name) here|company name|insert |placeholder|tbd\b|xx/xx|00/00", re.I)
EMOJI = re.compile("[\U0001F300-\U0001FAFF\U00002600-\U000027BF\U0001F1E6-\U0001F1FF]")
CSS_COLOR = re.compile(r"#([0-9a-fA-F]{3,8})\b|rgba?\(([^)]+)\)|hsla?\(([^)]+)\)")


def rgb_of(css):
    m = re.match(r"rgba?\(([^)]+)\)", css)
    parts = [float(v) for v in re.split(r"[ ,/]+", m.group(1).strip())[:4]]
    return tuple(parts[:3]), (parts[3] if len(parts) > 3 else 1.0)


def lum(rgb):
    def ch(v):
        v /= 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = rgb
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)


def contrast(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def hue_bucket(rgb):
    h, s, v = colorsys.rgb_to_hsv(*(c / 255 for c in rgb))
    if s < 0.22 or v < 0.16:
        return None  # neutrals are free
    return round(h * 12) % 12  # 30 degree buckets


def css_colors(css):
    for m in CSS_COLOR.finditer(css):
        try:
            if m.group(1):
                x = m.group(1)
                if len(x) in (3, 4):
                    x = "".join(c * 2 for c in x[:3])
                yield tuple(int(x[i:i + 2], 16) for i in (0, 2, 4))
            elif m.group(2):
                v = [float(t.strip("% ")) for t in re.split(r"[ ,/]+", m.group(2).strip())[:3]]
                yield tuple(v)
            else:
                v = [float(t.strip("%deg ")) for t in re.split(r"[ ,/]+", m.group(3).strip())[:3]]
                r, g, b = colorsys.hls_to_rgb(v[0] / 360, v[2] / 100, v[1] / 100)
                yield (r * 255, g * 255, b * 255)
        except (ValueError, IndexError):
            continue


def main():
    # Windows consoles default to a legacy code page; poster text is not ASCII
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("html")
    ap.add_argument("--format", default="a3")
    ap.add_argument("--brief", help="brief.json; its 'copy' values are the only text allowed on the poster")
    ap.add_argument("--json", action="store_true", help="print the report as JSON")
    args = ap.parse_args()

    src = pathlib.Path(args.html).resolve()
    w, h, _, _ = parse_format(args.format)
    with sync_playwright() as p:
        b = p.chromium.launch()
        page = b.new_page(viewport={"width": w, "height": h})
        page.goto(src.as_uri())
        page.evaluate("document.fonts.ready")
        page.wait_for_load_state("networkidle")
        data = page.evaluate(COLLECT)
        page.add_style_tag(content=HIDE_TEXT)
        bg = Image.open(io.BytesIO(page.screenshot())).convert("RGB")
        b.close()

    items, W, H = data["items"], data["W"], data["H"]
    short = min(W, H)
    results = []

    def add(level, group, msg):
        results.append((level, group, msg))

    if not items:
        add("FAIL", "copy", "no text found on the poster")

    # ---- type ----
    families = sorted({i["family"] for i in items})
    if len(families) > 3:
        add("FAIL", "type", f"{len(families)} typefaces ({', '.join(families)}). Use two: one to shout, one to explain.")
    elif len(families) == 3:
        add("WARN", "type", f"3 typefaces ({', '.join(families)}). Two is the working limit.")
    else:
        add("PASS", "type", f"typefaces: {', '.join(families) or 'none'}")

    sizes = sorted({round(i["size"], 1) for i in items if not i["bleed"]}) or sorted({round(i["size"], 1) for i in items})
    if len(sizes) > 6:
        add("WARN", "type", f"{len(sizes)} different text sizes. A poster needs 3 to 5 clear levels.")
    else:
        add("PASS", "type", f"{len(sizes)} text sizes")
    if sizes:
        chars = {}
        for i in items:
            chars[round(i["size"], 1)] = chars.get(round(i["size"], 1), 0) + len(i["text"])
        body = max(chars, key=chars.get)   # the size most of the words are set in
        big = max(round(i["size"], 1) for i in items)   # display type counts even when it bleeds
        ratio = big / body if body else 0
        if ratio < 3:
            add("WARN", "type", f"headline is only {ratio:.1f}x the reading size. Push the scale: 4x or more reads as a poster, less reads as a document.")
        else:
            add("PASS", "type", f"headline is {ratio:.1f}x the reading size")
        smallest = sizes[0]
        if smallest < short * 0.011:
            add("WARN", "type", f"smallest text is {smallest:.0f}px on a {short}px sheet ({100 * smallest / short:.1f}%). Under 1.1% it will not survive viewing distance.")

    # ---- layout ----
    m = max(data["marginPx"] * 0.5, short * 0.025)
    outside = [i for i in items if not i["bleed"] and (i["x"] < m or i["y"] < m or i["x"] + i["w"] > W - m or i["y"] + i["h"] > H - m)]
    off = [i for i in items if not i["bleed"] and (i["x"] < -1 or i["y"] < -1 or i["x"] + i["w"] > W + 1 or i["y"] + i["h"] > H + 1)]
    if off:
        add("FAIL", "layout", f"text runs off the sheet: {', '.join(repr(i['text'][:24]) for i in off[:4])}")
    if [i for i in outside if i not in off]:
        add("FAIL", "layout", "text inside the trim danger zone (mark deliberate bleed type with data-bleed): "
            + ", ".join(repr(i["text"][:24]) for i in outside if i not in off)[:160])
    if not outside and not off:
        add("PASS", "layout", "all text inside the safe margin")
    clipped = [i for i in items if i["clipped"]]
    if clipped:
        add("FAIL", "layout", f"clipped text: {', '.join(repr(i['text'][:24]) for i in clipped[:4])}")
    centred = sum(1 for i in items if i["align"] == "center")
    if len(items) >= 4 and centred / len(items) > 0.85:
        add("WARN", "layout", "almost everything is centred. A centred stack is the default; choose an axis, an edge or a deliberate asymmetry.")

    # ---- contrast (against what is really behind the text) ----
    low = []
    for i in items:
        if i["bleed"]:
            continue  # display type that is part of the picture is judged by eye
        box = (max(0, int(i["x"])), max(0, int(i["y"])), min(W, int(i["x"] + i["w"]) + 1), min(H, int(i["y"] + i["h"]) + 1))
        if box[2] <= box[0] or box[3] <= box[1]:
            continue
        region = bg.crop(box).resize((24, 12), Image.BILINEAR)
        (fr, fg, fb), alpha = rgb_of(i["color"])
        worst = 99
        raw = region.tobytes()
        for px in (tuple(raw[k:k + 3]) for k in range(0, len(raw), 3)):
            fgc = tuple(alpha * c + (1 - alpha) * p for c, p in zip((fr, fg, fb), px))
            worst = min(worst, contrast(fgc, px))
        large = i["size"] >= short * 0.03
        need = 3.0 if large else 4.5
        if worst < need:
            low.append((worst, need, i["text"][:28]))
    if low:
        hard = [l for l in low if l[0] < l[1] * 0.7]
        add("FAIL" if hard else "WARN", "contrast",
            "low contrast: " + "; ".join(f"{t!r} {c:.1f}:1 (needs {n})" for c, n, t in sorted(low)[:5]))
    elif items:
        add("PASS", "contrast", "all text clears its contrast target against the real background")

    # ---- colour ----
    hues = {}
    for i in items:
        hb = hue_bucket(rgb_of(i["color"])[0])
        if hb is not None:
            hues[hb] = hues.get(hb, 0) + 1
    for rgb in css_colors(data["css"]):
        hb = hue_bucket(rgb)
        if hb is not None:
            hues[hb] = hues.get(hb, 0) + 1
    if len(hues) > 4:
        add("WARN", "colour", f"{len(hues)} separate hues in play. Pick 1 or 2 and give each a job; the rest should be neutrals.")
    else:
        add("PASS", "colour", f"{len(hues)} hue famil{'y' if len(hues) == 1 else 'ies'} plus neutrals")
    grads = re.findall(r"(?:linear|radial|conic)-gradient\([^;]+", data["css"])
    purple = [g for g in grads if sum(1 for c in css_colors(g) if hue_bucket(c) in (8, 9, 10)) >= 2]
    if purple:
        add("WARN", "colour", "purple-to-blue or purple-to-pink gradient: the most recognisable generated-design default. Use it only if the brief's brand is that colour.")
    if "backdrop-filter" in data["css"]:
        add("WARN", "colour", "frosted-glass panel (backdrop-filter): a web-UI habit, not a poster device.")
    if sum(1 for i in items if i["shadow"]) > 2:
        add("WARN", "colour", "text-shadow on several pieces of text. Fix legibility with contrast or a plain panel, not glow.")

    # ---- copy ----
    words = sum(len(i["text"].split()) for i in items)
    if words > 70:
        add("WARN", "copy", f"{words} words. A poster is read in three seconds; cut to one message plus the facts needed to act.")
    else:
        add("PASS", "copy", f"{words} words")
    joined = " ".join(i["text"] for i in items)
    if PLACEHOLDER.search(joined):
        add("FAIL", "copy", f"placeholder text on the poster: {PLACEHOLDER.search(joined).group(0)!r}")
    if EMOJI.search(joined):
        add("FAIL", "copy", "emoji used as graphics. Draw an icon or drop it.")

    # ---- brief: nothing invented ----
    if args.brief:
        brief = json.loads(pathlib.Path(args.brief).read_text(encoding="utf8"))
        allowed = []

        def gather(v):
            if isinstance(v, str):
                allowed.append(v)
            elif isinstance(v, dict):
                for x in v.values():
                    gather(x)
            elif isinstance(v, list):
                for x in v:
                    gather(x)
        gather(brief.get("copy", brief))
        norm = lambda s: re.sub(r"[^a-z0-9]+", " ", s.lower()).strip()  # noqa: E731
        pool = " " + norm(" | ".join(allowed)) + " "
        invented = [i["text"] for i in items if norm(i["text"]) and f" {norm(i['text'])} " not in pool]
        if invented:
            add("FAIL", "brief", "text that is not in the brief (invented or mistyped): " + "; ".join(repr(t[:40]) for t in invented[:6]))
        else:
            add("PASS", "brief", "every word on the poster comes from the brief")

    order = {"FAIL": 0, "WARN": 1, "PASS": 2}
    results.sort(key=lambda r: order[r[0]])
    if args.json:
        print(json.dumps([{"level": l, "group": g, "message": m} for l, g, m in results], indent=2))
    else:
        for level, group, msg in results:
            print(f"{level:4}  {group:8}  {msg}")
        fails = sum(1 for r in results if r[0] == "FAIL")
        warns = sum(1 for r in results if r[0] == "WARN")
        print(f"\n{fails} fail, {warns} warn, {len(results) - fails - warns} pass")
    sys.exit(1 if any(r[0] == "FAIL" for r in results) else 0)


if __name__ == "__main__":
    main()
