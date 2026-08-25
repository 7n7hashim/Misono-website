#!/usr/bin/env python3
"""Bake the two location photographs for contact.html.

Reproduce, end to end, from the project root:

    SRC=/tmp/misono-locations && mkdir -p $SRC
    node fetch-pexels.mjs $SRC 13418220 9833516
    for f in $SRC/raw-*.bin; do id=${f#*raw-}; id=${id%.bin}; \
        sips -s format jpeg "$f" --out "$SRC/cand-$id.jpg"; done
    python3 bake-contact-locations.py $SRC $SRC
    node bake-png-to-jpeg.mjs $SRC/locale-mombasa.png assets/img/locale-mombasa.jpg 0.84
    node bake-png-to-jpeg.mjs $SRC/locale-nairobi.png  assets/img/locale-nairobi.jpg  0.84

The sips step is not optional: Pexels honours Chrome's Accept header, so what
fetch-pexels.mjs lands is AVIF whatever the .jpeg in the URL says.

Sources, both delivered at 1800 tall and cropped here to 16:9:

    13418220  Mombasa waterfront — apartments on a green bluff above the water.
    9833516   Nairobi — Uhuru Park and the skyline behind it.

BOTH ARE PLACEHOLDERS and are flagged as such in the markup. Neither is a
photograph of Misono's actual surroundings: 13418220 is the Mombasa waterfront
rather than Links Road, and 9833516 is Uhuru Park and the CBD, roughly 5km from
Adams Arcade. A location section implies the picture is the place. Replace both
with real frames before launch.


A FOURTH GRADING BAND: 108-118
------------------------------
CLAUDE.md requires the band be chosen before grading rather than after. The
three existing bands are 62-84 (chapters), 90-108 (experience) and 64-80
(ichie), and these two belong to none of them.

The rule that decides a band is what is LIT, not how wide the lens is. Every
existing band on this site grades a lit subject, or a lit room, inside a dark
building. These are open-air daylight frames of a whole district. Forced down to
the experience section's 90 a daylight aerial does not read as moody, it reads
as overcast and drained — which is the opposite of what the section is for, and
would also put the near-white marker cards on a ground too dark to sit on
without a scrim nobody asked for.


DESATURATE, THEN WARM — in that order
-------------------------------------
CLAUDE.md records this for the experience section's green-grey plaster wall, and
these two frames are the same problem twice over: each is roughly half sky or
water, which is one large flat COOL field. Pushed warm at full saturation the
sky stays stubbornly cyan and the vegetation turns yellow-red — the warmth lands
everywhere except the thing that needed it.

So SAT comes most of the way out first (0.62 / 0.66), which neutralises the blue
into a pale grey, and only then does WARM push. What is left carrying colour is
the vegetation and the built structure, which is what should carry these frames
anyway.


THE VIGNETTE IS LOAD-BEARING HERE, unlike on the contact hero
------------------------------------------------------------
That frame's only lamp sits in a corner, so a baked vignette put the light out
and none was baked. These are lit corner to corner, and the vignette does a job
no other bake on this site asks of it: the two marker cards are near-white and
they sit in the TOP-RIGHT and BOTTOM-LEFT quarters. A daylight sky at 150+
behind a 250 card leaves a 1.4:1 edge and the card dissolves.

So the corners are pulled down deliberately, and the script reports the two card
zones separately from the whole-frame mean. Those two numbers are the ones to
read; the mean only says the frame is in its band.
"""
import sys, os
from PIL import Image, ImageEnhance

SRC, OUT = sys.argv[1], sys.argv[2]

# id, stem, expected size, contrast, saturation, warm, vignette, aim
FRAMES = [
    dict(id='13418220', stem='locale-mombasa', expect=(2657, 1800),
         gain=1.10, sat=0.62, warm=0.055, vig=0.30, aim=112),
    dict(id='9833516',  stem='locale-nairobi', expect=(2700, 1800),
         gain=1.12, sat=0.66, warm=0.050, vig=0.38, aim=114),
]

OUT_W = 2000        # renders at ~1233px at 1440, so 2000 covers a 1.6x display
                    # without carrying a third megabyte per frame.
ASPECT = 16 / 9


