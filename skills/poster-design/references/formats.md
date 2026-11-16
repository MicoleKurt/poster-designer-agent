# Formats, viewing distance and export

## Formats in `render.py`
| Name | Size | Output | Typical use |
|---|---|---|---|
| `a4` | 210 × 297 mm | 2481 × 3508 px, 300 dpi | Notice board, desk drop |
| `a3` | 297 × 420 mm | 3508 × 4960 px, 300 dpi | Wall poster, corridor |
| `a2` | 420 × 594 mm | 3508 × 4961 px, 150 dpi | Large wall, event |
| `tabloid` | 11 × 17 in | 3300 × 5100 px | US wall poster |
| `letter` | 8.5 × 11 in | 2550 × 3300 px | US notice |
| `ig-portrait` | 4:5 | 2160 × 2700 px | Feed post |
| `ig-square` | 1:1 | 2160 × 2160 px | Feed post |
| `story` | 9:16 | 2160 × 3840 px | Story, reel cover, phone lock screen |
| `landscape` | 16:9 | 3840 × 2160 px | Floor screen, TV, slide, meeting background |
| `og` | 1200 × 630 | 2400 × 1260 px | Link preview |
| `WxH` | any | at 2× | Custom, for example `1200x1600` |

One HTML file should render at more than one of these. If it cannot, the layout depends on pixels somewhere: replace them with `--u`.

## Viewing distance
The smallest text must be legible from where people stand. Rule of thumb: letter height of about 4 mm per metre of distance for reading text, more for a moving audience.

| Seen from | Smallest text on A3 | Headline at least |
|---|---|---|
| Arm's length (desk, phone) | 9 pt | 40 pt |
| 2 m (corridor) | 18 pt | 90 pt |
| 5 m (across a room) | 40 pt | 200 pt |
| A wall screen across a floor | 2.3% of screen height | 12% of screen height |

`check.py` warns under 1.1% of the short side. For anything read across a room, treat 2% as the floor and cut copy until it fits.

## Print
- **Bleed:** anything touching the edge must extend 3 mm past it. For print with bleed, ask the printer for their template; export the PDF and tell them the artwork is trimmed size without bleed unless you added it.
- **Safe margin:** keep text at least 5% of the short side from the trim. The checker uses `--margin`.
- **Colour:** the files are RGB. Saturated oranges, greens and blues shift in CMYK. If colour accuracy matters (brand colours), say so in the handover and let the printer convert with the brand's CMYK or Pantone values.
- **Resolution:** 300 dpi at final size for anything held; 150 dpi is enough for A2 and larger.
- **Black text:** plain black, not a rich mix, for small type.

## Screens
- Floor and wall screens are seen briefly and from far away: one message, 12 words in the headline at most, no small print.
- Leave 5% clear at every edge; some displays crop.
- Avoid pure white grounds on large screens in dim rooms; a warm off-white is easier to look at.
- For a rotating set of slides, keep the same grid, margin and type roles on every slide so the set reads as one system.

## Handover files
`poster.png` (full size), `poster.pdf` (print formats), `poster.html`, `brief.json`, and the rationale. Keep the check images out of the handover unless asked.
