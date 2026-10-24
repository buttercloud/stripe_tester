"""Generate scrim PNGs (alpha gradients) and placeholder photo plates."""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np, os, math
OUT = "assets"; os.makedirs(OUT, exist_ok=True)
ESP = (0x1F,0x16,0x12); GRN = (0x2E,0x3A,0x2B); COP = (0xC9,0x9A,0x5B)

def smooth(t): return t*t*(3-2*t)

def vgrad(name, color, a_top, a_bot, w=64, h=1080, power=1.0):
    a = np.linspace(0,1,h)**power
    alpha = (a_top + (a_bot-a_top)*a)*255
    img = np.zeros((h,w,4),dtype=np.uint8); img[...,:3]=color
    img[...,3] = np.repeat(alpha[:,None],w,axis=1).astype(np.uint8)
    Image.fromarray(img,"RGBA").save(f"{OUT}/{name}.png")

def hgrad(name, color, a_left, a_right, w=1920, h=64, power=1.0):
    a = np.linspace(0,1,w)**power
    alpha = (a_left + (a_right-a_left)*a)*255
    img = np.zeros((h,w,4),dtype=np.uint8); img[...,:3]=color
    img[...,3] = np.repeat(alpha[None,:],h,axis=0).astype(np.uint8)
    Image.fromarray(img,"RGBA").save(f"{OUT}/{name}.png")

# Scrims
vgrad("scrim_bottom", ESP, 0.0, 0.92, power=1.6)          # fade to dark at bottom
vgrad("scrim_bottom_soft", ESP, 0.0, 0.75, power=1.3)
vgrad("scrim_top", ESP, 0.70, 0.0, power=1.0)              # darker top (titles)
vgrad("scrim_full_dark", ESP, 0.35, 0.90, power=1.4)       # left pillar panels
vgrad("scrim_green", GRN, 0.70, 0.88, power=1.0)           # ambition slide
vgrad("scrim_close", ESP, 0.50, 0.85, power=1.0)
hgrad("scrim_left_fade", ESP, 1.0, 0.0, power=0.9)         # cover: blend photo into dark bg
hgrad("scrim_left_fade_soft", ESP, 0.85, 0.0, power=1.2)

# Placeholder plates: warm, dark, textured; no text baked in.
def plate(name, w, h, seed):
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    cx, cy = w*(0.35+0.3*rng.random()), h*(0.3+0.3*rng.random())
    r = np.sqrt(((xx-cx)/w)**2 + ((yy-cy)/h)**2)
    glow = np.clip(1.0 - r*1.6, 0, 1)**2.2
    base = np.zeros((h,w,3),dtype=np.float32)
    dark = np.array([0x17,0x10,0x0C],dtype=np.float32); warm = np.array([0x6E,0x48,0x2A],dtype=np.float32)
    for c in range(3): base[...,c] = dark[c] + (warm[c]-dark[c])*glow
    noise = rng.normal(0, 7, (h,w,1)).astype(np.float32)
    img = np.clip(base + noise, 0, 255).astype(np.uint8)
    im = Image.fromarray(img,"RGB").filter(ImageFilter.GaussianBlur(0.6))
    # faint concentric arches motif
    d = ImageDraw.Draw(im, "RGBA")
    for i in range(6):
        rad = int(min(w,h)*(0.25+0.14*i))
        d.ellipse([cx-rad, cy-rad*1.15, cx+rad, cy+rad*1.15], outline=(0xC9,0x9A,0x5B,22), width=2)
    im.save(f"{OUT}/{name}.jpg", quality=80)

slots = {"01-cover":(1600,1800),"04-ambition":(1920,1080),"05-card-1":(900,900),"05-card-2":(900,900),
         "05-card-3":(900,900),"05-card-4":(900,900),"06-pillar-1":(1067,1500),"07-pillar-2":(1067,1500),
         "08-pillar-3":(1067,1500),"09-pillar-4":(1067,1500),"12-close":(1920,1080)}
for i,(k,(w,h)) in enumerate(slots.items()): plate("plate_"+k, w, h, 11+i)
print(sorted(os.listdir(OUT)))
