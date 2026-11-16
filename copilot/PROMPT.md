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
- The theme is the Big O: one thick orange ring (#FF612B), so large that the edge of the sheet crops it, or one letter O of the headline drawn as that ring. It is the hero of the sheet. No other orange, and no orange text.
- Three colours only: background warm white #FAF8F2, all text charcoal #3D3C38, the one orange. No blue, no tints, no gradients, no shadows, no glow.
- Fonts: Figtree (weights 600, 800, 900) for everything; Newsreader italic 400 for ONE quiet sentence under the headline. Load both from Google Fonts with a <link> tag.
- Three levels of type: the headline (weight 900, very large, line-height about 0.86, letter-spacing -0.035em); the date, time and place as plain bold lines at about 3.4 vmin; one small label. The headline is at least three times the facts.
- Fit the headline to its width: one sentence per line, no line ending on a small joining word, no short word alone on a line.
- Flush left, or built round the ring. Do not centre everything. Type either clears the ring by a visible gap or stands fully inside its hole.
- No icons, no drawn people, no pictures, no pills or tags, no boxes with borders, no strip of labelled facts.

HOW TO BUILD IT
- One file. All CSS in one <style> tag. No JavaScript. No external images.
- html and body: margin 0, width 100vw, height 100vh, overflow hidden.
- Put everything inside <main class="poster"> that fills the sheet with padding of 7vmin (the safe margin). No text may come closer to the edge than that.
- Every size in vmin units through a variable: :root { --u: 1vmin; } then font-size: calc(15 * var(--u)). No px sizes.
- At most 4 different text sizes.
- Add the attribute data-decor to shapes and drawings that hold no words. Text must never sit on top of the orange shape unless it is the headline.
- Check line breaks: no single short word alone on a line.

YOUR REPLY
First, three lines: three different ideas for this poster in one line each (three different things the ring can be or do), then one line naming the idea you chose and why.
Then the complete HTML file in ONE code block, from <!doctype html> to </html>. Nothing after it.
````
