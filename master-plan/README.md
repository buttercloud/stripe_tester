# The Master Plan - Al Shami strategy alignment deck

| File | What it is |
|---|---|
| `master-plan.pptx` | 12 slides, 16:9, fully editable text, speaker notes on every slide |
| `master-plan.pdf` | PDF export of the same deck (LibreOffice) |
| `previews/slide-NN.png` | PNG render of every slide; `previews/contact-sheet.png` is the overview |
| `photos/` | Final photos go here, named by slot (see `credits.md`) |
| `credits.md` | Photographer, URL and licence for every photo used |
| `fonts/` | Cormorant Garamond and Rubik (OFL) to install on the presenting machine |
| `build/` | Generator (`build.js`), photo sourcing (`fetch_photos.py`), scrims and plates |

## Filling the photo slots

The build environment could not reach any photo API, so all 11 photo slots are
placeholder plates with a small copper label naming the brief. To replace them:

```bash
cd master-plan/build
export PEXELS_API_KEY=...          # optional
export UNSPLASH_ACCESS_KEY=...     # optional (Openverse needs no key)
python3 fetch_photos.py            # shortlists 3 per slot into photos/shortlist/, picks #0,
                                   # crops to the slot, writes photos/<slot>.jpg and credits.md rows
python3 fetch_photos.py --only 01-cover --pick 01-cover=2   # re-pick one slot from its shortlist
npm install pptxgenjs              # once
node build.js                      # rebuilds the deck with real photos
```

Or drop your own JPGs into `photos/` with the slot names and rebuild. The label
disappears automatically when a slot has a real photo.

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
