"""Render a poster written as HTML/CSS to print- or screen-ready files.

    python render.py poster.html --format a3
    python render.py poster.html --format ig-portrait --grid --pdf

Writes next to the HTML file (or into --out):
    <name>.png          the poster at full resolution
    <name>.thumb.png    the poster at thumbnail size  (does it still read?)
    <name>.squint.png   the poster blurred            (is there one focal point?)
    <name>.grey.png     the poster in greyscale       (does hierarchy survive without colour?)
    <name>.grid.png     with --grid: columns and the safe margin drawn over it
    <name>.pdf          with --pdf: vector PDF at the format's physical size

The poster fills the viewport (100vw x 100vh), so one HTML file renders at any
format. Sizes in the poster should use the --u unit (1% of the short side) so
type and spacing scale with the sheet.
"""
import argparse
import pathlib
import sys

from PIL import Image, ImageFilter, ImageOps
from playwright.sync_api import sync_playwright

# name: (css width, css height, device scale, physical size for PDF or None)
FORMATS = {
    "a4": (794, 1123, 3.125, ("210mm", "297mm")),          # 2481 x 3508, 300 dpi
    "a3": (1123, 1587, 3.125, ("297mm", "420mm")),         # 3508 x 4960, 300 dpi
    "a2": (1587, 2245, 2.21, ("420mm", "594mm")),          # 3508 x 4961, 150 dpi
    "tabloid": (1056, 1632, 3.125, ("11in", "17in")),      # 3300 x 5100, 300 dpi
    "letter": (816, 1056, 3.125, ("8.5in", "11in")),
    "ig-portrait": (1080, 1350, 2, None),                  # 4:5 feed post
    "ig-square": (1080, 1080, 2, None),
    "story": (1080, 1920, 2, None),                        # 9:16
    "landscape": (1920, 1080, 2, None),                    # 16:9
    "og": (1200, 630, 2, None),                            # link preview card
}

GRID_CSS = """
.__grid{position:fixed;inset:0;z-index:99999;pointer-events:none;
  padding:var(--margin,6vmin);display:grid;
  grid-template-columns:repeat(var(--cols,12),1fr);column-gap:var(--gutter,1.6vmin)}
.__grid i{background:rgba(255,0,90,.14);outline:1px solid rgba(255,0,90,.45)}
.__safe{position:fixed;inset:var(--margin,6vmin);z-index:99999;pointer-events:none;
  outline:2px dashed rgba(0,160,255,.9)}
"""


def parse_format(value):
    if value in FORMATS:
        return FORMATS[value]
    try:
        w, h = value.lower().split("x")
        return int(w), int(h), 2, None
    except ValueError:
        sys.exit(f"Unknown format '{value}'. Use one of {', '.join(FORMATS)} or WIDTHxHEIGHT.")


def main():
    # Windows consoles default to a legacy code page; poster text is not ASCII
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("html")
    ap.add_argument("--format", default="a3")
    ap.add_argument("--out", help="output directory (default: beside the HTML)")
    ap.add_argument("--grid", action="store_true", help="also write the grid overlay")
    ap.add_argument("--pdf", action="store_true", help="also write a PDF (print formats only)")
    ap.add_argument("--scale", type=float, help="override the device scale factor")
    args = ap.parse_args()

    src = pathlib.Path(args.html).resolve()
    if not src.exists():
        sys.exit(f"No such file: {src}")
    out = pathlib.Path(args.out).resolve() if args.out else src.parent
    out.mkdir(parents=True, exist_ok=True)
    w, h, scale, physical = parse_format(args.format)
    scale = args.scale or scale
    stem = out / src.stem

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": w, "height": h}, device_scale_factor=scale)
        page.goto(src.as_uri())
        # web fonts and images must be in before the shot, or the layout is a lie
        page.evaluate("document.fonts.ready")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(250)
        page.screenshot(path=f"{stem}.png", full_page=False)

        if args.grid:
            page.add_style_tag(content=GRID_CSS)
            page.evaluate(
                """() => {
                  const cols = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cols')) || 12
                  const g = document.createElement('div'); g.className = '__grid'
                  for (let i = 0; i < cols; i++) g.appendChild(document.createElement('i'))
                  const s = document.createElement('div'); s.className = '__safe'
                  document.body.append(g, s)
                }"""
            )
            page.screenshot(path=f"{stem}.grid.png", full_page=False)

        if args.pdf:
            if not physical:
                print("--pdf skipped: screen formats have no physical size")
            else:
                pdf_page = browser.new_page(viewport={"width": w, "height": h})
                pdf_page.goto(src.as_uri())
                pdf_page.evaluate("document.fonts.ready")
                pdf_page.wait_for_load_state("networkidle")
                pdf_page.emulate_media(media="screen")
                pdf_page.pdf(path=f"{stem}.pdf", width=physical[0], height=physical[1],
                             print_background=True, prefer_css_page_size=False)
        browser.close()

    # the three checks a designer does with their eyes, written to disk
    im = Image.open(f"{stem}.png").convert("RGB")
    thumb_w = 220
    im.resize((thumb_w, round(im.height * thumb_w / im.width)), Image.LANCZOS).save(f"{stem}.thumb.png")
    small = im.resize((im.width // 4, im.height // 4), Image.LANCZOS)
    small.filter(ImageFilter.GaussianBlur(radius=max(6, small.width // 55))).save(f"{stem}.squint.png")
    ImageOps.grayscale(small).save(f"{stem}.grey.png")

    print(f"{src.name} -> {stem.name}.png  {im.width}x{im.height}px  ({args.format})")
    print("also: .thumb.png  .squint.png  .grey.png" + ("  .grid.png" if args.grid else "") + ("  .pdf" if args.pdf and physical else ""))


if __name__ == "__main__":
    main()
