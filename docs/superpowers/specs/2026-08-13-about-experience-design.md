# About — the experience section

Built 2026-08-13. Fifth section of `about.html`, immediately after the chapters.
Matched to `assets/img/about line scroll through.png`.

A pinned journey: an editorial masthead, then three 3:4 photographs at staggered
heights, with one continuous gold line drawn through all three as the reader
scrolls. Each card lands as the line reaches it; its caption follows.

## What was measured

The reference is a 2047x1066 capture. Every share below was read by a pixel scan,
not by eye, and is against that 2047.

| | measured | became |
|---|---|---|
| eyebrow cap | 10px = 0.489% | `--open-link`, `--menu-accent` |
| heading cap | 38px = 1.856% | `2.892 * --ex-u` (Cormorant cap = 0.6417 em) |
| heading leading | 72px cap-to-cap = 3.517% | `line-height: 1.216` |
| heading ink | x 121..1119 = 48.7% | not held — see below |
| right paragraph | x 1316..1897 = 28.4%, pitch 39px | col 2 of the masthead, `line-height: 1.814` |
| card | 298 x 397 | 3:4 to within a pixel — the chapters' ratio |
| card corner | r 17.5px = **5.9% of the card** | `--ex-frame * 0.059` |
| caption block | 414px = **1.39x its own card** | `.ex-card { width: 20.225% }` |
| caption title cap | 19px = 0.928% | `1.446 * --ex-u` |
| caption body pitch | 36.5px = 1.783% | `line-height: 1.70` |
| badge | 45px circle, centre 44px in from top-right | `--ex-frame * 0.151`, inset `0.0721` |
| card 1 -> card 2 | x +617, y +122 | x 273/890/1500, y 36/158/82 |
| line | 2-3px, `#F2B68D` | `--res-gold` at 2.27 user units |

Verified against a 1440x900 render: heading cap-to-cap 51px (reference 50.6),
lede pitch 27.3 (27.4), caption pitch 26.0 (25.7), caption title cap 14 (13.4).

### Three things the reference could not give

**Card 3 does not exist in it.** The capture is cropped after card 2. Its
position is derived: the line leaves card 2 descending to a trough at x 1386
and is still *rising* when the crop ends at x 1468, which only resolves onto a
third card set higher than the second. Hence 36 / 158 / 82 — the journey drops
to the centre and comes back up. A monotonic staircase also puts the third
caption about 120px below what a viewport can hold.

**The heading's ink width is not held.** The reference sets 41 characters on its
first line; "Thoughtfully Crafted. / Beautifully Experienced." is 24 and 24. Cap
height is held and ink width is let go, as in the chapters section — the type is
the reference's size, there is simply less of it.

**Its line colour is unusable.** `#F2B68D` measures under 1.6:1 on this site's
peach and disappears. `--res-gold` is the token for a non-text boundary and
carries the same warmth at 3.26:1.

## Geometry

`--ex-u` is 1% of the reference's width; `--ex-w` is the composition at 100 of
them. Everything — frame, columns, display sizes, gaps — is a multiple, as in
the chapters section, so the block scales as one unit and never has its rhythm
compressed to claw back pixels.

`--ex-u: min(1vw, 1.70svh)`, and **1.70 is solved against a measured block
height, not a predicted one.** Adding the reference's own numbers gives 48.75u,
which is wrong: the real block runs eyebrow cap-top to last descender and
measured 736px against a 14.4px unit, i.e. **51.1u**. The 2.4u difference is
half-leading, which is in none of the ink extents a screenshot gives you. At
1.80svh the section fitted 1440x900 and overran 1512x820 by 16px — exactly that
error. 51.1u + 8svh of padding must fit 100svh, giving 1.80 with nothing spare;
it is set at 1.70, leaving ~5svh for a caption that rewraps at some untried
width. Verified with no overflow at 1440x900, 1512x820, 1440x780, 1366x768,
1280x720, 1920x1080, 1200x800, 1100x900 and 1080x700.

