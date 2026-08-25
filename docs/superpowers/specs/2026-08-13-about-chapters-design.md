# Misono — About page, the chapters section

**Date:** 2026-08-13
**Deliverable:** a fifth section on `about.html`, after `.figures`. Four
photographs and four panels in one pinned viewport, scrubbed by scroll. Nothing
else on the page was changed except `:root`, which gained `--menu-accent`.

Also added: `assets/img/about-ch{1..4}-*.jpg`, `bake-about-chapters.py`,
`bake-png-to-jpeg.mjs`, `fetch-pexels.mjs`, `shoot-chapters.mjs`.

## Reference

`assets/img/scroll through for about.png`, a 2048x1078 screenshot of a travel
site. Layout and scroll interaction only — none of its content was carried over.

## Measurement

Every share is a pixel scan of the reference against its own 2048px width, and
every one was re-scanned on a 1440x900 render of the result.

| element | reference | built | note |
|---|---|---|---|
| photograph, width | 20.51% of W | 20.49% | |
| photograph, aspect | 420x561 = 3:4 | 295x393 = 3:4 | |
| photograph, left | 14.60% | 15.28% | see "the 0.68%" below |
| photo → column gap | 6.15% | 6.15% | |
| text column | 41.26% → 76.07% | 41.88% → 76.67% | same 0.68% |
| label / description split | desc at 33.5% of the column | same | |
| numeral track, centre | 83.62% | 84.03% | |
| numeral track, extent | y 419..975 | y 325..717 | **= the photo's height** |
| main heading, cap | 2.783% | 2.778% | |
| chapter heading, cap | 2.002% | 2.083% | measured on a round C |
| eyebrow, cap | 0.586% | 0.556% | not chased; see below |
| leading dash | 49x1px = 2.4% | 2.4% | |
| hairline rules | ground darkened ~14% | `rgba(47,27,25,0.16)` | as `.figures` |

**The track is the photograph's height, exactly.** In the reference the numeral
column runs 419..975 and the frame runs 414..975. That is the alignment rule for
this composition and it is not a coincidence worth rediscovering — the track is
sized off `--ch-h` directly rather than off the text column it sits beside.

**The 0.68%.** The reference's content band is 299..1723, whose centre is 1011
against a viewport centre of 1024 — it sits fractionally left. The build centres
its stage instead, so everything lands 0.68% (10px at 1440) right of the
reference. Centring is the more defensible of the two and the offset is within
the noise of reading a screenshot.

**The eyebrow is deliberately not matched.** The reference sets it one cap-pixel
larger. `--open-link` is the size every piece of utility type on this site is
set at, and one site-wide utility size is worth more than half a pixel.

## Type

Cormorant Garamond's cap measures **0.6417 of its em**, read off the flat top
and baseline of the I and the B in "Is Built" on a 1440x900 render, which agreed
to the pixel. Both display sizes are solved from that:

- main heading — ref cap 2.783% → 40.08px at 1440 → `4.34 * --ch-u`
- chapter heading — ref cap 2.002% → 28.83px at 1440 → `3.12 * --ch-u`
- leading — ref 98px on a 57px cap → `line-height: 1.10`

Measure a flat-sided cap. The T of "The" reads 44px rather than 39 because the
h beside it carries an ascender above cap height, and sizing to that put the
whole masthead 10% over on the first pass.

## Colour

The reference's ink is this site's ink already: its heading measures `#2E1A0F`
against `--menu-ink #2F1B19`, its body `#624F3F` against `--menu-body #63504A`.
Neither was re-derived. Its ground is a sand `#E7DABC` and is not used — the
section stays on `--ground` with the rest of the page.

Its two accents — a bright orange masthead eyebrow and a deep oxblood chapter
label — are carried as a *relationship* rather than as two new tokens:
`--menu-accent` for the eyebrow, `--menu-ink` for the chapter label, which keeps
the reference's light-then-dark order using only what `index.html` established.

