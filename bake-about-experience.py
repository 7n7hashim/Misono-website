#!/usr/bin/env python3
"""Bake the three journey photographs for about.html's experience section.

Reproduce, end to end, from the project root:

    SRC=/tmp/misono-exp && mkdir -p $SRC
    node fetch-pexels.mjs $SRC 38539264 38773918 37996941
    for f in $SRC/raw-*.bin; do id=${f#*raw-}; id=${id%.bin}; \
        sips -s format jpeg "$f" --out "$SRC/cand-$id.jpg"; done
    python3 bake-about-experience.py $SRC $SRC
    for n in about-ex1-teppan about-ex2-craft about-ex3-room; do \
        node bake-png-to-jpeg.mjs $SRC/$n.png assets/img/$n.jpg 0.86; done

The sips step is not optional: Pexels honours Chrome's Accept header, so what
fetch-pexels.mjs lands is AVIF whatever the .jpeg in the URL says, and nothing
else here will open it.

Source frames, all Pexels:

    38539264  1439x1800  a chef at the teppan, wall of flame   -> 01
    38773918  1200x1800  kingfish crudo under caviar           -> 02
    37996941  1200x1800  a timber-battened room, set table     -> 03

CROP. Unlike the chapter set these do not all arrive at 2:3, so the crop is
given as an explicit origin rather than a row count: 38539264 is already 3:4
once 89 of its 1439 columns go, and the other two lose 200 of 1800 rows. The
offsets are not centred and the reason is recorded per frame below.

GRADE, per frame and not one shared curve, and the aims here are NOT the
chapter section's. Those four are night frames and land on 62-84; these three
arrive at a crop mean of roughly 70, 145 and 112 and two of them are lit
rooms rather than lit subjects. Forced onto the chapters' band the crudo goes
grey — its ground is a white plate, and a white plate pushed to 78 is a grey
plate. So this set is levelled against itself and sits higher, 84 to 104.

That is a deliberate break and the section is built around it: three dark
frames already sit above this one on the same page (the flaming teppan of
chapter I, the lantern room of chapter IV, and the counter of the plate
section), and a fourth dark set would read as more of the same scroll. This
one opens out. What each frame needed:

    38539264  the only one that stays low. It is a real night exposure and
              the flame is already at the top of the range, so the aim buys
              nothing above 84 and the saturation comes down instead — an
              untouched teppan flame on a peach ground reads as a fire alarm.
    38773918  the lightest by 40 points and the one that sets the ceiling.
              Its plate is a ribbed white that measures within a few points
              of --ground #F7E8DF, so the vignette here is doing structural
              work, not mood: without it the frame has no left edge at all.
              Contrast up to keep the caviar reading as beads at 210px wide,
              which is all this card ever gets.
    37996941  a daylight interior, and the only one whose warmth is pushed
              rather than pulled: its plaster wall runs cool green-grey next
              to the peach, and the timber is the whole point of the frame.
              Warmth alone did not fix it. The wall is a large, flat, genuinely
              green-grey field, and at sat 0.86 with the red channel up 7.5%
              it still read cold while the timber had started to go red. What
              works is the opposite order — take the saturation most of the
              way out (0.70) so the wall becomes a neutral, THEN push the
              warmth hard (R +12%, B -14%) and let the timber, which is the
              only strongly coloured thing left, carry the whole frame's
              colour on its own.
"""
import sys, os
from PIL import Image, ImageEnhance, ImageFilter

SRC, OUT = sys.argv[1], sys.argv[2]

# id, output stem, expected source size, crop origin, and the grade.
#   lift   black point raised to this value  (0-255, applied as a floor)
#   gain   contrast multiplier about mid grey
#   sat    saturation multiplier
#   warm   per-channel multiplier (R, G, B)
#   vig    vignette strength at the corners, 0 = none, 1 = black
#   aim    target mean luminance; a gamma is solved to hit it
FRAMES = [
    # The chef sits left of centre and the flame runs off the right edge.
    # Cropping the 89 spare columns off the left rather than splitting them
    # keeps the flame whole; split, the frame loses the top of it.
    dict(id='38539264', stem='about-ex1-teppan', src=(1439, 1800), box=(1350, 1800),
         left=89, top=0,
         lift=4, gain=1.06, sat=0.80, warm=(1.00, 0.99, 0.975), vig=0.28, aim=90),

    # The only frame cropped for legibility rather than composition. At the
    # full 1200x1600 this is a beautiful photograph and, at the 207px this
    # card actually renders at, an orange blob: the ribbed white rim eats the
    # top-left third and the caviar stops resolving as beads. 1050x1400 from
    # (150, 330) is the tightest window that still keeps negative space above
    # the fish, and it enlarges the subject by 14% — the delivered width then
    # sits at 1100 against a 1050 crop, a 5% upsample, which is cheaper than
    # a subject nobody can read.
    dict(id='38773918', stem='about-ex2-craft', src=(1200, 1800), box=(1050, 1400),
         left=150, top=330,
         lift=0, gain=1.14, sat=0.84, warm=(1.00, 1.00, 0.995), vig=0.32, aim=108),

    # The pendant is clipped at row 0 and the counter clutter is at the
    # bottom, so the 200 rows come off the bottom entirely bar 60.
    dict(id='37996941', stem='about-ex3-room', src=(1200, 1800), box=(1200, 1600),
         left=0, top=60,
         lift=4, gain=1.02, sat=0.70, warm=(1.120, 1.005, 0.860), vig=0.26, aim=100),
]

OUT_W = 1100               # delivered width, as the chapter frames


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
    Gamma rather than a linear gain because a gain clips, and two of these
    three are already carrying highlights at the top of the range."""
    lo, hi = 0.30, 3.0
    for _ in range(40):
        mid = (lo + hi) / 2
        if mean_luma(gamma(im, mid)) > aim:   # larger gamma darkens
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


for f in FRAMES:
    src = Image.open(os.path.join(SRC, f"cand-{f['id']}.jpg")).convert('RGB')
    assert src.size == f['src'], f"{f['id']} is {src.size}, expected {f['src']}"

    bw, bh = f['box']
    assert abs(bw / bh - 0.75) < 0.002, f"{f['id']} box {f['box']} is not 3:4"
    im = src.crop((f['left'], f['top'], f['left'] + bw, f['top'] + bh))
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
    # vignette removes light, and solving ahead of it lands three frames on
    # the same mean and then takes a different amount back out of each.
    g = solve_gamma(im, f['aim'])
    im = gamma(im, g)

    im = im.resize((OUT_W, int(round(OUT_W * bh / bw))), Image.LANCZOS)

    after = mean_luma(im)
    w2, h2 = im.size
    box = int(w2 * 0.10)
    corner = mean_luma(im.crop((0, 0, box, box)))
    centre = mean_luma(im.crop((w2 // 2 - box, h2 // 2 - box,
                                w2 // 2 + box, h2 // 2 + box)))

    dst = os.path.join(OUT, f["stem"] + '.png')
    im.save(dst)
    print(f"{f['id']:>9}  {f['stem']:<20} crop {f['left']},{f['top']} {bw}x{bh}  "
          f"luma {before:5.1f} -> {mid:5.1f} -> {after:5.1f} (aim {f['aim']})  "
          f"gamma {g:4.2f}  corner/centre {corner:5.1f}/{centre:5.1f}  {im.size}")
