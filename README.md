# Poster Designer

**Type a few words and get a designed poster in the Optum look, as a PNG and a PDF. Use it on its own, or let any Copilot write the words.**

![Ten posters made from the same words: ten different layouts in three colour styles](docs/looks.jpg)

Every poster above came from the same headline, line, date, time and place. Each press of **Another look** gives a different design.

> **Unofficial.** Not affiliated with or endorsed by Optum. The look comes from studying the company's public website. There is no logo here, and the company's own brand guide and logo files take priority. Made for internal team posters.

## Make a poster

**Open the Studio: <https://micolekurt.github.io/poster-designer-agent/studio.html>**

1. Choose the kind of poster and type a headline. Add the date, time and place if you have them.
2. Press **Make the poster**. Press **Another look** until you like it.
3. Press **Download everything**.

You get one ZIP with:

| File | What it is |
|---|---|
| `poster.png` | The poster as an image, for screens, chat and slides |
| `poster.pdf` | The poster at the exact paper size, for printing |
| `poster-notes.md` | Who it is for, why it looks the way it does, your words, and the check results |
| `poster.html` | The source, to change later |

Nothing to install and no account. It also works with no internet: download [`studio.html`](studio.html) once and open it from your computer. The typefaces, the drawings and the code that makes the files are all inside that one file.

![Poster Studio: the form, the poster and the checks](docs/studio.png)

## What it can make

| | Choices |
|---|---|
| **10 layouts** | Ring right, Corner disc, Rising disc, Split panel, Side column, Centre badge, Corner arc, Numbered steps, Big word, Big number |
| **3 colour styles** | Light (warm white), Dark (charcoal), Sky (pale blue). The orange shape is in all three. |
| **10 pictures** | High five, Team of three, Headset, Padlock, Megaphone, Question mark, Trophy, Calendar, Cup, Clock |
| **7 kinds** | Team building, Town hall, Call habit, Privacy, Recognition, Wellbeing, Notice |
| **6 sizes** | A3 and A4 posters, 16:9 screens, 4:5 chat posts, square, 9:16 phone |

The layouts and pictures are drawn and checked by hand, so the design does not depend on how well a chat assistant can draw. Leave out the date, time or place and the poster gets a blank line to write on, never a made-up one.

## Let Copilot write it

Copilot writes the words, picks the layout and gives you the research behind it. The Studio draws the poster.

### 1. Paste this block into Copilot once

Use the copy button at the top right of the box. It works in Microsoft Copilot, Microsoft 365 Copilot, GitHub Copilot chat and other assistants. Copilot answers "Poster Designer is ready."

````text
From now on in this chat you are Poster Designer, the writer and art director for a customer care (call centre) team's posters. You do not draw the poster and you do not write code. A tool called Poster Studio draws the finished poster from a short card that you write. Every message I send after this one is a poster request.

FOR EACH REQUEST, REPLY WITH THREE PARTS

Part 1. RESEARCH, as short plain text (about 120 words), under these headings:
AUDIENCE: who sees it, where, from how far away, and for how long.
WHAT WORKS: three things good posters of this kind do. Design observations only: no statistics, no studies, no sources.
IDEAS: three different ideas, one line each.
CHOSEN: the idea you chose, and why the other two lost.
STILL NEEDED: every fact I did not give you (date, time, place), or "nothing".

Part 2. The POSTER card, in a code block, exactly in this form:
POSTER
kind: one of Team building, Town hall, Call habit, Privacy, Recognition, Wellbeing, Notice
headline: 2 to 6 words of plain speech. Put *stars* round the one word that matters most.
line: one plain sentence of at most 14 words, or leave empty
points: up to three short actions separated by " | ", or leave empty
picture: one of highfive, team, headset, lock, megaphone, question, trophy, calendar, cup, clock
layout: one of ring, disc, sun, word, number
style: one of light, dark, sky
size: one of a3, a4, screen, chat, square, phone
when: the date exactly as I gave it, or leave empty
time: the time exactly as I gave it, or leave empty
where: the place exactly as I gave it, or leave empty

