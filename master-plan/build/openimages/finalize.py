"""finalize.py: crop chosen Open Images candidates into master-plan/photos and write credits rows.
picks.json: {slot: {"dir": cand_dir, "id": prefix, "anchor": "center|top|bottom|left|right", "alts": [[dir,prefix],...]}}"""
import json, glob, os, sys
from PIL import Image
PICKS = json.load(open(sys.argv[1])); OUT = sys.argv[2]; os.makedirs(os.path.join(OUT, "shortlist"), exist_ok=True)
SIZES = {"01-cover":(8,9),"04-ambition":(16,9),"05-card-1":(1,1),"05-card-2":(1,1),"05-card-3":(1,1),"05-card-4":(1,1),
         "06-pillar-1":(32,45),"07-pillar-2":(32,45),"08-pillar-3":(32,45),"09-pillar-4":(32,45),"12-close":(16,9)}
def find(d, pre):
    f = glob.glob(f"{d}/{pre}*.jpg"); assert len(f) == 1, (d, pre, f); return f[0]
def crop(im, ar, anchor):
    w, h = im.size; tw, th = ar; 
    if w / h > tw / th: nw, nh = int(h * tw / th), h
    else: nw, nh = w, int(w * th / tw)
    l = (w - nw) // 2; t = (h - nh) // 2
    if anchor == "top": t = 0
    if anchor == "bottom": t = h - nh
    if anchor == "left": l = 0
    if anchor == "right": l = w - nw
    return im.crop((l, t, l + nw, t + nh))
rows = []
for slot, p in PICKS.items():
    f = find(p["dir"], p["id"]); meta = json.load(open(os.path.join(p["dir"], "meta.json")))
    full = os.path.basename(f)[:-4]; m = meta[full]
    im = Image.open(f).convert("RGB"); c = crop(im, SIZES[slot], p.get("anchor", "center"))
    c.save(os.path.join(OUT, slot + ".jpg"), quality=80, optimize=True)
    alts = []
    for j, (d, pre) in enumerate(p.get("alts", [])):
        af = find(d, pre); am = json.load(open(os.path.join(d, "meta.json")))[os.path.basename(af)[:-4]]
        ai = Image.open(af).convert("RGB"); ai.thumbnail((640, 640)); ai.save(os.path.join(OUT, "shortlist", f"{slot}-alt{j+1}.jpg"), quality=75)
        alts.append((os.path.basename(af)[:-4], am))
    rows.append((slot, full, m, c.size, alts))
    print(f"{slot}: {full} {im.size}->{c.size} by {m['author']}  alts={len(alts)}")
with open(os.path.join(OUT, "credits_rows.md"), "w") as fh:
    for slot, full, m, size, alts in rows:
        fh.write(f"| {slot} | Open Images (Flickr) | {m['author'].replace('&amp;','&')} | {m['landing']} | CC BY 2.0 | {size[0]}x{size[1]} |\n")
    fh.write("\n## Shortlist alternates\n\n| Slot | Alternate | Photographer | URL |\n|---|---|---|---|\n")
    for slot, full, m, size, alts in rows:
        for j, (aid, am) in enumerate(alts):
            fh.write(f"| {slot} | shortlist/{slot}-alt{j+1}.jpg | {am['author'].replace('&amp;','&')} | {am['landing']} |\n")
print("ok")
