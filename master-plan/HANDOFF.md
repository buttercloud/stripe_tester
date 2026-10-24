# Handoff brief: "The Master Plan" deck for Al Shami

## 1. What this is
A 12-slide, 16:9 strategy-alignment deck a chef and hospitality consultant (based in
Australia, name still a placeholder) will present to Al Shami, a large, long-established
coffee roaster in Damascus, Syria (heritage reportedly 1924, unconfirmed). Al Shami has
launched a grab & go format and begun modernising. The deck's job is to get ALIGNMENT on
vision and four pillars so the next step is a concrete, costed plan. Not a hard sell.
Tone: nation-scale ambition expressed through premium, warm, editorial F&B imagery.

## 2. Where everything is
Repo: github.com/buttercloud/stripe_tester (an unrelated Ruby gem repo; the deck lives
in its own folder). Branch: `al-shami-master-plan`. Folder: `master-plan/`.

| Path | What |
|---|---|
| `master-plan.pptx` | The deck. Fully editable text, speaker notes on all 12 slides, 4 sections |
| `master-plan.pdf` | LibreOffice export of the same |
| `previews/slide-01..12.png`, `previews/contact-sheet.png` | Renders for QA |
| `photos/<slot>.jpg` | 11 cropped photos, one per slot; `photos/shortlist/` has 2 alternates per slot |
| `credits.md` | Photographer, Flickr URL, licence for every photo and alternate |
| `fonts/` | Cormorant Garamond + Rubik static TTFs (OFL) |
| `build/build.js` | The generator (pptxgenjs). ALL slide copy, notes and layout live here |
| `build/apply_theme.js` | Writes theme colours into the pptx after build (bundled from the pptx skill) |
| `build/make_assets.py` | Generates gradient scrim PNGs and placeholder plates into `build/assets/` |
| `build/fetch_photos.py` | Pexels -> Unsplash -> Openverse sourcing script (untested: those hosts were blocked) |
| `build/openimages/` | Scripts used to pick the current photos from the Open Images dataset |
| `README.md` | Short user-facing notes |

## 3. How to rebuild
```bash
cd master-plan/build
npm install pptxgenjs                 # once; sharp not needed
node build.js                         # -> ../master-plan.pptx (reads ../photos/<slot>.jpg; missing slots get a labelled placeholder plate)
# render for QA (install fonts first so LibreOffice uses them):
mkdir -p ~/.fonts && cp ../fonts/*.ttf ~/.fonts && fc-cache -f
soffice --headless --convert-to pdf ../master-plan.pptx --outdir ..   # if bare soffice hangs, use the pptx skill's scripts/office/soffice.py wrapper
rm -f ../previews/*.png && pdftoppm -png -r 110 ../master-plan.pdf ../previews/slide
```
Validate with the pptx skill: `python3 <skill>/scripts/office/validate.py master-plan.pptx`
(passes today). Text dump: `python3 <skill>/scripts/slide_text.py master-plan.pptx`.

## 4. Design system (keep edits consistent)
- Canvas 13.333 x 7.5 in, margins 0.9 in. Eyebrow y=0.85, title y=1.15 (40pt), footer
  "The Master Plan · NN" at y=6.98 (12pt) on slides 2 to 11.
- Colours (theme scheme colours, set in `THEME` in build.js): espresso 1F1612 (dk1),
  cream F6F0E6 (lt1), cardamom green 2E3A2B (dk2), sand EDE3D3 (lt2), copper C99A5B
  (accent1, on dark), dark copper 8A5A2B (accent2, on light), body-on-light 5A4A3F
  (accent3), body-on-dark D9CBB6 (accent4), dark card panel 2A201A (accent5), hairline
  D8CBB8 (accent6). All text/shape colours use `pres.SchemeColor`; only slide
  backgrounds are hex.
- Type: Cormorant Garamond headings (`+mj-lt`), Rubik body (`+mn-lt`). Scale: 80 cover
  / 40 titles / 22 card titles / 15 body / 12 eyebrows + footers (uppercase, charSpacing
  2.5). Workstream labels 11pt bold uppercase. Contrast of every pair is >= 4.5:1
  (lowest: dark copper on sand, 4.62).
- Photos always under a scrim PNG (alpha gradients in `build/assets/`): cover uses a
  left fade + soft bottom; full-bleed statement slides use `scrim_green` (slide 4) or
  `scrim_close` (slide 12); pillar left panels use `scrim_full_dark` + `scrim_left_fade_soft`.
- Rules from the client brief: one idea per slide, no clip art, no emoji, no em dashes in
  copy, never invent facts or numbers, keep [placeholders] in brackets, no text baked
  into images, no visible brand logos in photos.

