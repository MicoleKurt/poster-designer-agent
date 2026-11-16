# Product posters: lit and placed, not pasted

A product cut out and dropped on a background looks like a sticker. What makes it look photographed is that **one light** explains everything in the picture. This is the order a retoucher works in, turned into rules.

## 1. Choose the light first
Before any drawing: where is the light? Write it in the CSS comment at the top (`ONE light, from the top left`). Every later step has to agree with that sentence.

## 2. Ground in two tones of one hue
- Base colour taken from the product or its opposite on the wheel.
- The same hue lighter where the light lands, darker in the far corner. Two soft radial fields are enough.
- A shape on the ground (a band, a curve, a giant letter) gives the product something to stand in front of. Depth needs at least three layers: ground, shape, product.

## 3. A clean edge
- A supplied photograph: remove the background, then pull the mask in by a pixel so no pale fringe survives (the retoucher's "minimum, radius 1" on the mask). A halo is the first thing that gives a cut-out away.
- Keep the product as one object you can move and scale without losing quality: SVG, or a single high-resolution PNG. Never scale a small image up.
- Drawn products: build from simple solids with a gradient across the form, not flat fills with an outline.

## 4. Shade the form
On the object itself, across its width:
- a lit edge, almost white, on the side facing the light;
- the true colour next to it;
- a gradual fall into shade;
- a thin strip of the **ground's** colour on the far edge (bounce light). This is what ties the object to its background.

Add one hard narrow highlight and one soft wide one on the lit side. Darken only the areas the light cannot reach, not the whole object.

## 5. Two shadows, never one
- **Contact shadow:** small, dark, tight, directly under where the object touches. Without it the object floats.
- **Cast shadow:** larger, softer, lower opacity, stretched away from the light. It fades with distance.
- If the object stands in front of a letter or a shape, its shadow falls on that too. This single detail does more for depth than anything else.

## 6. Rim light from the ground
A thin line of the ground's bright colour along the lit edge of the product (screen or lighter blend). The background appears to be reflecting onto the object.

## 7. Interleave
Put the product between layers: in front of the word but behind one stroke of it, or standing where a letter should be, or wrapped by a band. An object that passes both in front of and behind the graphics is unmistakably *in* the scene.

## 8. Type last, and out of the way
- The product is the focal point. The headline supports it: short, at one edge, not across the object.
- One word behind the product, very large, is often the whole layout.
- Supporting facts are three lines of small text in a corner, not badges.

## What to leave out
Starbursts and price explosions, "50% OFF" stickers, icon rows, phone and website strips, lens flares, smoke, splashes that do not come from the product, neon outlines, and more than one product at hero size. Each one is a sign that the idea was missing.

## Checklist
- [ ] The light direction is written down and nothing contradicts it.
- [ ] Lit side, true colour, shade, bounce: all four are on the object.
- [ ] Contact shadow and cast shadow are both there and point away from the light.
- [ ] The edge has no fringe.
- [ ] The product overlaps at least one other element.
- [ ] The palette comes from the product.
- [ ] Squint render: the product is the first thing seen.
