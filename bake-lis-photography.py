#!/usr/bin/env python3
"""Bake every photograph on the Li's site from its Pexels source.

Reproduce, end to end, from the project root:

    SRC=/tmp/lis-src && mkdir -p $SRC
    node fetch-pexels.mjs $SRC 5779787 32513359 8856505 8093845 27588092 \
        15050710 8093353 10201775 5616129 38391497 10201749 27791191 \
        5848595 38175310 11923047 30116650 35696919 38141840 5409009 \
        28503589 38778417 36984972 12356601 15590364
    for f in $SRC/raw-*.bin; do id=${f#*raw-}; id=${id%.bin}; \
        sips -s format jpeg "$f" --out "$SRC/cand-$id.jpg"; done
    python3 bake-lis-photography.py $SRC /tmp/lis-out
    # then bake-png-to-jpeg.mjs over every PNG; see bake-lis-photography.sh

The sips step is not optional: Pexels honours Chrome's Accept header, so what
fetch-pexels.mjs lands is AVIF whatever the .jpeg in the URL says.

EVERY FRAME HERE IS A PLACEHOLDER and is flagged as one in the markup. Li's own
photography is not available at usable resolution or licence; these are stock
frames chosen to match dishes that are actually on Li's menu. Whatever replaces
them needs the property named in each entry's comment and nothing else.

BANDS. The target mean luminance per frame is NOT a taste decision made after
grading — it is chosen against the band the section already sits in, measured
off the site as it stood on 2026-08-26:

    hero            44        dark room, type over it
    wok counter     57        the pill frame on index
    reserve         64        set table behind the gourd clip
    about opening   71
    about plate     37        full bleed, nothing on it, allowed to be black
    chapters      62-84       lit subject in a dark room
    experience   90-108       lit rooms and white plates
    ichie         64-80
    contact hero    60        no baked vignette; see below
    gallery tiles  ~112       a marquee on a light ground, must stay appetising

Two frames break the usual rule and both are deliberate:

  - `lis-hero` aims 52 rather than the 44 the frame it replaces measured. This
    one has an open flame in it. Solving the whole-frame mean to 44 with a
    2000-luma flame in shot spends the entire budget on the flame and crushes
    the room to black, which is where the wordmark sits. The type region is
    reported separately below for exactly this reason.

  - `contact-hero` bakes NO vignette, unchanged from the frame it replaces and
    for the same reason: its only light source is the pendant lamp, and a baked
    vignette puts the lamp out. Its wash is CSS.
"""
import os, sys
from PIL import Image, ImageEnhance, ImageFilter

SRC = sys.argv[1] if len(sys.argv) > 1 else '/tmp/lis-src'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/lis-out'
os.makedirs(OUT, exist_ok=True)

