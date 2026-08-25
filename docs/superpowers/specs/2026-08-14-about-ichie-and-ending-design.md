# About — the closing section, and the page's ending

Built 2026-08-14. Completes `about.html`: a seventh narrative section, then the
reserve and ending blocks transplanted from `index.html`.

Also in this pass: the experience section's drawn line slowed by 15%.

## 1. The line, slowed

The line's speed is not a duration — it is scroll distance. `LEAD` and `TAIL`
are fractions of the pin's travel rather than absolute heights, so lengthening
the runway stretches the opening beat, the draw and the closing hold by the same
proportion and changes nothing about the timing's shape. The per-card ramps are
expressed in draw-units and follow for free.

    .js .experience  height: calc(100svh + 140svh)  ->  calc(100svh + 161svh)

140 x 1.15 = 161. Draw span 0.77 x 140 = 107.8svh becomes 0.77 x 161 = 124.0svh.
Verified: the section measures 2349px at 1440x900, i.e. 261svh, against 2160.

## 2. Ichigo ichie — the closing section

一期一会, "one time, one meeting": the tea-ceremony principle that a gathering
happens once and is never repeated. It is the last beat of the page's arc —
close, claim, wide, record, how an evening is built, the journey through it, and
then why none of it can be done twice — and it hands off to the reservation.

No reference image. Three decisions set its form.

**It is not pinned.** The two sections above it are a 460svh pin and a 261svh
pin, back to back. A third would stop reading as pacing and start reading as the
page holding the reader still. This is a single screen in normal flow with a
scroll-linked depth parallax, registered on the existing `track()` — the same
contract the statement and the plate use, and the quietest motion vocabulary on
the page.

**Depth is real.** Two photographic plates sit in one `perspective: 1400px` box
at opposite Z and drift at opposite rates:

| plate | Z | rendered scale | `--k` | behaviour |
|---|---|---|---|---|
| back (3:4) | -80px | 1400/1480 = 0.946 | +3.2 | lags the scroll — further |
| front (4:3) | +70px | 1400/1330 = 1.053 | -2.2 | leads it — nearer |
| copy | — | — | +0.8 | almost still |

The 5% size difference between the plates is the depth cue, not an error to
correct for in the layout. The sign convention: `--cam` runs -1 to +1 as the
section crosses the viewport, so a positive `--k` adds downward travel and reads
as "did not keep up".

The text column moves least on purpose. A copy block that parallaxes as hard as
a photograph reads as a slide rather than as depth.

**The two plates are different aspects.** Every other photograph on the site is
3:4 portrait. The back plate keeps that and the front is 4:3 landscape, so the
two read as two planes rather than as a pair. It is the only landscape frame on
the site.

### What was cut

The brand mon was tried as a pale backplane at the deepest Z. It went for two
reasons: the reserve section immediately below already draws it, and two mons
within one screen of each other read as repetition rather than as a motif. It is
also a trace from a photograph of printed material (see `brand_assets/`), and
enlarging it would enlarge whatever the trace got wrong.

### Geometry

Deliberately the experience section's: same `min(1vw, 1.70svh)` unit, same
100-unit inner width, same 5.91% text inset, same `2.892 * u` display size and
1.216 leading, same shadow ratios. The two sections should read as one spread.

The stage is a fixed-aspect box (743/630 at 1440) so both plates and their
overlap are percentages of one box — the same device the experience stage uses.
Plate positions: back at 54.24%/0, 45.76% wide; front at 8.07%/47.62%, 59.22%
wide. They overlap by 97px of the stage's width at 1440.

Fit verified with the caption clearing the inner's bottom edge by 30-61px at
1440x900, 1512x820, 1440x780, 1366x768, 1280x720, 1920x1080 and 1080x700.

Below 1080px: text, then the two plates in a plain column, no perspective and no
parallax. A 5% depth difference across a 350px phone is a rendering artefact,
not a composition.

### Photography

`assets/img/about-ic{1,2}-*.jpg`, Pexels 16388600 and 30682878, baked by
`bake-about-ichie.py`. 235KB the pair.

Graded to 80 and 64 — the chapters' band (62-84), not the experience section's
(90-108) directly above. Both are lit subjects in dark rooms, and a night counter
forced to 100 stops being a night counter.

The 16-point spread runs the opposite way to the usual rule, where a tight macro
sits above a wide interior. Here the macro's ground is a dark lacquered counter
and the interior's is lit timber, so the macro is the darker of the two. Levelled
at 84 the brush frame's solved gamma is 0.79, which lifts a frame that is more
than half shadow by design and leaves it hazy beside the counter shot. Judged on
the shadow histogram rather than by eye: below 40/255 it holds 51% of its pixels
at aim 68 and 57% at 60.

The brush frame also needed the desaturate-before-warm order the experience
section's room frame established — its bamboo leaf is a large flat green field,
and warming at full saturation turns the leaf olive and the apron magenta.
Measured on the leaf's own patch: 116,128,104 before, 121,118,101 after, so a
green cast of -12 becomes +3.

## 3. The reserve and ending blocks

Transplanted byte-for-byte from `index.html`, as `menu.html` already does.
`about.html` is now the third page under that contract.

| | index.html | about.html |
|---|---|---|
| CSS | 997-1716 | 2777-3496 |
| reserve markup | 2098-2208 | 3990-4100 |
| ending markup | 2211-2228 | 4103-4120 |

    diff <(awk 'NR>=997 && NR<=1716' index.html) \
         <(awk 'NR>=2777 && NR<=3496' about.html)

**Zero deltas in the CSS** — byte-identical, unlike `menu.html`, whose copy
carries two (a blank line, and a `scroll-behavior` block it handles in its own
`html` rule). `about.html` has no `scroll-behavior` of its own, so the copy's
version was taken as-is.

**One delta in the markup**: `aria-current="page"` on the ending nav's About
link, matching what `menu.html` does for its own Menu link.

The peach adaptation block is identical to `menu.html`'s, verified by diff. It
re-points `--cream` at `--ground` for the two copied blocks and handles the four
things that do not follow from that. `--cream` was added to `about.html`'s
`:root` for it — the token is superseded as a colour and load-bearing as a name.

`--res-gold` was already in `:root` from the experience section's drawn line, at
the same `#AC7634` the peach block sets on `.reserve`. No conflict: the block's
rule is more specific and sets the same value.

The reserve section carries `id="reserve"`, so the ending nav's "Contact" link
now resolves on this page rather than jumping to the homepage.

## Known and not fixed

The topbar in the opening section and the ending nav both carry
`aria-current="page"` for About. That is correct — they are two different
navigations — but it does mean the page announces its own name twice to a
screen reader that reads both landmarks.

## Still placeholder

Everything the reserve block already carried on the other two pages: the
invented `wa.me` number (+254 700 000 000), seating, party size, opening days and
the reply time. Fixing them is one edit in `index.html` followed by three
re-copies, not three edits.

The ichie section's copy is written. It makes no numeric claim, but "the fish is
cut after you are seated" and "the Teppan is taken back to bare steel between
courses" are both service claims that need confirming with the restaurant, as do
the counter claims in the statement paragraph and the figures.
