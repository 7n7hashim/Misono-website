#!/usr/bin/env python3
"""Bake the hero photograph for contact.html.

Reproduce, end to end, from the project root:

    SRC=/tmp/misono-contact && mkdir -p $SRC
    node fetch-pexels.mjs $SRC 19300593
    for f in $SRC/raw-*.bin; do id=${f#*raw-}; id=${id%.bin}; \
        sips -s format jpeg "$f" --out "$SRC/cand-$id.jpg"; done
    python3 bake-contact-hero.py $SRC $SRC
    node bake-png-to-jpeg.mjs $SRC/contact-hero.png assets/img/contact-hero.jpg 0.86

The sips step is not optional: Pexels honours Chrome's Accept header, so what
fetch-pexels.mjs lands is AVIF whatever the .jpeg in the URL says.

Source frame, Pexels 19300593 by Feyza Yildirim, delivered 2700x1800 — a waiter
writing at a counter under a woven rattan pendant, against a painted mural.
Chosen because its lit core sits OFF centre, which is what leaves the middle of
the frame calm enough to set a heading in.

NO VIGNETTE IS BAKED IN, and that is the one decision here worth reading twice.
Every other bake on this site darkens its own corners. This frame must not:
its light source is the pendant, which sits IN the top-left corner, and a baked
vignette puts out the only lamp in the picture. The section's vignette is the
CSS wash, which is re-derived per section anyway.

GRADE, and why it is so light. Measured on the delivered frame:

    whole frame   49.5 / 255
    top-left 10%  116.3          <- the pendant
    centre 10%     41.2          <- the mural, where the heading goes

That is the INVERSE of about.html's opening, the section this one continues:
that frame reads 71.1 whole, 26.7 corner, 117.5 centre — a lit core in a dark
room. This is a lit corner and a dark core. So the numbers that file measured
do not carry across, and two things had to move rather than one:

  1. here, a lift to aim 60 (solved gamma 0.82). Not further: the frame is
     nearly half shadow by design, and lifting it is exactly what spends that.
     Measured share of pixels below 40/255, against the aim:

         aim 49.5 (ungraded)  gamma 0.98   59.8%
         aim 60               gamma 0.82   47.1%   <- taken
         aim 66               gamma 0.74   39.8%
         aim 72               gamma 0.68   29.3%
         aim 78               gamma 0.62   20.6%

     By 72 half the shadow the frame started with is gone and the mural has
     come up into a flat brown haze, which costs the depth that made this
     frame worth choosing. 60 keeps it and still clears the wash.
  2. the rest of the correction is spent in the CSS instead, by taking the
     heading's bed down from about.html's 0.60/0.42 to 0.34/0.22. That file
     needed a heavy bed to subdue a lit hinoki counter at 117. Dropped on a
     centre of 41 it crushes the mural to featureless black — the photograph
     is still there in the DOM and gone from the screen.

Splitting it two ways is the point: pushed all the way in the bake the frame
goes hazy, and all the way in the CSS it goes black.

Contrast and saturation are barely touched. The delivered file is already a
good tungsten frame; gain 1.06 is for the mid-tones across the mural, which are
flat where the wall is furthest from the lamp, and sat 0.96 takes the smallest
edge off an amber that the section's own warm multiply layer will push again.
"""
import sys, os
from PIL import Image, ImageEnhance

SRC, OUT = sys.argv[1], sys.argv[2]

ID     = '19300593'
STEM   = 'contact-hero'
EXPECT = (2700, 1800)
OUT_W  = 2000          # 3:2 kept whole — no crop. A full-viewport hero has to
                       # serve 1.6:1 desktop and 0.46:1 phone off one file, and
                       # every row cropped here is latitude object-position
                       # loses later.
GAIN   = 1.06
SAT    = 0.96
AIM    = 60


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


def shadow_share(im, below=40):
    h = im.convert('L').histogram()
    return sum(h[:below]) / sum(h)


src = Image.open(os.path.join(SRC, f'cand-{ID}.jpg')).convert('RGB')
assert src.size == EXPECT, f'{ID} is {src.size}, expected {EXPECT}'

before = mean_luma(src)

im = ImageEnhance.Contrast(src).enhance(GAIN)
im = ImageEnhance.Color(im).enhance(SAT)
mid = mean_luma(im)

gm = solve_gamma(im, AIM)
im = gamma(im, gm)

im = im.resize((OUT_W, int(round(OUT_W * EXPECT[1] / EXPECT[0]))), Image.LANCZOS)

# Report the three regions the decisions above were made on, plus the band the
# heading actually lands in: the middle 50% of the width at 38-64% of the
# height, which is where 21 characters of Cormorant at 0.20em tracking sit.
w, h = im.size
box = int(w * 0.10)
corner = mean_luma(im.crop((0, 0, box, box)))
centre = mean_luma(im.crop((w // 2 - box, h // 2 - box, w // 2 + box, h // 2 + box)))
band   = mean_luma(im.crop((int(w * 0.25), int(h * 0.38), int(w * 0.75), int(h * 0.64))))

im.save(os.path.join(OUT, STEM + '.png'))
print(f'{ID}  {STEM}  luma {before:5.1f} -> {mid:5.1f} -> {mean_luma(im):5.1f} '
      f'(aim {AIM})  gamma {gm:4.2f}')
print(f'          corner {corner:5.1f}  centre {centre:5.1f}  heading band {band:5.1f}  '
      f'shadow<40 {shadow_share(im)*100:4.1f}%  {im.size}')