#   id     source photo
#   stem   output name
#   w,h    delivered size; the crop is taken at that aspect from the source
#   ax,ay  crop anchor, 0..1 across the slack (0.5 = centred)
#   lift   black point raised to this floor
#   gain   contrast about mid grey
#   sat    saturation multiplier
#   warm   per-channel multiplier (R,G,B)
#   vig    vignette strength at the corners, 0 = none
#   aim    target mean luminance; a gamma is solved to hit it
F = [
 # ---- index -----------------------------------------------------------------
 dict(id='5779787', stem='lis-hero', w=1717, h=1073, ax=.5, ay=1.0,
      lift=3, gain=1.10, sat=0.92, warm=(1.03,1.00,0.965), vig=0.30, aim=52),
 #   WIDENED 2026-08-27, from 1717x916 (1.874:1) to 1717x1073 (1.60:1), because
 #   the hero read as too tightly cropped. The zoom was compounding in two
 #   places: this bake was throwing away 20% of the source HEIGHT to make a
 #   letterbox, and CSS `cover` then threw away another ~17% of the WIDTH on a
 #   1.6:1 desktop box. Between them a reader saw ~78% of the photograph.
 #   1.60:1 is chosen, not the source's native 1.50:1, for two reasons: it
 #   matches a 1440x900 viewport exactly so `cover` crops NOTHING there, and
 #   the full frame clips the chef's forehead, which reads as a mistake.
 #   ay=1.0 rather than .46 — the slack is taken entirely off the TOP, which
 #   is where that head crop is. The dark shoulder on the left is kept, and it
 #   is what the wordmark sits on.
 #   needs: a lit act of cooking OFF centre, with the lower left kept calm.
 dict(id='32513359', stem='wok-counter', w=1536, h=710, ax=.5, ay=.52,
      lift=2, gain=1.12, sat=0.90, warm=(1.02,1.00,0.975), vig=0.26, aim=57),
 #   needs: a LAID TABLE, and preferably a round one. The frame before this
 #   was a warm restaurant interior that read izakaya rather than Chinese —
 #   wooden shelving, red lacquer cups, two pendants — which is the whole
 #   thing this rebrand is removing. This one is a round table with a lazy
 #   susan on it, which says the same thing the section's heading does.
 dict(id='8856505', stem='reserve-interior', w=1400, h=1576, ax=.5, ay=.5,
      lift=2, gain=1.10, sat=0.92, warm=(1.03,1.00,0.965), vig=0.32, aim=64),
 # ---- about -----------------------------------------------------------------
 dict(id='8093845', stem='about-opening', w=2400, h=1800, ax=.5, ay=.5,
      lift=0, gain=1.14, sat=0.92, warm=(1.03,1.00,0.965), vig=0.26, aim=71),
 dict(id='27588092', stem='about-plate', w=1536, h=1024, ax=.5, ay=.5,
      lift=0, gain=1.16, sat=0.96, warm=(1.02,1.00,0.98), vig=0.34, aim=37),
 dict(id='15050710', stem='about-ch1-wok', w=1100, h=1466, ax=.5, ay=.5,
      lift=2, gain=1.14, sat=0.94, warm=(1.03,1.00,0.97), vig=0.30, aim=66),
 dict(id='8093353',  stem='about-ch2-hand', w=1100, h=1466, ax=.5, ay=.42,
      lift=0, gain=1.16, sat=0.88, warm=(1.03,1.00,0.97), vig=0.26, aim=62),
 dict(id='10201775', stem='about-ch3-coast', w=1100, h=1466, ax=.5, ay=.5,
      lift=2, gain=1.10, sat=0.94, warm=(1.01,1.00,0.98), vig=0.26, aim=84),
 dict(id='5616129', stem='about-ch4-table', w=1100, h=1466, ax=.5, ay=.5,
      lift=2, gain=1.12, sat=0.94, warm=(1.03,1.00,0.97), vig=0.26, aim=68),
 dict(id='38391497', stem='about-ex1-fire', w=1100, h=1467, ax=.5, ay=.5,
      lift=2, gain=1.06, sat=0.94, warm=(1.02,1.00,0.98), vig=0.22, aim=90),
 dict(id='10201749', stem='about-ex2-dimsum', w=1100, h=1467, ax=.5, ay=.5,
      lift=4, gain=1.08, sat=0.88, warm=(1.02,1.00,0.98), vig=0.20, aim=100),
 dict(id='27791191', stem='about-ex3-room', w=1100, h=1467, ax=.5, ay=.5,
      lift=2, gain=1.10, sat=0.90, warm=(1.03,1.00,0.97), vig=0.22, aim=100),
 #   aims 96, not the 64-80 the band would suggest. This is a bright studio
 #   overhead on a pale ground; solving it to 80 pins the gamma at its 3.2
 #   ceiling and still misses, and what it does reach is crushed and edge-lit
 #   (corner 103 against centre 44 — the vignette inverted). The band describes
 #   lit subjects in dark rooms and this frame is not one.
 dict(id='5848595',  stem='about-ic1-duck', w=1100, h=1466, ax=.5, ay=.5,
      lift=0, gain=1.18, sat=0.94, warm=(1.02,1.00,0.975), vig=0.34, aim=96),
 #   the only landscape frame on the site, and that is what stops the pair
 #   reading as a pair rather than as two depth planes.
 dict(id='38175310', stem='about-ic2-table', w=1200, h=900, ax=.5, ay=.5,
      lift=0, gain=1.14, sat=0.90, warm=(1.02,1.00,0.975), vig=0.30, aim=64),
 # ---- menu.html's opening frames --------------------------------------------
 # DEDICATED FILES, not the marquee tiles. Three of the four frames reused a
 # gallery tile at first, which is what the design they replace did — but the
 # tiles are 560px tall, built for a marquee, and the frames paint into a 3:4
 # portrait slot. Measured upscale on a 390x844 phone at dpr3: dish4 x3.11,
 # dish2 x3.05. That is a soft photograph in the first composition on the
 # page. At 900x1200 the same frames paint at x0.7 and under.
 dict(id='30116650', stem='menu-duck', w=900, h=1200, ax=.5, ay=.5,
      lift=4, gain=1.06, sat=0.96, warm=(1.02,1.00,0.98), vig=0.18, aim=100),
 dict(id='38141840', stem='menu-dimsum', w=900, h=1200, ax=.5, ay=.5,
      lift=4, gain=1.08, sat=0.94, warm=(1.02,1.00,0.98), vig=0.18, aim=100),
 #   desaturated a touch: at full strength this frame's orange is the loudest
 #   thing on an ivory page and it pulls the eye off the type.
 dict(id='35696919', stem='menu-seafood', w=900, h=1200, ax=.5, ay=.5,
      lift=4, gain=1.06, sat=0.90, warm=(1.01,1.00,0.99), vig=0.18, aim=100),
 # ---- contact ---------------------------------------------------------------
 #   DESATURATE BEFORE WARMING. This room's brick and banquettes carry a flat
 #   green-teal cast across most of the frame; pushing warmth at full
 #   saturation leaves the green and turns the lamps orange. Saturation comes
 #   most of the way out first so the field goes neutral, then the warmth is
 #   pushed hard and the two pendants are left to carry the colour.
 dict(id='11923047', stem='contact-hero', w=2000, h=1333, ax=.5, ay=.46,
      lift=2, gain=1.12, sat=0.42, warm=(1.10,1.00,0.90), vig=0.00, aim=60),
 # ---- the marquee ------------------------------------------------------------
 # Widths are the nine the row already had. Keeping them means .beyond__track
 # keeps its measured width and the marquee's percentage translate is untouched.
 dict(id='30116650', stem='gallery/dish1-duck',      w=856, h=560, ax=.5, ay=.5,
      lift=4, gain=1.06, sat=1.00, warm=(1.02,1.00,0.98), vig=0.10, aim=112),
 dict(id='35696919', stem='gallery/dish2-prawns',    w=671, h=560, ax=.5, ay=.5,
      lift=4, gain=1.04, sat=1.02, warm=(1.01,1.00,0.99), vig=0.10, aim=112),
 dict(id='38141840', stem='gallery/dish3-bao',       w=510, h=560, ax=.5, ay=.5,
      lift=4, gain=1.06, sat=0.98, warm=(1.02,1.00,0.98), vig=0.10, aim=112),
 dict(id='5409009',  stem='gallery/dish4-dimsum',    w=445, h=560, ax=.5, ay=.5,
      lift=4, gain=1.06, sat=1.00, warm=(1.02,1.00,0.98), vig=0.10, aim=112),
 dict(id='28503589', stem='gallery/dish5-rice',      w=563, h=560, ax=.5, ay=.5,
      lift=4, gain=1.04, sat=1.00, warm=(1.02,1.00,0.98), vig=0.10, aim=112),
 dict(id='38778417', stem='gallery/dish6-noodles',   w=564, h=560, ax=.5, ay=.5,
      lift=4, gain=1.04, sat=0.98, warm=(1.02,1.00,0.98), vig=0.10, aim=112),
 dict(id='36984972', stem='gallery/dish7-sizzling',  w=637, h=560, ax=.5, ay=.5,
      lift=4, gain=1.04, sat=0.98, warm=(1.01,1.00,0.99), vig=0.10, aim=112),
 dict(id='12356601', stem='gallery/dish8-springroll',w=450, h=560, ax=.5, ay=.5,
      lift=4, gain=1.04, sat=0.98, warm=(1.02,1.00,0.98), vig=0.10, aim=112),
 dict(id='15590364', stem='gallery/dish9-duckslice', w=306, h=560, ax=.5, ay=.5,
      lift=4, gain=1.06, sat=1.00, warm=(1.02,1.00,0.98), vig=0.10, aim=112),
]