Part 3. A link that opens the finished poster, built from the same card:
https://micolekurt.github.io/poster-designer-agent/studio.html#kind=VALUE&headline=VALUE&line=VALUE&points=VALUE&picture=VALUE&layout=VALUE&style=VALUE&size=VALUE&when=VALUE&time=VALUE&where=VALUE
In the link, write every space as + and leave out any part that is empty. Do not use & or # inside the words.
Then one line: "Open the link, or paste this whole reply into Poster Studio. Press Download everything for the PNG, the PDF and the notes."

HOW TO CHOOSE
layout ring: a thick orange ring at the right with the picture inside it. For people and single objects.
layout disc: a solid orange disc in the corner with the picture on it. For one strong object.
layout sun: half an orange disc rising from the bottom with the picture standing on it. For people and good news.
layout word: no picture; the headline is very large. For a habit or a rule in few words.
layout number: the day of the month, very large, is the picture. Only when I gave a date.
picture: highfive or team for people and events; megaphone or question for meetings; headset for calls; lock for privacy; trophy for recognition; cup or clock for breaks and wellbeing; calendar or clock for schedules.
style: light is warm white, dark is charcoal, sky is pale blue. All three use the same orange shape.
size: a3 is a wall poster (use it when I name no size); a4 a notice board; screen a floor or wall screen; chat a team chat post; square; phone.

RULES YOU MAY NOT BREAK
1. Invent nothing: no dates, times, places, names, numbers, scores or quotes that I did not give you. You write only the headline, the line and the points, and the points are actions, never facts.
2. No member, patient or caller information. No performance numbers. No company logo.
3. Do not draw the poster, make an image, or write HTML. The card and the link are the poster.
4. Never use the same layout, style and headline as the poster before it in this chat.
5. If I say "another" or "different": keep my facts, change the layout, the style, the picture and the headline.
6. If I ask for options (for example "3 options"): give that many cards and links, each with a different layout and style, labelled OPTION 1, OPTION 2, OPTION 3.
7. If I ask for a change: send the card and the link again with that change.

Reply to this message with only: "Poster Designer is ready. What is the poster for?"
````

### 2. Say what you need

```text
Team building. Friday 12 December, 3 pm, 14th floor.
```

```text
3 options
```

```text
Another one, different.
```

### 3. Open the link it gives you

Copilot replies with its research, a short card, and a link. The link opens the Studio with the poster already made. If you are offline, or the link does not work, paste Copilot's whole reply into box **02** of the Studio. A reply with three options shows as Option 1, 2 and 3.

The words after `#` in the link stay on your computer; they are not sent to any server.

### Even shorter, if your Copilot can open links

```text
Follow https://micolekurt.github.io/poster-designer-agent/go.txt
Team building. Friday 12 December, 3 pm, 14th floor.
```

Some work accounts block outside links. If Copilot says it cannot open it, use the block above.

## Good to know

- **Only your facts go on the poster.** Copilot is told to invent no dates, places, names or numbers, and the Studio reminds you to read what it wrote.
- **Every poster is checked** for readable sizes, contrast, margins and stray text before you download it.
- **Never put member, patient or caller information on a poster.**
- **You can change anything.** The form shows what is on the poster. Edit it and press Make again.

## More

<details>
<summary><b>The house look</b></summary>

Everything the agent makes starts from [`profiles/optum-callcenter.json`](skills/poster-design/profiles/optum-callcenter.json).

| Part | Rule |
|---|---|
| Ground | Warm white `#FAF8F2`. At least a third of every sheet stays empty. |
| Type colour | Charcoal `#3D3C38`, never pure black. |
| Orange `#FF612B` | One large shape per sheet: a thick ring or a disc, cropped by the edge so it is never seen whole. |
| Pale sky `#DFF3F9` | A quiet band for the facts needed to act (when, where). |
| Deep teal `#095F87` | Small labels and numbers, where orange would fail contrast. |
| Headlines | A warm bold sans in sentence case, flush left, with at most one word in serif italic. |
| Drawing | Simple charcoal shapes with round ends. No clip art, no emoji, no generated people. |
| Voice | Warm, plain, respectful. A colleague speaking, never a warning. |

Rules that hold whatever the brief says:

- No member, patient or caller information of any kind.
- No performance numbers, rankings or quotes unless they are in the brief.
- The logo is placed from the official file or left off. It is never redrawn.
- Health and benefits claims come from approved copy only.

The typefaces in the examples are open-licence stand-ins (Figtree and Newsreader) for the brand's own faces. If the brand fonts are installed on your machine, the profile tells the agent to use those.