`--menu-accent` **was missing from `about.html`'s `:root`** until this section,
and missing silently: every `var(--menu-accent)` was an invalid declaration, so
the eyebrow and numerals fell back to inherited ink and the chapter label's
leading rule had no background and did not draw at all. Nothing errored.

The spent numerals are a different colour, not a faint version of the active
one. The reference's measure `(163,144,122)`; solving that as an alpha of the
accent needs 0.89 on red and 0.52 on blue, i.e. it is not one. Against
`--menu-body` it solves consistently at ~0.6, so the ramp runs body → accent.

## Geometry is driven by one number

Everything in the composition is a multiple of `--ch-u`, and that unit carries
the reference's own: 1% of its 2048px width.

```
--ch-u:     min(1vw, 1.62svh)
--ch-w:     clamp(12rem, 20.5 * --ch-u, 26rem)   the photograph
--ch-h:     --ch-w * 4/3        3:4, measured
--ch-gap:   --ch-w * 0.300      126/420
--ch-col:   --ch-w * 1.698      713/420
--ch-stage: --ch-w * 3.390      1424/420, including the track
--ch-drop:  --ch-w * 0.081      34/420, the frame's offset below the column
--ch-title: 4.34 * --ch-u   --ch-head: 3.12 * --ch-u   --ch-body: 1.14 * --ch-u
masthead gap 4.49u   heading gap 2.69u   notes gap 2.20u
```

`min(1vw, 1.62svh)` rather than `1vw`, because the reference capture is 1.90:1
and a laptop is not. Held at `1vw` the block measured 800px tall — which fits 900
and does **not** fit the 780 or 820 a real browser gives you after its chrome. The
pin clips at its own bounds, so the masthead was cut off the top and the last note
off the bottom:

| viewport | before | after |
|---|---|---|
| 1280x720 | — | 42 / 42 |
| 1440x780 | **−10 / −10** | 57 / 57 |
| 1440x900 | 50 / 50 | 76 / 76 |
| 1512x820 | **−6 / −6** | 61 / 61 |
| 1920x1080 | 75 / 74 | 97 / 97 |

1.62 is solved, not chosen: the block has to come down to ~700 at 780, so the unit
must be 0.875 of 14.4px = 12.6px = 1.615svh.

**Scale the block, don't compress the gaps.** Clawing back a hundred pixels by
tightening the rhythm individually keeps the type big and destroys the ratios the
reference was measured for. Scaling the unit keeps every one of them and just
makes the composition smaller.

### The text column against the photograph

The column runs taller than the frame beside it — unavoidably, since the frame is
sized off the viewport and the column off its own words. The reference's column is
1.078x its photo's height; at the reference's own vertical ratios ours was 1.397,
which put the text's optical centre 54px below the picture's and read as the copy
hanging past the bottom of the image.

Three ratios are deliberately set tighter than the reference measured, and they
are the only ones: the notes' top margin (2.20u against 2.93u) and the two note
paddings (1.15u / 1.45u against 1.42u / 1.90u). Plus `.ch__note:last-child`
loses its bottom padding outright — every other note sits above a hairline and
needs the room; the last is trailing space at the foot of the column, and it is
the cheapest 20px available. Centre offset now 25–37px depending on viewport.

## Motion

No GSAP. The site has none, and the brief made it conditional on the project
already using it. The section is registered on the rAF loop `about.html` already
runs for `.statement` and `.plate`, with the same one-number-per-element
contract; only the mapping differs.

**Runway.** `height: 100svh + 4 * 90svh`. `p` is 0 the moment the pin sticks and
1 the moment it lets go:

| p | run | |
|---|---|---|
| `< 0.139` | −1 → 0 | chapter I arrives |
| `0.139 .. 0.889` | 0 → 3 | the three swaps |
| `> 0.889` | 3 | a hold, so IV is readable before the page moves on |