def mean_luma(im):
    h = im.convert('L').histogram()
    return sum(i * n for i, n in enumerate(h)) / sum(h)


def gamma(im, g):
    lut = [min(255, int(round(255.0 * (v / 255.0) ** g))) for v in range(256)]
    return im.point(lut * 3)


def solve_gamma(im, aim):
    lo, hi = 0.30, 3.0
    for _ in range(40):
        mid = (lo + hi) / 2
        if mean_luma(gamma(im, mid)) > aim:      # larger gamma darkens
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


def crop_169(im):
    """Centre crop to 16:9. Centred on purpose for both frames — checked on a
    contact sheet rendered at the real aspect with the card and pill footprints
    drawn over it, which is the only way to see that a crop has moved the busy
    quarter under a card."""
    w, h = im.size
    want_h = int(round(w / ASPECT))
    if want_h <= h:
        top = (h - want_h) // 2
        return im.crop((0, top, w, top + want_h))
    want_w = int(round(h * ASPECT))
    left = (w - want_w) // 2
    return im.crop((left, 0, left + want_w, h))


def warm(im, amount):
    """Push red up and blue down about the mid-point. Applied AFTER saturation
    has been taken out, per the note in the docstring."""
    r, g, b = im.split()
    r = r.point(lambda v: min(255, int(v + 255 * amount * (v / 255.0) ** 0.5)))
    b = b.point(lambda v: max(0, int(v - 255 * amount * 0.7 * (v / 255.0) ** 0.5)))
    return Image.merge('RGB', (r, g, b))


def vignette(im, strength):
    """Radial falloff, multiplied. Strength is the fraction removed at the
    extreme corner."""
    w, h = im.size
    # build at a low resolution and scale up — the falloff is smooth, and a
    # per-pixel Python loop over 2000x1125 is minutes rather than seconds
    sw, sh = 160, int(round(160 * h / w))
    mask = Image.new('L', (sw, sh))
    px = mask.load()
    cx, cy = (sw - 1) / 2.0, (sh - 1) / 2.0
    maxd = (cx ** 2 + cy ** 2) ** 0.5
    for y in range(sh):
        for x in range(sw):
            d = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5 / maxd
            px[x, y] = int(round(255 * (1.0 - strength * (d ** 2.2))))
    mask = mask.resize((w, h), Image.BICUBIC)
    black = Image.new('RGB', (w, h), (0, 0, 0))
    return Image.composite(im, black, mask)


def zone(im, x0, y0, x1, y1):
    w, h = im.size
    return mean_luma(im.crop((int(w * x0), int(h * y0), int(w * x1), int(h * y1))))


for f in FRAMES:
    src = Image.open(os.path.join(SRC, f"cand-{f['id']}.jpg")).convert('RGB')
    assert src.size == f['expect'], f"{f['id']} is {src.size}, expected {f['expect']}"

    im = crop_169(src)
    before = mean_luma(im)

    im = ImageEnhance.Contrast(im).enhance(f['gain'])
    im = ImageEnhance.Color(im).enhance(f['sat'])
    im = warm(im, f['warm'])
    im = vignette(im, f['vig'])
    mid = mean_luma(im)

    gm = solve_gamma(im, f['aim'])
    im = gamma(im, gm)

    im = im.resize((OUT_W, int(round(OUT_W / ASPECT))), Image.LANCZOS)
    im.save(os.path.join(OUT, f['stem'] + '.png'))

    # The two numbers that actually decide whether this frame works: the zones
    # the near-white marker cards land in. A card is painted at ~250/255, so a
    # zone much above ~170 will not hold its edge.
    card_tr = zone(im, 0.62, 0.06, 0.95, 0.34)
    card_bl = zone(im, 0.04, 0.62, 0.34, 0.92)
    pill    = zone(im, 0.40, 0.44, 0.62, 0.58)

    print(f"{f['id']}  {f['stem']:16s} luma {before:5.1f} -> {mid:5.1f} -> "
          f"{mean_luma(im):5.1f} (aim {f['aim']})  gamma {gm:4.2f}  {im.size}")
    print(f"{'':10s}  card zones: top-right {card_tr:5.1f}   bottom-left {card_bl:5.1f}"
          f"   pill centre {pill:5.1f}")
