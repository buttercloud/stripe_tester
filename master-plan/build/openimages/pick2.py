"""Shortlist Open Images candidates per slot using machine labels (confidence) + human negatives.
usage: python3 -I pick2.py <oi_dir> <out_dir> --machine f.csv... --human f.csv... --meta f.csv... [--n 160] [--slots ...]
slots2.json: {slot: {"groups": [[cls,...],...], "thr": 0.6, "excl": [cls,...], "excl_thr": 0.5}}
"""
import csv, os, json, random, collections, argparse
ap = argparse.ArgumentParser(); ap.add_argument("oi"); ap.add_argument("out")
ap.add_argument("--machine", nargs="+", required=True); ap.add_argument("--human", nargs="*", default=[]); ap.add_argument("--meta", nargs="+", required=True)
ap.add_argument("--n", type=int, default=160); ap.add_argument("--slots", nargs="*"); ap.add_argument("--spec", default="slots2.json")
a = ap.parse_args()
SLOTS = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), a.spec)))
if a.slots: SLOTS = {k: v for k, v in SLOTS.items() if k in a.slots}
allcls = set(c for s in SLOTS.values() for g in s["groups"] for c in g) | set(c for s in SLOTS.values() for c in s.get("excl", []))
conf = collections.defaultdict(dict)   # image -> {cls: conf}
for fn in a.machine:
    with open(os.path.join(a.oi, fn)) as f:
        r = csv.reader(f); next(r)
        for row in r:
            if row[2] in allcls: conf[row[0]][row[2]] = float(row[3])
for fn in a.human:   # human verdicts override machine
    with open(os.path.join(a.oi, fn)) as f:
        r = csv.reader(f); next(r)
        for row in r:
            if row[2] in allcls: conf[row[0]][row[2]] = float(row[3])
print("images with any wanted class:", len(conf))
cands = {}
for slot, spec in SLOTS.items():
    thr = spec.get("thr", 0.6); ethr = spec.get("excl_thr", 0.5); excl = spec.get("excl", [])
    ids = []
    for i, cs in conf.items():
        if all(any(cs.get(c, 0) >= thr for c in g) for g in spec["groups"]) and not any(cs.get(c, 0) >= ethr for c in excl):
            ids.append(i)
    cands[slot] = ids; print(slot, len(ids))
need = set(i for v in cands.values() for i in v)
meta = {}
for fn in a.meta:
    with open(os.path.join(a.oi, fn)) as f:
        r = csv.reader(f); next(r)
        for row in r:
            if row[0] in need: meta[row[0]] = {"subset": row[1], "url": row[2], "landing": row[3], "license": row[4], "author_url": row[5], "author": row[6], "title": row[7], "size": int(row[8] or 0)}
os.makedirs(a.out, exist_ok=True); random.seed(11)
for slot, ids in cands.items():
    ids = [i for i in ids if i in meta and meta[i]["license"] == "https://creativecommons.org/licenses/by/2.0/"]
    # score: sum of confidences over groups, bias to larger originals
    def sc(i):
        cs = conf[i]; return sum(max(cs.get(c, 0) for c in g) for g in SLOTS[slot]["groups"]) + min(meta[i]["size"], 3_000_000) / 3_000_000 * 0.5
    ids.sort(key=lambda i: -sc(i)); ids = ids[: a.n * 2]; random.shuffle(ids); ids = ids[: a.n]
    d = os.path.join(a.out, slot); os.makedirs(d, exist_ok=True)
    json.dump({i: meta[i] for i in ids}, open(os.path.join(d, "meta.json"), "w"), indent=1)
    with open(os.path.join(d, "urls.txt"), "w") as f:
        for i in ids: f.write(f"https://open-images-dataset.s3.amazonaws.com/{meta[i]['subset']}/{i}.jpg\n")
    print(f"{slot}: {len(ids)} candidates -> {d}")
