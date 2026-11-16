# The process

A poster that fails usually failed before any layout was drawn: nobody decided what it was for. These seven steps come from how a studio works a poster brief (brief, research and mood board, type, grid, sketches, build, variations, presentation). Do them in order. Each one produces something you can show.

## 1. Brief
Write `brief.json`. If you cannot fill a line, ask.

| Field | Question it answers |
|---|---|
| `audience` | Who walks past this, and what do they already know? |
| `one_message` | If they remember one sentence, which? |
| `action` | What should they do next? One thing. |
| `format` | Which sheet or screen (see `formats.md`)? |
| `seen_from` | How far away, and for how long? |
| `tone` | Three words. Not "modern, clean, professional". |
| `direction` | The visual idea in one line, once you have it |
| `must_not` | Things that may not appear |
| `copy` | Every word that will be on the sheet, exactly as it will be set |

Then rank the copy: **1** the thing that stops them, **2** what makes it worth reading, **3** the facts needed to act, **4** who is behind it. Four levels is the most a poster can hold. Anything that does not fit a level is cut or moved to where the QR code leads.

Cut the copy now. A poster is not a flyer: if the brief has 150 words, the first design decision is which 40 survive.

## 2. Look
Decide what tradition the job belongs to before choosing a font. `craft.md` lists the lineages. For a subject you do not know, find 5 to 10 real examples (not template sites) and write one line on each: what is the focal point, how many colours, how big is the biggest thing against the smallest. This is the mood board, kept as notes.

What you are looking for is the *move*, not the style: a numeral used as a picture, a product standing inside a word, a photograph cropped until it is abstract. You will make your own move, not copy theirs.

## 3. Three concepts
Write three ideas, one line each. They must differ in the idea:

- one led by **type** (the words are the picture),
- one led by **image** (an object, a photograph, a drawing),
- one led by **structure** (a grid, a diagram, a system).

Build each as a thumbnail: boxes, the real headline, the real proportions, grey only. Render all three with `--scale 1`, combine with `sheet.py`, and look at them small. Choose the one where the idea is visible at thumbnail size. Write down why the other two lost; that sentence goes in the rationale.

If all three look alike, you had one idea three times. Start step 3 again.

## 4. Build
In this order, because each constrains the next:

1. **Grid and margin.** Set `--cols` and `--margin`. Place the focal element across columns first.
2. **Type scale.** Pick the headline size so it is uncomfortable, then set reading text. Leave nothing in between unless it has a level.
3. **Colour.** Ground, ink, one accent. Decide what the accent is *for* (the action, or the idea) and use it only there.
4. **Image.** Draw it, place the supplied photograph, or let the type be the image.
5. **Details.** Rules, numbers, small caps, alignment to the last unit.

## 5. Measure
`render.py --grid` then `check.py --brief`. FAIL is not negotiable. For each WARN either change the design or write one sentence in the rationale.

## 6. Look again
Open the four renders and answer their questions (see `SKILL.md`). Then go through `anti-slop.md`. Change at least one thing and render again. Typical second-pass changes: the headline 20% bigger, one element removed, the accent used in fewer places, two near-aligned edges made to agree.

## 7. Hand over
- `poster.png`, and `poster.pdf` for print
- `poster.html` and `brief.json`
- Rationale, five lines at most:
  1. The idea, in one sentence.
  2. Why this concept beat the other two.
  3. The three decisions that matter (for example: one light from the top left; orange used only on the ring; headline 4× the reading size).
  4. What was checked, with the numbers.
  5. What is still open or needs the person's file (logo, photograph, final date).

When showing the work, show it in use if you can: on a wall at viewing distance, or at phone size beside the full size. A poster judged at 100% on a monitor is judged wrongly.