**The stage is one fixed-aspect box** (`aspect-ratio: 2047/770`) and both the SVG
viewBox and the cards are positioned inside it in per cent. That is what lets an
SVG and a CSS layout agree at every width without `preserveAspectRatio="none"`,
which would stretch the stroke and turn the rings into ellipses.

## Motion

The script writes **one number for the whole section** — `--draw`, 0 to 1, on
`.experience`. Every frame, caption, badge, dot and ring derives its own state in
CSS from it against its own `--at`, so the per-frame cost is one `setProperty`
regardless of how much is moving. It runs on the same rAF loop and the same
observer as `track()` and `pin()`; there is no GSAP on this site.

`--draw` **rests at 1**, so no-JS, reduced motion and `screenshot.mjs` all render
the finished composition rather than an empty stage. The script takes it away and
gives it back.

The pin is 240svh: `LEAD 0.07` (a beat on the empty stage, so the masthead is
read first), the draw, then `TAIL 0.16` — a hold, because the last card lands at
`--at .758` and its caption .05 after that, and without it the reader arrives at
the end of the journey exactly as the section releases.

### The --at table is measured, not estimated

Every `--at` is a fraction of the path's *length*, read with `getPointAtLength`
by `measure-ex-path.mjs`. Estimating from x is not close enough: the path is
2210.8 units long over 1985 of horizontal travel and two segments are
near-vertical plunges that spend length without spending x.

```
card 1 x  273  .1143     dot 1 x  258  .1072     ring 1 x  598  .2775
card 2 x  890  .4582     dot 2 x  876  .4495     ring 2 x 1200  .6032
card 3 x 1500  .7578     dot 3 x 1486  .7512     ring 3 x 1824  .9107
```

### The dash: three builds, two of them silently wrong

This is the part that does not survive being reasoned about, and it was settled
by rendering and measuring the painted tip against the path's own geometry.

1. `pathLength="1000"` with `stroke-dasharray: 1000`, so the draw is a plain
   fraction. **CSS resolves a unitless number in these properties to a length** —
   Chrome computes it as `1000px`, the offset as `calc(286px)` — and pathLength
   normalisation applies only to a `<number>`. The dash came out shorter than the
   path, so a *second* dash began partway along and painted the run-out to the
   right margin from the first frame.

2. `stroke-dasharray: 2211`, the path's real length in user units. Still wrong,
   and wrong by exactly 2047/1440: **`px` here is a CSS pixel of the rendered
   box, not a user unit**, so 2211px is 3143 path units. The tip ran 1.42x ahead
   of `--draw` at every value — x 823 where the fraction wanted 632, and pinned at
   the far end from `--draw` 0.71 on.

   Removing `vector-effect: non-scaling-stroke` does **not** change this. That was
   a wrong guess; the ratio was identical before and after.

3. What works: express the length in the space the browser is measuring in, so
   the scales cancel. The path is 2210.8 units of a 2047 viewBox = 1.07998 of the
   stage's width, and the stage's width is `--ex-w`:

   ```css
   --ex-len: calc(1.07998 * var(--ex-w));
   stroke-dasharray: var(--ex-len);
   stroke-dashoffset: calc(var(--ex-len) * (1 - var(--draw)));
   ```

   Verified: the painted tip now lands within a few viewBox units of the path
   point at `--draw` 0.123, 0.299, 0.494, 0.714, 0.909 and 1.

**Re-measure 1.07998 if the path changes** — `measure-ex-path.mjs` prints the
total length; divide by 2047.

### Reduced motion

The pin comes out and every property derived from `--draw` is put back to rest
**by name**, not by resetting `--draw` — the script writes `--draw` as an inline
style and an inline custom property beats a media query. Same lesson as the
chapters section's `--enter`, arrived at from the other direction.

## Decisions worth recording

- **Numbered markers are load-bearing here.** 01/02/03 are not decoration: the
  section is a sequence the reader is walked through in order, and the numbers
  are what the line is threading. They also differentiate from the chapters' I-IV
  immediately above.
- **The badge is `--misono-indigo`.** The reference's is a deep oxblood. The
  indigo is the one measured brand value on this site and, until this section,
  the only token with nothing to do. White on it is 7.7:1.