def vignette(im, strength):
    """Radial darkening as an L-mask, multiplied in. Elliptical, so the falloff
    reaches the short and long edges at the same rate whatever the aspect."""
    if strength <= 0:
        return im
    w, h = im.size
    mask = Image.new('L', (w, h), 0)
    px = mask.load()
    cx, cy = w / 2.0, h / 2.0
    for y in range(h):
        dy = (y - cy) / cy
        for x in range(w):
            dx = (x - cx) / cx
            r = (dx * dx + dy * dy) ** 0.5 / (2 ** 0.5)
            t = max(0.0, (r - 0.45) / 0.55) ** 1.6
            px[x, y] = int(255 * (1.0 - strength * min(1.0, t)))
    mask = mask.filter(ImageFilter.GaussianBlur(max(4, w / 40)))
    return Image.composite(im, Image.new('RGB', (w, h), (0, 0, 0)), mask)


def mean_luma(im):
    h = im.convert('L').histogram()
    return sum(i * n for i, n in enumerate(h)) / sum(h)


def gamma(im, g):
    return im.point([min(255, int(round(255.0 * (v / 255.0) ** g))) for v in range(256)] * 3)


def solve_gamma(im, aim):
    """Bisect for the gamma landing this frame's mean on `aim`. Gamma rather
    than a linear gain because a gain clips, and these frames have their room
    in the shadows, not the highlights."""
    lo, hi = 0.25, 3.2
    for _ in range(40):
        mid = (lo + hi) / 2
        if mean_luma(gamma(im, mid)) > aim:      # larger gamma darkens
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


