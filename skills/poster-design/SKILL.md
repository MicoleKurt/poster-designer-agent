---
name: poster-design
description: Use when designing or critiquing a poster or any single-sheet graphic for a customer care floor in the Optum look (huddle topic, call habit, privacy reminder, recognition, town hall, notice, floor-screen slide, team-chat post), or any other poster. Gives a studio design process (brief, references, three concepts, grid, type, colour, build, measure), a render pipeline from HTML/CSS to PNG and PDF, an automated checker for hierarchy, contrast, margins, palette and invented text, product lighting rules, brand profiles, and a list of the habits that make work look generated.
---

# Poster design

A poster has three seconds. In that time one thing must be seen, one thing understood, and one thing remembered. Everything in this skill serves that.

The work is done as HTML and CSS and rendered with a real browser, so type is real type, the layout is measurable, and the same file prints at A3 or posts at 1080 × 1350.

## Definition of done
- [ ] `brief.json` exists and the person has seen the one message and the copy.
- [ ] Three concepts were made and compared before one was built.
- [ ] `check.py --brief` reports 0 FAIL, and every WARN is fixed or explained in one sentence.
- [ ] You opened the full render, the squint, the thumbnail and the greyscale, and each passed its question (below).
- [ ] No fact, name, number or logo on the sheet came from you.
- [ ] Files handed over: `poster.png`, `poster.pdf`, `poster.html`, `brief.json` and `research.md` (audience, what works, three ideas, chosen, decisions, checks and what is still needed).

## Files
All paths are relative to the folder this file is in. The same folder works as a Claude Code skill (`~/.claude/skills/poster-design/`), a GitHub Copilot skill (`~/.copilot/skills/poster-design/` or `.github/skills/poster-design/`), or in place inside the repository (`skills/poster-design/`).

| File | What it is |
|---|---|
| [references/process.md](./references/process.md) | The seven steps, with what to produce at each |
| [references/craft.md](./references/craft.md) | Hierarchy, grids, type, colour, image, and the design lineages to draw on |
| [references/product-lighting.md](./references/product-lighting.md) | Making an object look lit and placed, not pasted |
| [references/big-o.md](./references/big-o.md) | The house theme: the rules of the Big O and eight ways it becomes a poster. Read this first for any Optum-look sheet |
| [references/anti-slop.md](./references/anti-slop.md) | The habits that make work look generated, and what to do instead |
| [references/formats.md](./references/formats.md) | Sizes, bleed, safe margins, viewing distance, export |
| [profiles/optum-callcenter.json](./profiles/optum-callcenter.json) | The house look: colours, type roles, shapes, tone, hard rules |
| [profiles/README.md](./profiles/README.md) | How profiles work and how to write one |
| [templates/base.html](./templates/base.html) | Starting sheet: grid, `--u` unit, type scale, palette roles |
| [scripts/render.py](./scripts/render.py) | HTML to PNG and PDF, plus squint, thumbnail, greyscale and grid overlay |
| [scripts/check.py](./scripts/check.py) | Measures the poster against the rules; fails on invented text |
| [scripts/sheet.py](./scripts/sheet.py) | Puts renders side by side for comparing concepts or checks |

## Commands
Set `S` to the `scripts` folder beside this file, wherever the skill is installed.

```bash
S=~/.claude/skills/poster-design/scripts      # Claude Code
S=~/.copilot/skills/poster-design/scripts     # GitHub Copilot, personal skill
S=skills/poster-design/scripts                # inside the repository
python $S/render.py poster.html --format a3 --grid --pdf      # a4 a3 a2 tabloid letter ig-portrait ig-square story landscape og, or 1200x1600
python $S/check.py  poster.html --format a3 --brief brief.json
python $S/sheet.py  a/poster.png b/poster.png c/poster.png --out concepts.png
```
The scripts need `pip install playwright pillow` and `python -m playwright install chromium` once.

Use `--scale 1` while iterating (fast, small files) and the default scale for the final.

## The four looks
After every render, open these and answer the question. A "no" means go back.

If you cannot view image files in this session, say so, give the person the four paths and their questions, and wait for the answer. Never report a look you did not take.

| File | Question |
|---|---|
| `poster.squint.png` | Blurred, is there exactly one thing the eye lands on first? |
| `poster.thumb.png` | At the size of a postage stamp, can you still tell what it is about? |
| `poster.grey.png` | With colour removed, is the order of importance still obvious? |
| `poster.grid.png` | Does every edge sit on a column or the margin? Is anything nearly aligned? |

## Marking up the HTML
- `data-bleed` on display type that deliberately runs off the sheet. It is exempt from the margin check and stays visible when contrast is measured, so reading text must still clear it.
- `data-decor` on shapes and drawings that carry no words.
- `aria-hidden="true"` on a duplicated word used purely as a graphic.
- Sizes in `calc(N * var(--u))`. Never fixed pixels: the poster must survive a change of format.
- Set `--margin` and `--cols` on `:root`; the grid overlay and the margin check read them.

## Rules that are measured
`check.py` enforces these; do not argue with it, change the design or write down why.

| Rule | Limit |
|---|---|
| Typefaces | 2 (3 warns, 4 fails) |
| Text sizes | 3 to 5 clear levels (7 or more warns) |
| Headline against reading size | 3× at least; 4× or more reads as a poster |
| Smallest text | at least 1.1% of the short side |
| Text inside the safe margin | always, unless marked `data-bleed` |
| Contrast against the real background | 4.5:1 for small text, 3:1 for large |
| Hues | 1 or 2 plus neutrals (5 or more warns) |
| Words | 70 at most |
| Text not in the brief | fails |

## Brand profiles
The default profile is `profiles/optum-callcenter.json`, and all three examples use it. A profile is a JSON file in `profiles/` with colour roles, type roles and stand-in fonts, signature shapes, tone, and hard rules. Map its colours onto `--ground`, `--ink`, `--accent` and use its type roles. A profile marked `"official": false` was built from public observation: treat it as a starting point, defer to the organisation's real brand guide and logo files, and say so in the rationale. See `profiles/README.md`.
