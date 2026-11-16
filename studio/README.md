# Poster Studio source

`studio.html` at the top of the repository is one self-contained file. It is built from the files here:

| File | What it is |
|---|---|
| `src.html` | The Studio itself. Edit this, never `studio.html`. |
| `fonts/figtree-latin.woff2` | Figtree, variable weight, Latin. SIL Open Font License 1.1. |
| `fonts/newsreader-italic-latin.woff2` | Newsreader Italic, Latin. SIL Open Font License 1.1. |
| `vendor/html-to-image.js` | html-to-image 1.11.11, MIT. Turns the previewed poster into a PNG. |
| `vendor/jspdf.umd.min.js` | jsPDF 2.5.1, MIT. Puts the PNG on a page of the exact paper size. |
| `vendor/jszip.min.js` | JSZip 3.10.1, MIT. Packs the downloads into one file. |

Rebuild after any change:

```bash
python poster.py studio
```

`python poster.py test` fails if `studio.html` is out of date.