- **The reference's self-crossing curl before card 2 was dropped** and an open
  ring put at that trough instead. It reads as a doodle rather than restraint.
- **Marks are a filled dot where the line enters each card and an open ring where
  it exits.** Six in total and nothing else. The ring is the only thing on the
  line that moves rather than fades — it blooms open from the point the stroke
  just passed through.
- **Caption tracking is 0.05em, not the reference's fit.** The reference sets
  0.655 em/character against Cormorant's natural 0.606, and 0.08em would close
  it — but its titles are 14-16 characters and these are 21-22. At 0.08em
  "JAPANESE CRAFTSMANSHIP" measures 292px inside a 290px block and takes a second
  line. The caption's width is measured and is not the thing to give up.
- **The two caption sizes carry a floor and the display size does not.** At the
  1080px the stage opens at, `1.446u` and `1.050u` are a 15.6px title and an
  11.3px body. The floors engage below ~1180px and are off by 1200, so the
  measured composition is untouched everywhere it actually runs.
- **The frame shadow is a share of the frame, not a pixel value.** These frames
  are 207px wide at 1440 against the chapters' 295, and the chapters' fixed 60px
  bloom around a frame two thirds the size stops reading as a shadow and starts
  reading as a halo painted on the ground. The ratios are the chapters' own
  values read against the chapters' frame.
- **Below 1080px there is no stage, no line and no pin** — a stacked column,
  cards capped at 27rem with the middle one taking the other side of the row so
  the journey still reads. A 3:4 frame at the full width of an 820px tablet is
  1093px tall on its own; uncapped the stacked section ran to 4095px, capped it
  is 2784.

## Known and not fixed

Resizing across the 1080px breakpoint mid-session does not re-register the
section: `drawLine()` checks the media query once at load. Both directions
degrade safely — below the breakpoint nothing reads `--draw`, and above it the
stage appears at its rest state, fully drawn and static, until reload.

## Photography

`assets/img/about-ex{1,2,3}-*.jpg`, 1100x1467, ~650KB the set. Pexels 38539264 /
38773918 / 37996941, baked by `bake-about-experience.py` (reproduce command in
its docstring).

Nothing already on the site was reused — the real Misono photographs are all in
the homepage gallery.

**This set is levelled against itself and sits higher than the chapters' 62-84,
at 90-108.** That is deliberate. Two of the three are lit rooms rather than lit
subjects, and forced onto the chapters' band the crudo goes grey — its ground is
a white plate, and a white plate pushed to 78 is a grey plate. More to the point,
three dark frames already sit above this section on the same page (chapter I's
flaming teppan, chapter IV's lantern room, and the plate section's counter); a
fourth dark set would read as more of the same scroll. This one opens out.

Two per-frame notes worth keeping:

- **37996941 needed the grade in the opposite order.** Its plaster wall is a
  large, flat, genuinely green-grey field. At sat 0.86 with red up 7.5% it still
  read cold while the timber had started to go red. What works is to take the
  saturation most of the way out (0.70) so the wall becomes neutral, *then* push
  the warmth hard (R +12%, B -14%) and let the timber — the only strongly
  coloured thing left — carry the frame's colour alone.
- **38773918 is the one frame cropped for legibility rather than composition.**
  At the full 1200x1600 it is a beautiful photograph and, at the 207px this card
  renders at, an orange blob. 1050x1400 from (150, 330) enlarges the subject 14%;
  the 5% upsample to 1100 is cheaper than a subject nobody can read.

## Tools

- `measure-ex-path.mjs` — prints the `--at` table and the path's total length.
- `shoot-experience.mjs` — captures the pin at given positions and prints
  `--draw` and the frame/caption opacities beside each file. `screenshot.mjs`
  cannot capture this section, for the same two reasons it cannot capture the
  chapters.

## Still placeholder

All copy in this section is written, not supplied. Nothing in it makes a
checkable numeric claim, but "the chef works in front of you, not behind a door"
depends on the same unverified counter/teppan service the statement paragraph and
the figures do.