## 5. Slides (copy is final unless bracketed)
1 Cover (dark, photo right half) · 2 Why we're here (cream, 3 cards) · 3 Where Al Shami
stands today (sand, two columns: build on / fix as hypotheses) · 4 The ambition
(full-bleed, green scrim statement) · 5 Four pillars, one direction (dark, 4 photo cards)
· 6-9 one slide per pillar (left 40% portrait photo with title, ambition, outcome; right
"Workstreams" 6 label+action rows) · 10 How we get there (dark timeline, 4 phases,
phase 1 highlighted) · 11 What we need to agree today (sand, numbered 01-05) · 12 Close
(full-bleed, "Let's build the next century of Al Shami, together.").
Eyebrows I chose where the brief gave none: TODAY (3), THE PLAN (5), THE ROADMAP (10),
DECISIONS (11).

Placeholders still in the deck: [Consultant name], [Month 2026], [email], [phone]
(slides 1, 12); [a century] (3); [2-3] (7); [first resort] (8); [__ weeks], [__ months],
[__ years] (10). 1924 is not stated anywhere; "next century" on slide 12 assumes it.

## 6. Photos: what was done and the caveats
- Pexels, Unsplash, Openverse, Wikimedia and Flickr were all denied by the cloud
  environment's network policy, and no API keys were set. Reachable: github.com /
  raw.githubusercontent.com, registry.npmjs.org, pypi.org, s3.amazonaws.com (incl. the
  public `open-images-dataset` bucket), storage.googleapis.com.
- So photos were sourced from the Open Images Dataset (Flickr photos, all CC BY 2.0,
  with author + landing URL metadata). Pipeline in `build/openimages/`: `pick2.py`
  filters by machine-label confidence per slot (specs in `slots2.json`, `slots3.json`),
  `fetch.sh` downloads candidates from S3, `sheet.py` makes ranked contact sheets,
  `finalize.py` crops the picks (`picks.json`) into `photos/` and writes credit rows.
  Data files needed (not in repo, ~7 GB): oidv7 class descriptions, train/val/test
  human image labels, 2018_04 machine image labels, `image_ids_and_rotation.csv`, all
  from storage.googleapis.com/openimages/. Note: "Roasting" in that vocabulary means
  meat; beans were found via Caffeine-with-no-cup queries.
- CAVEAT 1: Open Images copies are capped at 1024 px on the long side, so crops are
  480 to 1024 px. Fine on screen under scrims, soft in print. The Flickr URLs in
  `credits.md` have the originals (same licence).
- CAVEAT 2: CC BY requires attribution. Keep `credits.md` with the deck or add a credits
  line on slide 12.
- Weakest matches: 09-pillar-4 (antique parlour, not a coffee house) and 04-ambition
  (copper Turkish cup, not a dallah pour). Alternates in `photos/shortlist/`.
- To upgrade with proper stock: allow api.pexels.com, images.pexels.com,
  api.unsplash.com, images.unsplash.com, api.openverse.org in the environment's
  Network access, set PEXELS_API_KEY / UNSPLASH_ACCESS_KEY, run
  `python3 build/fetch_photos.py` (3 per slot shortlisted, picks #0, crops, appends
  credits), then `node build.js`. Slot briefs and sizes are in `SLOTS` in build.js and
  in `credits.md`.

## 7. Gotchas learned the hard way
- pptxgenjs is NOT preinstalled in this environment despite the skill saying so; `npm
  install pptxgenjs` works (npm registry is reachable).
- Google Fonts only ships variable TTFs for these families; LibreOffice renders the
  variable font as its lightest instance. `fonts/` contains static instances made with
  `fontTools.varLib.instancer` (`pip install fonttools`). Install them before rendering.
- pptxgenjs: hex colours without `#`; `charSpacing` not `letterSpacing`; `isTextBox:
  true` + `margin: 0` on every text box; `sizing: {type: "cover"}` to crop images;
  gradients only via PNG overlays; run validate.py after every build.
- A PPTX cannot carry font fallbacks (Georgia/Arial only appear via the viewer's own
  substitution). Fonts are not embedded.
- The repo's default branch is `master`; work stays on `al-shami-master-plan`. No PR
  has been opened. A stop hook in this environment asks for untracked files to be
  committed and pushed.

## 8. Open questions for the client (keep as placeholders until answered)
- Founding year 1924? Does "the next century" line work?
- Arabic or bilingual version needed? (Rubik has Arabic glyphs; Cormorant does not,
  so an Arabic heading face would be needed.)
- Consultant name, contact details, logo.
- Al Shami's own photos or logo available? They would replace the Flickr photos.

## 9. Likely next steps (pick what's needed)
1. Replace photos with higher-resolution, editorial stock once the APIs are allowed (or
   with Al Shami's own photos), keeping credits.md current.
2. Fill the placeholders when the client answers.
3. Optional: Arabic/bilingual variant; a credits line on slide 12; embed or ship fonts.
4. Re-run visual QA after any change: render, check overflow/overlap/contrast, footer
   numbering, consistent title position.