Each element then gets `--d = run − its own index`, clamped to ±1.35 so the CSS
ramps complete. Everything else is derived in CSS.

**Stacking is grid overlap, not absolute positioning.** All four chapters
collapse onto row 1; items sharing a cell overlap, and the row still takes its
height from the tallest chapter, which is what stops the composition shifting as
the text changes.

**Every chapter rises, and that is the only move.** Each frame waits 86svh below
its resting place — far enough below the bottom edge to be off-screen wherever it
sits in the layout — and travels up into position over `--d` −0.85..−0.20. The pin
clips at its own bounds, so a waiting frame is outside the section, not merely
invisible.

This replaced two different moves. The first build had chapter I rise from below
the viewport and chapters II–IV do a *curtain* — the image sliding up inside a
frame that never moved — so the first arrival and the three that followed did not
read as the same gesture at all. One rise for all four is the point.

The window is 0.65 of a step against the curtain's 0.50, and the travel is 86svh
against the curtain's own height: more distance over more scroll is what makes it
read slow rather than merely long.

Two things fell out with the curtain. **`.ch-plate`**, the shared backing plate,
existed only because four coincident frames each carrying a shadow compounds it
four times over; now that each frame retires once covered (`--gone`, `--d`
0.70..0.95 — never seen, since its successor covers it well before) the shadow
lives on `.ch-photo` where it belongs. And **`--enter`**, the section-level entry
progress, is gone: the rise is a function of `--d` like everything else, so the
script writes one number per element and nothing else.

**Rounded corners** are `clamp(14px, --ch-w * 0.098, 34px)` — a share of the frame
rather than a fixed value, so the corner keeps its proportion as the frame scales
from 12rem to 26rem. 23px at 1280, 29px at 1440, 34px at 1920 and above.

**Text is a handoff, not a crossfade.** Out over `--d` 0.25..0.45; in over
−0.55..−0.35, which is the next chapter's window and therefore 0.45..0.65 in
this one's terms. The incoming text starts exactly where the outgoing finished,
so two settings of Cormorant are never on screen together — overlapping serif
paragraphs read as a printing fault. That leaves 60% of every step fully opaque
and simply being read.

The windows must be stated one step apart to be sequential. Writing them
symmetrically (out 0.25..0.45, in −0.75..−0.55) makes them the *same* window and
both chapters fade through each other at 0.69 and 0.30, which is what the first
pass did — along with holding for only 20% of each step, so the section read as
something permanently mid-fade.

**smoothstep, spelled out** — `t*t*(3-2t)` in `calc()` — on every ramp. The
scroll-to-position mapping stays linear on purpose; a scrub that eases feels
like it lags your finger. What these ease is the start and end of each
transition *window*.

**No `will-change` anywhere**, per the note at the foot of this file's `<style>`.

**Measured:** median frame 16.7ms, p95 17.6ms, **0** frames of 239 over 20ms,
across a scripted scrub of the whole pin at 1440x900. 12 property writes per
frame, all skipped when unchanged.

## Narrow

Below 900px the layout stacks and the track lies down as a rail above the frame.
Two rows per chapter — stacked, `grid-row: --i + 1` puts the photograph and its
text in the same cell and they render on top of each other.

**The frames pass behind the copy.** Stacked, a frame rests directly above the
text, so one rising from below the viewport travels straight through it — and
photographs outrank panels in z-order, so it crossed *over* the heading. A band of
ground across the text's row, `​.chapters__body::after` at z-index 5 between the
frames and the panels, turns that into the frame emerging from behind the text.

It has to be its own element rather than a background on `.ch-panel`: the panel's
opacity **is** the text's fade, and a background painted on the panel fades with
it — at the midpoint of a handoff it measured 0.07 and the frame came through
almost undimmed. The band is also switched off under reduced motion, where row 3
is chapter II's photograph rather than chapter I's text and it would paint a panel
of ground straight over a picture.