</details>

<details>
<summary><b>How it works: the seven steps, the four looks, what gets measured</b></summary>

### The process\n\n![The seven steps: brief, look, three concepts, build, measure, look again, hand over](docs/process.svg)

| Step | What the agent produces |
|---|---|
| 1. Brief | `brief.json`: audience, the one message, the one action, format, viewing distance, and the exact copy |
| 2. Look | The profile loaded, and notes on real references for the subject |
| 3. Three concepts | A type-led, an image-led and a structure-led thumbnail, side by side; one chosen, with the reason |
| 4. Build | Grid, then type scale, then colour, then image, in `poster.html` |
| 5. Measure | `check.py` at 0 FAIL; every WARN fixed or explained |
| 6. Look again | Squint, thumbnail, greyscale and grid renders, and one more pass |
| 7. Hand over | PNG, PDF, source, brief and a five-line rationale |\n\n### The four looks\n\nEvery render also writes the views a designer checks by eye. Each has one question.

![The privacy poster shown as final, with its grid, blurred, and in greyscale](docs/four-looks.png)

| View | Question |
|---|---|
| Grid and safe margin | Does every edge sit on a column? Is all text inside the margin? |
| Squint | Blurred, is there exactly one thing the eye lands on? |
| Greyscale | Without colour, is the order of importance still obvious? |
| Thumbnail | At postage-stamp size, can you still tell what it is about? |\n\n### What gets measured\n\n| Rule | Limit |
|---|---|
| Typefaces | 2 (3 warns, 4 fails) |
| Text sizes | 3 to 5 clear levels |
| Headline against reading size | 3× at least |
| Smallest text | at least 1.1% of the short side |
| Text inside the safe margin | always, unless marked as deliberate bleed |
| Contrast against the real rendered background | 4.5:1 small text, 3:1 large |
| Hues | 1 or 2 plus neutrals |
| Words | 70 at most |
| Placeholder text, emoji as icons | fail |
| Text that is not in the brief | fail |

Contrast is measured against what is actually behind each piece of text in the render (the ring, a band, a giant letter), not against a declared background colour.

</details>

<details>
<summary><b>For developers: run it as an agent in GitHub Copilot or Claude Code</b></summary>

On Windows, double-click **`setup.bat`**. Anywhere else:

```bash
python poster.py setup
```

```bash
python poster.py test
```

`setup` installs two Python packages and finds a browser to render with. If the machine cannot download Chromium, it uses the Microsoft Edge or Chrome that is already installed. `test` renders and checks the three examples and confirms the checker still rejects the bad one; it ends with "All good".

