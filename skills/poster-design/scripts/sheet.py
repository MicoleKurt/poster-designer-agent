"""Put several rendered posters side by side on one sheet, labelled, for choosing.

    python sheet.py out/concept-a.png out/concept-b.png out/concept-c.png --out concepts.png
    python sheet.py out/poster.png out/poster.squint.png out/poster.grey.png --out checks.png --labels Final Squint Grey
"""
import argparse
import pathlib
import sys

from PIL import Image, ImageDraw, ImageFont


def font(size):
    for name in ("arialbd.ttf", "Arial Bold.ttf", "DejaVuSans-Bold.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def main():
    # Windows consoles default to a legacy code page; poster text is not ASCII
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("images", nargs="+")
    ap.add_argument("--out", default="sheet.png")
    ap.add_argument("--labels", nargs="*")
    ap.add_argument("--height", type=int, default=900, help="height of each poster on the sheet")
    ap.add_argument("--bg", default="#17171a")
    args = ap.parse_args()

    pad, label_h = 48, 64
    ims = []
    for path in args.images:
        im = Image.open(path).convert("RGB")
        ims.append(im.resize((round(im.width * args.height / im.height), args.height), Image.LANCZOS))
    labels = args.labels or [pathlib.Path(p).stem for p in args.images]
    width = sum(i.width for i in ims) + pad * (len(ims) + 1)
    sheet = Image.new("RGB", (width, args.height + pad * 2 + label_h), args.bg)
    draw = ImageDraw.Draw(sheet)
    f = font(26)
    x = pad
    for im, label in zip(ims, labels):
        sheet.paste(im, (x, pad))
        draw.text((x, pad + args.height + 18), label.upper(), fill="#d8d8de", font=f)
        x += im.width + pad
    sheet.save(args.out)
    print(f"{args.out}  {sheet.width}x{sheet.height}px")


if __name__ == "__main__":
    main()
