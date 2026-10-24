#!/usr/bin/env python3
"""Source photos for the Al Shami deck.

Order of sources: Pexels API -> Unsplash API -> Openverse (CC0 / CC BY only).
For every slot it shortlists up to 3 candidates (saved under photos/shortlist/),
picks the top-ranked one, crops it to the slot's aspect ratio, saves it as
photos/<slot>.jpg (quality 80) and appends an entry to photos/../credits.md.

Env vars: PEXELS_API_KEY, UNSPLASH_ACCESS_KEY (Openverse needs no key).
Usage:    python3 fetch_photos.py [--only SLOT ...] [--pick SLOT=INDEX ...]
After it runs: node build.js  (the deck picks up photos/<slot>.jpg automatically)
"""
import os, sys, io, json, argparse, urllib.request, urllib.parse
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PHOTOS = os.path.join(ROOT, "photos"); SHORT = os.path.join(PHOTOS, "shortlist")
CREDITS = os.path.join(ROOT, "credits.md")

# slot -> (search queries in priority order, output size w x h)
SLOTS = {
  "01-cover":    (["coffee beans drum roaster roasting", "coffee roasting machine beans", "roasted coffee beans dark"], (1600, 1800)),
  "04-ambition": (["arabic coffee dallah pouring", "dallah brass coffee pot", "turkish coffee pouring cup dark"], (1920, 1080)),
  "05-card-1":   (["coffee takeaway counter cafe", "grab and go cafe counter", "barista handing coffee cup"], (900, 900)),
  "05-card-2":   (["chef plating dish open kitchen", "chef plating fine dining", "chef hands plating"], (900, 900)),
  "05-card-3":   (["resort terrace sunset", "luxury hotel terrace sunset", "desert resort pool sunset"], (900, 900)),
  "05-card-4":   (["hands holding small coffee cup", "arabic coffee cup hands", "espresso cup hands warm"], (900, 900)),
  "06-pillar-1": (["coffee roastery burlap sacks", "coffee beans burlap sack warehouse", "coffee roaster workshop"], (1067, 1500)),
  "07-pillar-2": (["chef plating at the pass", "chef plating restaurant kitchen", "chef garnishing plate"], (1067, 1500)),
  "08-pillar-3": (["resort courtyard lanterns dusk", "moroccan riad courtyard lanterns", "arabic courtyard lanterns night"], (1067, 1500)),
  "09-pillar-4": (["traditional arabic coffee house brass", "old coffee house interior wood brass", "istanbul coffee house interior"], (1067, 1500)),
  "12-close":    (["steam rising coffee cup dark", "coffee cup steam moody", "hot coffee steam black background"], (1920, 1080)),
}

def get(url, headers=None):
    req = urllib.request.Request(url, headers=headers or {"User-Agent": "al-shami-deck/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()

def pexels(q, n=3):
    key = os.environ.get("PEXELS_API_KEY")
    if not key: return []
    d = json.loads(get("https://api.pexels.com/v1/search?" + urllib.parse.urlencode({"query": q, "per_page": n, "orientation": "landscape"}), {"Authorization": key}))
    return [{"source": "Pexels", "id": p["id"], "url": p["url"], "photographer": p["photographer"], "photographer_url": p.get("photographer_url", ""),
             "license": "Pexels License (free for commercial use, no attribution required)", "download": p["src"]["original"]} for p in d.get("photos", [])]

def unsplash(q, n=3):
    key = os.environ.get("UNSPLASH_ACCESS_KEY")
    if not key: return []
    d = json.loads(get("https://api.unsplash.com/search/photos?" + urllib.parse.urlencode({"query": q, "per_page": n, "content_filter": "high"}), {"Authorization": "Client-ID " + key}))
    out = []
    for p in d.get("results", []):
        out.append({"source": "Unsplash", "id": p["id"], "url": p["links"]["html"], "photographer": p["user"]["name"], "photographer_url": p["user"]["links"]["html"],
                    "license": "Unsplash License (free for commercial use)", "download": p["urls"]["full"], "download_location": p["links"]["download_location"]})
    return out

def openverse(q, n=3):
    d = json.loads(get("https://api.openverse.org/v1/images/?" + urllib.parse.urlencode({"q": q, "license": "cc0,by", "page_size": n, "mature": "false", "size": "large"})))
    return [{"source": "Openverse/" + p.get("source", ""), "id": p["id"], "url": p.get("foreign_landing_url") or p["url"], "photographer": p.get("creator") or "Unknown",
             "photographer_url": p.get("creator_url") or "", "license": f"CC {p['license'].upper()} {p.get('license_version','')}".strip(), "download": p["url"]} for p in d.get("results", [])]

def crop_to(img, size):
    w, h = img.size; tw, th = size; r = max(tw / w, th / h)
    img = img.resize((round(w * r), round(h * r)), Image.LANCZOS)
    w, h = img.size; l = (w - tw) // 2; t = (h - th) // 2
    return img.crop((l, t, l + tw, t + th))

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--only", nargs="*"); ap.add_argument("--pick", nargs="*", default=[])
    a = ap.parse_args(); picks = dict(kv.split("=") for kv in a.pick)
    os.makedirs(SHORT, exist_ok=True)
    rows = []
    for slot, (queries, size) in SLOTS.items():
        if a.only and slot not in a.only: continue
        cands = []
        for q in queries:
            for fn in (pexels, unsplash, openverse):
                try: cands += fn(q)
                except Exception as e: print(f"  {fn.__name__} failed for {q!r}: {e}", file=sys.stderr)
                if len(cands) >= 3: break
            if len(cands) >= 3: break
        cands = cands[:3]
        if not cands: print(f"{slot}: no candidates"); continue
        for i, c in enumerate(cands):
            try:
                raw = get(c["download"]); c["_raw"] = raw
                Image.open(io.BytesIO(raw)).convert("RGB").resize((480, 320)).save(os.path.join(SHORT, f"{slot}-{i}.jpg"), quality=70)
            except Exception as e: print(f"  download failed {c['url']}: {e}", file=sys.stderr)
        idx = int(picks.get(slot, 0)); c = cands[idx]
        if "_raw" not in c: print(f"{slot}: pick {idx} failed"); continue
        img = Image.open(io.BytesIO(c["_raw"])).convert("RGB")
        crop_to(img, size).save(os.path.join(PHOTOS, slot + ".jpg"), quality=80, optimize=True)
        if c["source"] == "Unsplash" and c.get("download_location"):
            try: get(c["download_location"], {"Authorization": "Client-ID " + os.environ["UNSPLASH_ACCESS_KEY"]})  # required by Unsplash API terms
            except Exception: pass
        rows.append((slot, c)); print(f"{slot}: {c['source']} {c['url']} by {c['photographer']}")
        alts = [f"{x['source']} {x['url']}" for j, x in enumerate(cands) if j != idx]
        if alts: print("   alternates: " + " | ".join(alts))
    with open(CREDITS, "a") as f:
        for slot, c in rows:
            f.write(f"| {slot} | {c['source']} | {c['photographer']} | {c['url']} | {c['license']} |\n")
    print("credits appended to", CREDITS)

if __name__ == "__main__":
    main()