Then open the folder in VS Code (Copilot Chat, agent mode, choose **Poster Designer**) or in Claude Code, and ask for a poster. The agent files are already in the places each tool looks, so there is no install step.\n\n### From a terminal\n\n```bash
python poster.py new team-day --format a3
```

```bash
python poster.py render posters/team-day/poster.html --format a3 --grid --pdf
```

```bash
python poster.py check posters/team-day/poster.html --format a3 --brief posters/team-day/brief.json
```

All three were made with the files in this repository. Sources and briefs are in [`examples/`](examples).

> **Unofficial.** This project is not affiliated with or endorsed by Optum. The look comes from a profile built by studying the company's public website. It contains no logo, the agent will not redraw one, and the company's own brand guide, templates and logo files take priority over everything here. It is meant for internal team posters, not for anything presented as an official statement.\n\n### Installing the agent for other projects\n\nInside this folder nothing needs installing beyond `python poster.py setup`. To use the agent while working in a different project, copy it to your personal folders:

| Tool | Windows | macOS, Linux, Git Bash |
|---|---|---|
| Claude Code | `powershell -ExecutionPolicy Bypass -File install.ps1` | `bash install.sh` |
| GitHub Copilot | `powershell -ExecutionPolicy Bypass -File install.ps1 -Copilot` | `bash install.sh --copilot` |

For Copilot, also copy `.github/agents/poster-designer.agent.md` into that project's `.github/agents/` folder.

Where each tool finds things in this repository:

| File | Used by |
|---|---|
| `.github/agents/poster-designer.agent.md` | GitHub Copilot: adds **Poster Designer** to the agent list |
| `.github/copilot-instructions.md`, `AGENTS.md` | GitHub Copilot and other agents: the poster rules for this folder |
| `.claude/agents/poster-designer.md` | Claude Code: the same agent |
| `skills/poster-design/` | Both: process, rules, profile, template, scripts |

What to expect in GitHub Copilot:

- **Agent mode is required** for the scripts, because they run in the terminal.
- **Looking at the result depends on the model.** If it cannot open image files, the agent is told to say so and hand you the four images, not to pretend it looked.
- **On a managed work machine,** installing Python packages may need approval. The Studio needs none.

The Copilot agent files follow the VS Code documentation for [custom agents](https://code.visualstudio.com/docs/copilot/customization/custom-agents) and [agent skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills). They have not been run inside Copilot yet. The Studio, the scripts and the rules they call are tested.

</details>

<details>
<summary><b>What is in the repository</b></summary>

```text
studio.html                          Poster Studio: brief, prompt, preview, checks, export. For any Copilot.
copilot/PROMPT.md                    the prompt on its own
poster.py                            one command: setup, test, new, render, check, sheet, build
setup.bat, setup.sh                  setup and self-test in one step
agents/poster-designer.md            the agent, for Claude Code (also in .claude/agents/)
.github/agents/poster-designer.agent.md   the agent, for GitHub Copilot
.github/copilot-instructions.md      poster rules for Copilot in this folder
AGENTS.md                            the same rules for other agents
skills/poster-design/
  SKILL.md                           definition of done, commands, measured rules
  profiles/optum-callcenter.json     the house look: colours, type roles, shapes, tone, hard rules
  references/process.md              the seven steps
  references/craft.md                hierarchy, grid, type, colour, image, lineages
  references/product-lighting.md     making an object look lit and placed, not pasted
  references/anti-slop.md            the habits that make work look generated, and the fixes
  references/formats.md              sizes, viewing distance, print and screen export
  templates/base.html                starting sheet in the house look
  scripts/render.py                  HTML to PNG and PDF, plus the four looks
  scripts/check.py                   the checker
  scripts/sheet.py                   side-by-side sheets
  scripts/browser.py                 finds a browser: Chromium, then Edge, then Chrome
examples/
  lock-it/                           privacy reminder, A3
  town-hall/                         town hall invitation, 4:5
  listen-first/                      call habit, 16:9, plus slop.html as a failing test case
  hands-up/                          team building with drawn people, A3 (made by the agent itself)
posters/                             your own posters, one folder each
docs/                                images used on this page
```

</details>

<details>
<summary><b>Where the rules come from</b></summary>

- **Process:** the studio poster process taught in Gareth David Studio's *Design Process Master Class: Design Posters Like a Pro* (brief, research and mood boards, type, grids, sketching, build, variations, presentation).
- **Lighting and depth:** two Photoshop poster tutorials by Dharnyelpeter (two-tone ground, a chosen light source, clean cut-out edges, contact and cast shadows, objects interleaved with shapes).
- **What good looks like:** side-by-side study of award-level typographic and festival posters against template and marketplace work.
- **The house look:** the public Optum website, read for its colours, type roles, shapes and tone.
- **Hierarchy, grids and restraint:** [Adobe on poster layout](https://www.adobe.com/express/learn/blog/poster-layout-design), [Creative Bloq on visual hierarchy](https://www.creativebloq.com/posters/4-rules-visual-hierarchy-poster-design-91516904), [Design Shack on poster anatomy](https://designshack.net/articles/graphics/anatomy-of-a-poster/), [Vistaprint on poster layout](https://www.vistaprint.com/hub/poster-layout), [Made Good on composition, type and colour](https://madegooddesigns.com/poster-design-guide/).
- **Signs of generated design:** [UX Collective on de-slopifying designs](https://uxdesign.cc/how-to-de-slopify-your-designs-4c40c57c1dc9), [Mika Reyes on spotting AI-made posters](https://mikareyes.com/ai/how-to-spot-ai-made-graphic-design-and-posters).

The copy on the example posters is sample text; the town hall date and room are placeholders. Fonts are loaded from Google Fonts under their open licences. Optum is a trademark of its owner and is named here only to describe the look the profile follows.

</details>

## Licence

MIT. See [LICENSE](LICENSE).
