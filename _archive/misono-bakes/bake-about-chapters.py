#!/usr/bin/env python3
"""Bake the four chapter photographs for about.html's pinned chapter section.

Reproduce, end to end, from the project root:

    SRC=/tmp/misono-chapters && mkdir -p $SRC
    node fetch-pexels.mjs $SRC 36131817 30682797 9424913 36338002
    for f in $SRC/raw-*.bin; do id=${f#*raw-}; id=${id%.bin}; \
        sips -s format jpeg "$f" --out "$SRC/cand-$id.jpg"; done
    python3 bake-about-chapters.py $SRC $SRC
    for n in about-ch1-teppan about-ch2-hand about-ch3-ingredient about-ch4-room; do \
        node bake-png-to-jpeg.mjs $SRC/$n.png assets/img/$n.jpg 0.86; done

The sips step is not optional: Pexels honours Chrome's Accept header, so what
fetch-pexels.mjs lands is AVIF whatever the .jpeg in the URL says, and nothing
else here will open it.

Source frames, all Pexels, all delivered 1200x1800:

    36131817  oil poured onto a flaming teppan          -> chapter I
    30682797  a blade mid-cut on a wooden counter       -> chapter II
    9424913   wagyu nigiri on a stone rest              -> chapter III
    36338002  an empty dining room under woven lanterns -> chapter IV

Two things this script exists to do, neither of which survives being eyeballed:

CROP. The section's frame is 3:4 and the delivery is 2:3, so 200 of the 1800
rows have to go. Which 200 is not a detail — on the nigiri frame the subject
sits at 62% of the source height, and a centred crop puts it at 62% of the
frame too, which reads as "fell to the bottom". Each crop below is offset so
the subject lands where the composition wants it, and the offset is recorded.

GRADE, per frame and not one shared curve. These four are stock from four
different photographers and they arrive at four different exposures: cropped
and given only the character grade below, they mean 49, 60, 69 and 99 of 255.
Dropped into the section like that they read as four photographs, not as one
sequence.

So the grade is in two parts. The dict below is the *character* of each frame
— contrast, saturation, warmth, vignette — and is set by eye against what the
frame is of. The `aim` is its *level*, and is not set by eye at all: a gamma
is solved per frame by bisection until the graded frame's mean luminance
lands on it. Hand-tuning black points until four frames look level is what
produced the 49-to-99 spread on the first pass — each of them looked right
alone, which is exactly the failure mode.

The aims are deliberately not identical. A wide night interior forced to the
same mean as a lit macro of a single nigiri has been pushed somewhere it does
not want to go, so the room keeps the bottom of the band and the nigiri the
top: a 16-point spread, against the 50 they arrived with. What each needed:

    36131817  fire is already saturated past what the peach wants; pull
              saturation back so the flame stops competing with the ground.
    30682797  flat out of the camera, and the only frame whose aim had to be
              argued down rather than set: at 72 the solved gamma was 0.66
              and the black field behind the chef lifted to a milky grey. It
              sits at 62, with the contrast raised to 1.22 to pay for it.
    9424913   the lightest by a wide margin, and its background is a pale
              warm wood that sits within a few points of --ground #F7E8DF.
              Pulled down, and vignetted so the frame's edge does not
              dissolve into the page it is sitting on. Its corners measure 0
              afterwards, which is the photograph's own black backdrop and
              not the vignette clipping — dropping vig from 0.42 to 0.28
              did not move them.
    36338002  darkest of the four, and the only one whose saturation goes up
              rather than down — a night interior loses colour before it
              loses light.

The vignette is applied in every case for the same reason as the nigiri
frame's: these sit as floating rectangles on a light ground with only a soft
shadow under them, so an edge that runs pale is an edge that has no corner.
"""
import sys, os
from PIL import Image, ImageEnhance, ImageFilter

SRC, OUT = sys.argv[1], sys.argv[2]

# id, output stem, crop top (of 1800 rows, keeping 1600), and the grade.
#   lift   black point raised to this value  (0-255, applied as a floor)
#   gain   contrast multiplier about mid grey
#   sat    saturation multiplier
#   warm   per-channel multiplier (R, G, B)
#   vig    vignette strength at the corners, 0 = none, 1 = black
#   aim    target mean luminance; a gamma is solved to hit it
FRAMES = [
    dict(id='36131817', stem='about-ch1-teppan',    top=0,
         lift=6,  gain=1.04, sat=0.88, warm=(1.00, 0.995, 0.985), vig=0.30, aim=78),
    dict(id='30682797', stem='about-ch2-hand',      top=0,
         lift=0,  gain=1.22, sat=0.96, warm=(1.02, 1.00, 0.975), vig=0.28, aim=62),
    dict(id='9424913',  stem='about-ch3-ingredient', top=190,
         lift=2,  gain=1.10, sat=0.92, warm=(1.00, 0.99, 0.975), vig=0.28, aim=84),
    dict(id='36338002', stem='about-ch4-room',      top=50,
         lift=8,  gain=1.06, sat=1.06, warm=(1.02, 1.00, 0.98), vig=0.24, aim=68),
]

