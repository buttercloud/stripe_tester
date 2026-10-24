# The Master Plan - Al Shami strategy alignment deck

| File | What it is |
|---|---|
| `master-plan.pptx` | 12 slides, 16:9, fully editable text, speaker notes on every slide |
| `master-plan.pdf` | PDF export of the same deck (LibreOffice) |
| `previews/slide-NN.png` | PNG render of every slide; `previews/contact-sheet.png` is the overview |
| `photos/` | Final cropped photos, named by slot; `photos/shortlist/` has the alternates |
| `credits.md` | Photographer, URL and licence for every photo used |
| `fonts/` | Cormorant Garamond and Rubik (OFL) to install on the presenting machine |
| `build/` | Generator (`build.js`), photo sourcing (`fetch_photos.py`), scrims and plates |

## Photos

All 11 slots are filled with CC BY 2.0 photos from the Open Images Dataset (Flickr).
See `credits.md` for photographer, URL and licence, and `photos/shortlist/` for the
runners-up. The copies are 1024 px max (fine on screen, soft in print); the Flickr
URLs in `credits.md` link to the originals if you want higher resolution.

To swap a photo: replace `photos/<slot>.jpg` (slot names are in `credits.md`) and
rebuild:

```bash
cd master-plan/build
npm install pptxgenjs              # once
node build.js                      # rebuilds master-plan.pptx from photos/ and the copy in build.js
```

`build/fetch_photos.py` is a ready-made Pexels / Unsplash / Openverse sourcing script for
an environment where those APIs are reachable (needs PEXELS_API_KEY / UNSPLASH_ACCESS_KEY).
`build/openimages/` holds the label-based selection scripts used for the current photos.

## Fonts

Headings: Cormorant Garamond. Body: Rubik. Both are referenced by name in the PPTX
(as the theme's heading and body fonts). PowerPoint and Keynote substitute a system
font if they are not installed; install the files in `fonts/` on the presenting
machine for the intended look. PPTX has no "fallback stack", so Georgia / Arial will
only appear via the viewer's own substitution.

## Placeholders to confirm

`[Consultant name]`, `[Month 2026]`, `[email]`, `[phone]` (slides 1 and 12);
`[a century]` (slide 3); `[2-3]` (slide 7); `[first resort]` (slide 8);
`[__ weeks]`, `[__ months]`, `[__ years]` (slide 10).
Founding year 1924 is not stated anywhere in the deck; the close line says
"the next century", which assumes the 1924 heritage is confirmed.
