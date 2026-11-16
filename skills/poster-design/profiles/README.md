# Brand profiles

A profile tells the designer what a brand's sheets have in common, so a poster looks like it belongs without copying an existing one.

## What a profile holds
| Key | Contents |
|---|---|
| `official` | `true` if it was written from the brand's own guide; `false` if built from public observation |
| `source`, `use` | Where the values came from and what the profile is for |
| `colour` | Colours by **role** (ground, ink, accent, tint, link), each with a hex and a job |
| `type` | Display, text and emphasis roles: the brand's face and an open-licence stand-in |
| `shape` | The signature device, control shapes, drawing and photography style |
| `layout` | Margin, grid, how much space, alignment |
| `tone` | Three words and the rules that follow from them |
| `formats` | Where the sheets are shown and which format to render |
| `hard_rules` | Things that may never happen, whatever the brief says |

## Using one
Put its path in the brief (`"profile": "profiles/optum-callcenter.json"`). The designer maps `colour.ground`, `colour.ink` and `colour.accent` onto `--ground`, `--ink` and `--accent`, loads the stand-in fonts unless the brand's own are installed, and treats `hard_rules` as non-negotiable.

## Unofficial profiles
`optum-callcenter.json` was made by looking at the company's public website. It records colours and type roles as observed, and a set of rules suited to internal customer-care posters. It is a starting point for someone who works there:

- The company's own brand guide, templates and logo files take priority over everything in it.
- The logo is not included and must not be redrawn.
- It is for internal team communication, not for anything presented as an official statement.
- Confirm the orange and the typefaces against the brand guide before printing.

## Writing a new profile
Copy the structure, then fill it from the brand's guide. If there is no guide, look at five real pieces from the brand and record only what all five share. Three colours with jobs and two type roles are enough; a profile with twelve colours is not a profile.
