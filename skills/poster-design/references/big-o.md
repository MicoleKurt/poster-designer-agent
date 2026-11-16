# The Big O: the house theme

The house look is not a set of Optum posters copied. It is one idea taken from the brand and worked the way a poster designer would work it: **the thick orange ring, the letter O, is the hero of every sheet.** Everything else is type.

This file is what ten studies, two rounds of judging and a look at a few hundred real posters came to. The studies and the notes from real work are in [`designs/`](../../../designs) and [`designs/NOTES.md`](../../../designs/NOTES.md).

## The rules

1. **Three colours.** Warm white `#FAF8F2`, charcoal `#3D3C38`, orange `#FF612B`. No blue, no teal, no tints, no gradients, no shadows. A dark sheet swaps the ground and the ink and keeps the orange.
2. **The orange is the O.** A real ring with a real hole (a band between a fifth and a half of its radius), or a letter O at the size of the letters around it. Never a thin outline circle, never a disc with an icon on it, never a second orange thing competing with the first.
3. **Two typefaces.** Figtree for everything (800 to 900 for headlines and facts, 600 to 700 for small text). Newsreader italic for one quiet sentence. The italic is never a word inside the headline.
4. **Three levels of type and a real jump between them.** The headline; the facts (date, time, place) in bold at about 3.4 percent of the short side, never smaller than the line under the headline; one small label. The headline is at least three times the facts. Nothing sits in between.
5. **No icons, no pictogram people, no clip art, no pills, no boxes with borders, no "When / Time / Where" strip.** Facts are plain lines of bold type in a column. A fact that was not given is simply not there.
6. **Something leaves the sheet.** The ring is cropped by an edge, or the type is. Nothing is centred on the sheet unless the O itself is the centre.
7. **The type is fitted, not poured.** Choose the line breaks by sense (one sentence per line, never a line ending on "the" or "your", never one short word alone), then set the size so the widest line fills its measure.
8. **Type never touches the ring by accident.** Either it clears the ring by a visible gap or it stands fully inside the hole.

## Eight ways the O becomes the poster

These are the layouts Poster Studio draws (`studio/engine.js`). Build by hand in the same spirit, or start from one.

| Name | The move | Where it comes from |
|---|---|---|
| `letters` | The headline is the sheet: capitals fitted line by line to the full width, bleeding off both sides, and one letter O is the orange ring | Experimental Jetset; Headspace swapping letters for its dot |
| `counter` | One letter is the whole poster: a giant O leaves the sheet and the words stand in its counter | The single-letter "Ö" posters |
| `record` | A heavy ring cropped by two edges, the headline above it, the facts in its hole | Müller-Brockmann's disc posters; the ring on the brand's own home page |
| `arcs` | The full stop of the headline is the centre; rings double in size from it and open round the words | Müller-Brockmann, Beethoven |
| `numeral` | The day of the month as large as the sheet allows, the ring passing behind it | Pentagram's numerals as architecture |
| `rings` | The headline set on rings of type round the O, repeated and cropped; the facts upright in the hole | Paula Scher, the Public Theater |
| `burst` | Sixty strokes round an empty O, each longer than the last, the longest leaving the sheet | Radial-stroke festival posters |
| `steps` | Three rings, each smaller than the last, hung from one line, one for each thing to do | Müller-Brockmann, musica viva |

## Sizes

Social posts come first: 4:5 (1080 x 1350) and square (1080 x 1080), then the 9:16 story. A3, A4 and the 16:9 screen use the same layouts.

## What made earlier versions look generated

A pill label in the corner. A drawn person or an icon inside a circle. A thin outline ring as decoration. The last word of every headline in serif italic. A pale band along the bottom with three labelled boxes. A headline only four or five times the small text. The same skeleton on every sheet with the picture swapped. If a new design has any of these, start again.
