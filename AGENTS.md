# Instructions for coding agents

This repository is a poster-design agent and skill. It works in Claude Code and in GitHub Copilot.

## When asked to design or critique a poster or graphic
1. Read `skills/poster-design/SKILL.md` and follow it. It names the reference files to read for each kind of job.
2. Use the house look in `skills/poster-design/profiles/optum-callcenter.json` unless another brand is named. Its `hard_rules` are not negotiable.
3. Work as HTML and CSS starting from `skills/poster-design/templates/base.html`. Render and check with the scripts:

```bash
python skills/poster-design/scripts/render.py poster.html --format a3 --grid --pdf
python skills/poster-design/scripts/check.py  poster.html --format a3 --brief brief.json
```

4. A poster is finished only when `check.py --brief` reports 0 FAIL and the full render, squint, thumbnail and greyscale images have been looked at. If you cannot view images, say so and ask the person to look; never claim you did.

## Rules that always hold
- Never invent a fact, name, number, quote or logo. Every word on a poster comes from the brief.
- Never generate people. Use supplied photographs, a drawing, or type.
- Never put member, patient or caller information on a sheet.
- The Optum profile is unofficial. The company's own brand guide and logo files take priority.

## When changing this repository
- The skill in `skills/poster-design/` is the single source. `install.sh` and `install.ps1` copy it to the personal skill folders; do not keep a second edited copy.
- After changing a script or a rule, run the checker on all three examples; each must report `0 fail, 0 warn`, and `examples/listen-first/slop.html` must still fail.
- Sizes in posters use `calc(N * var(--u))`, never fixed pixels.
- Python 3.10+, standard library plus `playwright` and `pillow` only.
