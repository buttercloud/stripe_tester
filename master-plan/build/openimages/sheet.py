"""sheet.py <cand_dir> <out.png> [--sort moody] : contact sheet ranked by warm/moody score, index labels"""
import sys, os, json, glob
from PIL import Image, ImageDraw, ImageStat
d, out = sys.argv[1], sys.argv[2]
files = sorted(glob.glob(os.path.join(d, "*.jpg")))
rows = []
for f in files:
    try:
        im = Image.open(f); im.draft("RGB", (320, 320)); im = im.convert("RGB")
    except Exception: continue
    st = ImageStat.Stat(im); r, g, b = st.mean; lum = (0.299*r + 0.587*g + 0.114*b) / 255
    warm = (r - b) / 255
    score = -abs(lum - 0.32) * 2 + warm * 1.5       # moody mid-dark, warm
    rows.append((score, f, im, lum))
rows.sort(key=lambda x: -x[0])
json.dump([os.path.basename(f) for _, f, _, _ in rows], open(os.path.join(d, "ranked.json"), "w"))
tw, th, cols = 300, 225, 8
n = min(len(rows), 64); rws = (n + cols - 1) // cols
sheet = Image.new("RGB", (cols*tw, rws*(th+18)), (20, 20, 20)); dr = ImageDraw.Draw(sheet)
for k, (sc, f, im, lum) in enumerate(rows[:n]):
    im.thumbnail((tw, th)); x = (k % cols)*tw; y = (k // cols)*(th+18)
    sheet.paste(im, (x + (tw-im.width)//2, y)); dr.text((x+4, y+th+2), f"{k:02d} {os.path.basename(f)[:8]} L{lum:.2f}", fill=(220, 200, 150))
sheet.save(out); print(out, n, "of", len(rows))
