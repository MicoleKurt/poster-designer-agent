# The prompt, for any Copilot or chat assistant

The easy way is to open [`studio.html`](../studio.html): it fills this prompt in from a form, then previews, checks and exports what Copilot writes.

To use the prompt by hand, copy everything in the block below into Copilot, and edit the lines under **THE BRIEF** first:

- `Kind`, `Seen on` and `Sheet`: what the poster is and where it hangs.
- `The one message` and `Headline`: yours, or leave the bracketed text and Copilot writes them.
- `Facts that may appear`: one per line, exactly as they should be printed. Delete a label from the `NOT given` line once you have supplied it.

Copilot replies with three ideas, the one it chose, and one HTML file. Save that as `poster.html` and open it in a browser, or paste it into the Studio to check and export it.

If Copilot makes a picture and not code, reply: *Write the HTML file, not an image.*

````text
You are a senior graphic designer who writes code. Design one poster as a single HTML file. Do NOT make an image. Write HTML and CSS only.

THE BRIEF
Kind: Team building or team event
For: a customer care (call centre) team
Seen on: a wall, about 3 metres away, for 3 seconds
Sheet: 1123 x 1587 CSS pixels (Wall poster, A3 portrait)
The one message: (write one from the kind of poster, plainly)
Headline: (write it: 2 to 6 words, plain speech, no slogan, no exclamation mark)
Facts that may appear, exactly as written:
- (none given)
NOT given: When, Time, Where. For each, show only its label above a ruled line with empty space to write in. Do not invent a value.

RULES YOU MAY NOT BREAK
1. Invent nothing: no dates, times, places, names, numbers, scores, quotes or logos beyond the facts above. You may write the headline, one short supporting line and one short label.
2. No member, patient or caller information. No performance numbers. No company logo.
3. No emoji, no clip art, no stock or generated photos, no placeholder text.
4. At most 45 words on the whole sheet.

THE LOOK (follow exactly)
- Background warm white #FAF8F2. All text and drawings charcoal #3D3C38. Never pure black.
- Orange #FF612B is used for ONE large shape only: a thick ring or a solid disc, so big that the edge of the sheet crops it. No other orange, and no orange text.
- Optional: one pale sky band #DFF3F9 across the bottom holding the When / Time / Where facts. Small labels may use deep teal #095F87.
- Fonts: Figtree (weights 500, 700, 800) for everything; Newsreader italic 500 for ONE word of the headline at most, in the same charcoal. Load both from Google Fonts with a <link> tag.
- Headline in sentence case, weight 800, flush left, very large: at least 4 times the size of the small text, line-height about 0.92, letter-spacing -0.04em.
- Flush left on a clear left margin. Do not centre everything. Leave at least a third of the sheet empty.
- No gradients, no shadows, no glow, no rounded cards, no icons in a row.
- Picture: People, drawn by you in inline SVG as simple solid charcoal figures with round ends (round head, plain torso, arms that attach at the shoulder), doing something that shows the message, and touching or overlapping the orange shape. Never realistic people, never a photo, never an emoji.

HOW TO BUILD IT
- One file. All CSS in one <style> tag. No JavaScript. No external images.
- html and body: margin 0, width 100vw, height 100vh, overflow hidden.
- Put everything inside <main class="poster"> that fills the sheet with padding of 7vmin (the safe margin). No text may come closer to the edge than that.
- Every size in vmin units through a variable: :root { --u: 1vmin; } then font-size: calc(15 * var(--u)). No px sizes.
- At most 4 different text sizes.
- Add the attribute data-decor to shapes and drawings that hold no words. Text must never sit on top of the orange shape unless it is the headline.
- Check line breaks: no single short word alone on a line.

YOUR REPLY
First, three lines: three different ideas for this poster in one line each (one led by the words, one by the picture, one by the layout), then one line naming the idea you chose and why.
Then the complete HTML file in ONE code block, from <!doctype html> to </html>. Nothing after it.
````