# Re-baking one frame does not require the other 26 sources on disk.
ONLY = set(sys.argv[3:])
if ONLY:
    F = [f for f in F if f['stem'] in ONLY]
    print(f"filtered to {len(F)} frame(s): {', '.join(f['stem'] for f in F)}")

print(f"{'src':>9}  {'stem':<28}{'size':>11}  luma          gamma  corner/centre")
for f in F:
    src = Image.open(os.path.join(SRC, f"cand-{f['id']}.jpg")).convert('RGB')
    W, H = src.size
    ar = f['w'] / f['h']

    if W / H > ar:                      # source too wide: take a full-height slice
        cw = int(round(H * ar)); ch = H
    else:                               # source too tall: take a full-width slice
        cw = W; ch = int(round(W / ar))
    x0 = int(round((W - cw) * f['ax'])); y0 = int(round((H - ch) * f['ay']))
    im = src.crop((x0, y0, x0 + cw, y0 + ch))
    before = mean_luma(im)

    # Black point first: raising the floor after contrast greys the whole
    # frame, raising it before leaves the highlights where they were.
    lo = f['lift']
    im = im.point([min(255, int(lo + (255 - lo) * (v / 255.0))) for v in range(256)] * 3)
    im = ImageEnhance.Contrast(im).enhance(f['gain'])
    im = ImageEnhance.Color(im).enhance(f['sat'])
    r, g, b = f['warm']
    im = im.point([min(255, int(v * r)) for v in range(256)] +
                  [min(255, int(v * g)) for v in range(256)] +
                  [min(255, int(v * b)) for v in range(256)])
    im = vignette(im, f['vig'])

    # Exposure last, and after the vignette: the vignette removes light, and
    # solving ahead of it lands every frame on the same mean and then takes a
    # different amount back out of each.
    gm = solve_gamma(im, f['aim'])
    im = gamma(im, gm)
    im = im.resize((f['w'], f['h']), Image.LANCZOS)

    os.makedirs(os.path.dirname(os.path.join(OUT, f['stem'] + '.png')), exist_ok=True)
    im.save(os.path.join(OUT, f['stem'] + '.png'))

    bw = max(8, int(f['w'] * .10)); bh = max(8, int(f['h'] * .10))
    corner = mean_luma(im.crop((0, 0, bw, bh)))
    centre = mean_luma(im.crop((f['w']//2 - bw, f['h']//2 - bh, f['w']//2 + bw, f['h']//2 + bh)))
    print(f"{f['id']:>9}  {f['stem']:<28}{f['w']:5d}x{f['h']:<5d} "
          f"{before:5.1f} -> {mean_luma(im):5.1f} (aim {f['aim']:3d})  {gm:4.2f}   "
          f"{corner:5.1f}/{centre:5.1f}")

# The hero carries type. Report the band the wordmark actually sits in, because
# the whole-frame mean is not what a reader is judging contrast against.
if any(f['stem']=='lis-hero' for f in F):
 hero = Image.open(os.path.join(OUT, 'lis-hero.png'))
 w, h = hero.size
 band = hero.crop((int(w * .06), int(h * .62), int(w * .52), int(h * .94)))
 print(f"\nlis-hero wordmark band (x 6-52%, y 62-94%): mean {mean_luma(band):.1f}")