**The two notes are hidden where the pin is running.** They are a two-column
device, and stacked they become four more blocks of small type under an already
tall pinned view. Keeping them costs ~210px, which at 390x844 comes out of the
photograph: 207px wide with nothing to spare against 242px with room. They are
restored with JS off or reduced motion on, where the layout is static and as
tall as it likes, so this is never the only route to the content.

## Fallbacks

| state | behaviour |
|---|---|
| no JS | four chapters in normal flow, photo beside text, all notes |
| reduced motion | identical; `pin()` returns early and never writes `--d` |
| narrow + either | one column, two rows per chapter, notes restored |

Every custom property the script writes needs a rest state in the reduced-motion
block, **not only the ones with a visible animation attached**. The since-removed
`--enter` had no animation of its own; left at its CSS default of 0 it meant
`translateY(72svh)`, and it parked all four frames 648px below their row.

None of the four images is lazy. They occupy one cell, so a swap has nowhere to
load from — a lazy frame reaches its turn undecoded and the curtain rises on
nothing. It also makes the section uncapturable: a full-page screenshot never
moves the layout viewport, and three of the four stayed at `naturalWidth 0`.

## Photography

Four Pexels frames, all delivered 1200x1800, cropped to 3:4 and graded per
frame. Nothing already on the site was reused — every good photograph in
`assets/img/` is on screen somewhere else, and `about-craft.jpg` is this page's
own opening.

| chapter | id | subject |
|---|---|---|
| I — the teppan | 36131817 | oil poured onto a flaming teppan |
| II — the hand | 30682797 | a blade mid-cut on a wooden counter |
| III — the ingredient | 9424913 | wagyu nigiri on a stone rest |
| IV — the room | 36338002 | an empty dining room under woven lanterns |

The grade is in two parts, and this is the part worth keeping: the character of
each frame (contrast, saturation, warmth, vignette) is set by eye, but its
**level is solved, not eyeballed** — a gamma is bisected per frame until its mean
luminance lands on a target. Hand-tuning black points until four frames look
level produced a 49-to-99 spread on the first pass; each of them looked right
alone, which is exactly the failure mode. Aims are 78 / 62 / 84 / 68, a
16-point spread against the 50 they arrived with, and deliberately not identical
— a wide night interior forced to the same mean as a lit macro of one nigiri has
been pushed somewhere it does not want to go.

Full arithmetic and the reproduce command are in `bake-about-chapters.py`.

## Copy, and what is invented

No number appears anywhere in this section, deliberately. `.figures` above it
already carries four invented counts that CLAUDE.md records as placeholder, and
doubling that with invented sourcing or timing claims makes more to unpick.

What is asserted is posture — how the cooking is arranged and what the guest is
facing. **All of it is written, none of it is supplied**, and one claim is
checkable: the counter, which the statement section already claims and which
CLAUDE.md already flags. Chapter IV's "seated facing the work" and "conversation
runs across the counter" both stand or fall with it.

Titles: I — The teppan / *Cooked in Front of You*; II — The hand / *Nothing
Hurried*; III — The ingredient / *Chosen, Then Left Alone*; IV — The room / *An
Evening, Not a Meal*.

## Tools added

- `fetch-pexels.mjs` — puppeteer straight at the image URL, `response.buffer()`.
  Pexels blocks curl and `images.pexels.com` blocks cross-origin fetch from
  `pexels.com`. What lands is AVIF whatever the `.jpeg` says; `sips -s format
  jpeg` before anything else touches it.
- `bake-png-to-jpeg.mjs` — sibling of `bake-png-to-webp.mjs`. Canvas re-encode
  through the Chrome puppeteer ships, ~half the file size of `sips` at the same
  nominal quality.
- `shoot-chapters.mjs` — `screenshot.mjs` cannot capture this section.
  Full-page uses `captureBeyondViewport`, which never moves the layout viewport,
  so the observer never fires and the frame shoots empty. This scrolls for real
  to a given `p`, waits two rAFs, and shoots the viewport.