W, H = 1200, 1600          # the 3:4 crop, at source resolution
OUT_W = 1100               # delivered width; see the note in about.html


def vignette(im, strength):
    """A radial darkening built as an L-mask and multiplied in. Elliptical,
    matched to the 3:4 frame, so the falloff reaches the short edges and the
    long edges at the same rate."""
    w, h = im.size
    mask = Image.new('L', (w, h), 0)
    px = mask.load()
    cx, cy = w / 2.0, h / 2.0
    for y in range(h):
        dy = (y - cy) / cy
        for x in range(w):
            dx = (x - cx) / cx
            r = (dx * dx + dy * dy) ** 0.5 / (2 ** 0.5)   # 0 centre, 1 corner
            # Flat through the middle, then a smooth ramp — a linear falloff
            # from the centre visibly darkens the subject.
            t = max(0.0, (r - 0.45) / 0.55) ** 1.6
            px[x, y] = int(255 * (1.0 - strength * min(1.0, t)))
    mask = mask.filter(ImageFilter.GaussianBlur(w / 40))
    black = Image.new('RGB', (w, h), (0, 0, 0))
    return Image.composite(im, black, mask)


def mean_luma(im):
    g = im.convert('L')
    h = g.histogram()
    return sum(i * n for i, n in enumerate(h)) / sum(h)


def gamma(im, g):
    lut = [min(255, int(round(255.0 * (v / 255.0) ** g))) for v in range(256)]
    return im.point(lut * 3)


def solve_gamma(im, aim):
    """Bisect for the gamma that lands this frame's mean luminance on `aim`.
    Gamma rather than a linear gain because a gain clips: ch2 needs +23 mean
    and its highlights are already at the top of the range, so multiplying
    flattens the blade's specular into white. Gamma spends the lift in the
    shadows, which is where these frames have room."""
    lo, hi = 0.30, 3.0
    for _ in range(40):
        mid = (lo + hi) / 2
        # Larger gamma darkens, so the search runs the opposite way round.
        if mean_luma(gamma(im, mid)) > aim:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


for f in FRAMES:
    src = Image.open(os.path.join(SRC, f"cand-{f['id']}.jpg")).convert('RGB')
    assert src.size == (1200, 1800), f"{f['id']} is {src.size}, expected 1200x1800"

    im = src.crop((0, f['top'], W, f['top'] + H))
    before = mean_luma(im)

    # Black-point lift first: raising the floor after contrast just greys the
    # whole frame, raising it before keeps the highlights where they were.
    lo = f['lift']
    lut = [min(255, int(lo + (255 - lo) * (v / 255.0))) for v in range(256)]
    im = im.point(lut * 3)

    im = ImageEnhance.Contrast(im).enhance(f['gain'])
    im = ImageEnhance.Color(im).enhance(f['sat'])

    r, g, b = f['warm']
    im = im.point([min(255, int(v * r)) for v in range(256)] +
                  [min(255, int(v * g)) for v in range(256)] +
                  [min(255, int(v * b)) for v in range(256)])

    im = vignette(im, f['vig'])
    mid = mean_luma(im)

    # Exposure last, and after the vignette rather than before it — the
    # vignette removes light, and solving ahead of it would land four frames
    # on the same mean and then take a different amount back out of each
    # (0.42 from the nigiri against 0.24 from the room), which is the spread
    # again in miniature. Solving here is what the page actually receives.
    g = solve_gamma(im, f['aim'])
    im = gamma(im, g)

    im = im.resize((OUT_W, int(OUT_W * H / W)), Image.LANCZOS)

    after = mean_luma(im)
    # Corner against centre, to confirm the vignette survived the gamma: a
    # lift below 1.0 raises shadows, and the frame edge is all shadow.
    w2, h2 = im.size
    box = int(w2 * 0.10)
    corner = mean_luma(im.crop((0, 0, box, box)))
    centre = mean_luma(im.crop((w2 // 2 - box, h2 // 2 - box,
                                w2 // 2 + box, h2 // 2 + box)))

    dst = os.path.join(OUT, f["stem"] + '.png')
    im.save(dst)
    print(f"{f['id']:>9}  {f['stem']:<22} crop y{f['top']}..{f['top']+H}  "
          f"luma {before:5.1f} -> {mid:5.1f} -> {after:5.1f} (aim {f['aim']})  "
          f"gamma {g:4.2f}  corner/centre {corner:5.1f}/{centre:5.1f}  {im.size}")
