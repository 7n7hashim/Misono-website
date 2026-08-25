#!/usr/bin/env python3
"""Bake the two photographs for about.html's closing section (ichigo ichie).

Reproduce, end to end, from the project root:

    SRC=/tmp/misono-ichie && mkdir -p $SRC
    node fetch-pexels.mjs $SRC 16388600 30682878
    for f in $SRC/raw-*.bin; do id=${f#*raw-}; id=${id%.bin}; \
        sips -s format jpeg "$f" --out "$SRC/cand-$id.jpg"; done
    python3 bake-about-ichie.py $SRC $SRC
    node bake-png-to-jpeg.mjs $SRC/about-ic1-counter.png assets/img/about-ic1-counter.jpg 0.86
    node bake-png-to-jpeg.mjs $SRC/about-ic2-brush.png   assets/img/about-ic2-brush.jpg   0.86

The sips step is not optional: Pexels honours Chrome's Accept header, so what
fetch-pexels.mjs lands is AVIF whatever the .jpeg in the URL says.

Source frames, both Pexels, both delivered 1200x1800:

    16388600  a hand setting nigiri on slate at a lit counter   -> the back plate
    30682878  a brush glazing nigiri, close                     -> the front plate

TWO ASPECTS, ON PURPOSE. Every other photograph on this page is 3:4 portrait.
The back plate keeps that; the front plate is 4:3 landscape, so the two read as
two planes rather than as a pair, which is the whole point of the composition
they sit in. It is also the only landscape frame on the page.

GRADE. These two land at 80 and 64, in the CHAPTERS' band (62-84) rather than
the experience section's (90-108) directly above them. That is not an
inconsistency: the experience frames are lit rooms and a high-key plate, and
these two are lit subjects in dark rooms — a night counter forced to 100 stops
being a night counter.

The 16-point spread between the two is also deliberate and runs the opposite way
to the usual rule. Normally a tight macro sits ABOVE a wide interior, because a
macro is a lit subject filling the frame; here the macro's ground is a dark
lacquered counter and the interior's is lit timber, so the macro is the darker
of the two. Level them and the brush frame goes milky — at aim 84 its solved
gamma is 0.79, which lifts a frame that is more than half shadow by design and
leaves it hazy beside the counter shot. Judged on the shadow histogram, not by
eye: below 40/255 the frame holds 51% of its pixels at aim 68 and 57% at 60.

What each needed:

    16388600  almost nothing beyond exposure. A genuinely good night frame:
              warm tungsten already, string-light bokeh doing the work in the
              upper third. Contrast raised a little because the delivered
              file is flat in the mid-tones where the chef's hand sits.

    30682878  the same problem as the experience section's room frame and the
              same answer. Its bamboo leaf is a large, flat, saturated GREEN
              field across the bottom half — the one hue that has nowhere to
              sit on a peach ground. Warming it at full saturation turns the
              leaf olive and the apron magenta. Saturation comes most of the
              way out first (0.55), which drops the leaf to a neutral, and
              only then does the warmth go on hard (R +10%, B -12%), leaving
              the fish and the brush's ferrule as the only coloured things
              in the frame. Measured on the leaf's own patch: 116,128,104
              before, 121,118,101 after — a green cast of -12 becomes +3.
"""
import sys, os
from PIL import Image, ImageEnhance, ImageFilter

SRC, OUT = sys.argv[1], sys.argv[2]

FRAMES = [
    # The counter. 200 rows go; 80 off the top and 120 off the bottom rather
    # than a centred 100/100, because the bottom edge is an out-of-focus
    # foreground slab and the top is the string lights, which are the frame's
    # only source of depth.
    dict(id='16388600', stem='about-ic1-counter', src=(1200, 1800),
         box=(1200, 1600), left=0, top=80, out_w=1100,
         lift=3, gain=1.10, sat=0.92, warm=(1.030, 1.000, 0.970), vig=0.30, aim=80),

    # The brush. 4:3 from a 2:3 source, so 900 of 1800 rows survive: the
    # window is placed on the nigiri rather than centred, which would cut the
    # brush's handle and keep an empty apron.
    dict(id='30682878', stem='about-ic2-brush', src=(1200, 1800),
         box=(1200, 900), left=0, top=560, out_w=1100,
         lift=0, gain=1.45, sat=0.34, warm=(1.160, 1.000, 0.830), vig=0.36, aim=64),
]


def vignette(im, strength):
    """A radial darkening built as an L-mask and multiplied in. Elliptical, so
    the falloff reaches the short and long edges at the same rate whatever the
    frame's aspect."""
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
    mask = mask.filter(ImageFilter.GaussianBlur(w / 40))
    return Image.composite(im, Image.new('RGB', (w, h), (0, 0, 0)), mask)


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


for f in FRAMES:
    src = Image.open(os.path.join(SRC, f"cand-{f['id']}.jpg")).convert('RGB')
    assert src.size == f['src'], f"{f['id']} is {src.size}, expected {f['src']}"

    bw, bh = f['box']
    im = src.crop((f['left'], f['top'], f['left'] + bw, f['top'] + bh))
    before = mean_luma(im)

    lo = f['lift']
    im = im.point([min(255, int(lo + (255 - lo) * (v / 255.0))) for v in range(256)] * 3)
    im = ImageEnhance.Contrast(im).enhance(f['gain'])
    im = ImageEnhance.Color(im).enhance(f['sat'])

    r, g, b = f['warm']
    im = im.point([min(255, int(v * r)) for v in range(256)] +
                  [min(255, int(v * g)) for v in range(256)] +
                  [min(255, int(v * b)) for v in range(256)])

    im = vignette(im, f['vig'])
    mid = mean_luma(im)
    gm = solve_gamma(im, f['aim'])
    im = gamma(im, gm)

    ow = f['out_w']
    im = im.resize((ow, int(round(ow * bh / bw))), Image.LANCZOS)

    after = mean_luma(im)
    w2, h2 = im.size
    box = int(w2 * 0.10)
    corner = mean_luma(im.crop((0, 0, box, box)))
    centre = mean_luma(im.crop((w2 // 2 - box, h2 // 2 - box,
                                w2 // 2 + box, h2 // 2 + box)))

    im.save(os.path.join(OUT, f['stem'] + '.png'))
    print(f"{f['id']:>9}  {f['stem']:<20} crop {f['left']},{f['top']} {bw}x{bh}  "
          f"luma {before:5.1f} -> {mid:5.1f} -> {after:5.1f} (aim {f['aim']})  "
          f"gamma {gm:4.2f}  corner/centre {corner:5.1f}/{centre:5.1f}  {im.size}")
