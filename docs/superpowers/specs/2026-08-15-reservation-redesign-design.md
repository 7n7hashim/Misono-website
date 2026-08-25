# Misono — Reservation section, rebuilt

**Date:** 2026-08-15
**Scope:** `.reserve` replaced in `index.html`, then re-copied byte-for-byte into
`menu.html` and `about.html` under the existing re-copy contract. The three pages carry
one reservation design, not three.
**Reference:** `assets/img/inspooooo.png` (1536×1024, exactly 1.5:1, supplied by the user).
**Supersedes:** the composition in `2026-08-10-reservation-section-design.md`. That
document's *purpose*, its WhatsApp mechanism and its one-screen technique all stand; its
layout, its sentence-case heading, its contained blob and its four supporting items do
not. Read it for the reasoning behind the CTA; read this for what is on the page.

## What changed and why

The user supplied a new comp and asked for the reservation experience to be one thing
across the whole site. Three things in the old section are gone: the contained blob
photograph, the four supporting items, and the sentence-case heading.

## Measuring the reference

`measure-reserve-ref.mjs` in the project root prints everything below. There is no
ImageMagick and no canvas module on this machine, so it reads pixels through the Chrome
puppeteer already ships — the same arrangement as `bake-png-to-webp.mjs`, and it must be
run from the project root for the same reason.

Everything is a share of the frame, never a pixel: the comp is 1536 wide and will be read
at widths it was never drawn at.

### The ground and the ink

| role | comp | what ships | why |
|---|---|---|---|
| ground | `#FEFDFA` | `--ground #F7E8DF` | see below |
| heading | `#100400` | `--menu-ink #2F1B19` | 13.6:1 on peach |
| body | `#4D3427` | `--menu-body #63504A` | 6.3:1 |
| accent / seal | `#B35F40` | `--menu-accent #99551C` | 4.8:1; the comp's value is 3.1:1 |
| button border | `#BE754C` | `--res-gold #AC7634` | 3.26:1; the comp's value is 2.7:1 |
| curve hairline | tan, ~1px | `--res-hair #D4AD7E` | decorative, no minimum applies |

A first reading of the hairline as **white** was wrong, and worth recording because the
pixels supported it: scanning across the boundary catches a pure `#FFFFFF` pixel
immediately outside the photograph. That is the lit gap *between* the tan line and the
photo edge, not the line. Zoom in and the stroke is plainly tan. Sample a curve at one
row and the reading can be exactly backwards.

**The ground stays on the peach.** The comp's ivory is a fourth of a stop off white, and
adopting it would do two things this site has already decided against: put a hard seam
against the ending block that sits directly below the section on all three pages, and
introduce a second ground, which CLAUDE.md permits only for a full-viewport photograph.
The peach *is* the light, warm, generous ground the brief asks for. Contrast is
re-derived against it rather than carried across from the comp, per the standing rule —
two of the comp's four values fail on peach.

### The S-curve

The photograph is **full-bleed to the top, right and bottom edges**. Verified rather than
assumed: sampling the rightmost column at sixteen heights returns no ground pixel at any
of them, and the top and bottom rows are photograph from 76.37% and 91.02% across.

Its left boundary is a two-lobe gourd, not a blob:

| y (% of height) | photo's left edge (% of width) |
|---|---|
| 0 | 76.37 |
| 6.25 | 67.77 |
| 12.5 | 63.54 |
| **23.44** | **61.52** ← upper lobe extreme |
| 29.69 | 62.04 |
| 35.94 | 63.15 |
| **39.26** | **63.61** ← the tongue's tip |
| 41.99 | 62.50 |
| **42.38** | **58.27** ← its underside: 3.3% of width in 0.19% of height |
| 43.55 | 55.34 |
| 45.31 | 52.73 |
| 50 | 48.63 |
| 56.25 | 45.64 |
| **67.19** | **43.68** ← lower lobe extreme |
| 75 | 44.60 |
| 82.81 | 47.85 |
| 89.06 | 53.19 |
| 93.75 | 59.96 |
| 96.88 | 67.51 |
| 100 | 91.02 |

**Two scanning mistakes produced a different shape, and both looked plausible.**

The first pass walked in from the right edge and broke on 40px of ground. The tan
hairline sits ~1.2% of the width (18px) outside the photograph, well inside that
threshold — so every number it returned was the *hairline's* position, not the
photograph's, shifted uniformly left. It looked like a clean table.

The second pass hit the opposite problem at y 40.6–43.8%: the lit plaster wall behind the
counter is close enough to the ivory ground that a loose threshold reads it as ground and
returns a point 20% deep inside the photograph. That left a gap in the data across
precisely the shape's one sharp feature, and Catmull-Rom bridged it with a control point
right of both its endpoints — a visible kink exactly where the cusp belongs.

The fix for both is in `measure-reserve-ref.mjs`: a tight ground threshold (±5 per
channel) and a 10-pixel run before the boundary is called.

**The feature at y≈42% is a cusp, not a curve.** The ground pushes a pointed tongue into
the photograph with its tip at x 63.61% / y 39.26%; its underside then falls 3.3% of the
width in 0.19% of the height. That tongue is the difference between a gourd and a lazy
ellipse, and it is the first thing a coarse sample destroys. The four points either side
of it are kept at full resolution in the generator's input.

**The hairline is tan, and it is not an offset of the photograph's edge.** Measured
against the photo edge row by row: it runs ~1.2% of the width outside it down the upper
lobe, converges through the lower lobe, **crosses at y≈60%**, is invisible from there to
y≈87%, then reappears and widens to 2.1% at the foot.

All three behaviours come free from drawing the ring **once, in full, and putting it
underneath an opaque photograph** — the occlusion is real rather than drawn. This is the
same construction the 2026-08-10 section used and the one part of it worth keeping. Do
not attempt to draw the visible portion as an offset curve.

### Left-column ink

Measured on the left 42% of the frame only, so the photograph never contributes.

| band | left | right | width | top | bottom |
|---|---|---|---|---|---|
| seal + rule | 6.51% | 19.40% | 12.89% | 7.62% | 10.35% |
| RESERVE | 6.32% | 26.82% | 20.51% | 18.46% | 23.54% |
| YOUR TABLE | 6.12% | 35.68% | 29.56% | 26.66% | 31.64% |
| rule | 6.71% | 9.24% | 2.54% | 35.55% | 35.64% |
| body (3 lines) | 6.64% | 30.14% | 23.50% | 39.75% | 47.17% |
| button | 6.71% | 27.15% | 20.44% | 52.73% | 58.89% |
| meta icons | 6.84% | 25.59% | 18.75% | 66.21% | 68.85% |
| meta labels | 6.84% | 29.36% | 22.53% | 70.70% | 71.68% |
| meta values | 6.90% | 33.85% | 26.95% | 73.63% | 77.34% |

Left margin is 6.5% of width throughout — the 0.2–0.4% spread across the bands is
side-bearing, not a design. Heading line pitch is 8.20% of height on a 5.08% cap.

**Clearance between column and photograph, at the tightest point:** the meta values end
at 33.85% and the lower lobe reaches 43.88% at the same height — 10% of the width of
clear ground. That is the breathing room the brief asks for, and it is a measurement, not
a guess. Nothing in the left column may grow past 35.7% of the width.

## Composition

### Heading case

**All caps, against the 2026-08-10 spec's explicit sentence-case decision.** That decision
was made to hold the convention `.dish__title` and `.menu` establish, and it was the right
call at the time; the user has since supplied a comp in caps and asked for it. Recorded
here as a deliberate reversal on instruction, not an oversight, so nobody restores it.

Sized by **ink width, not font-size**: `YOUR TABLE` must measure 29.56% of the section
width. Cormorant Garamond runs about 21% narrower than the didone the comp is set in, so
matching the comp's font-size lands the line short by roughly a fifth. Solve the size
against the measured width in the browser.

### Vertical placement

The comp's left column runs 7.62% → 77.34% of the height and leaves the bottom 22.66% to
a vertical Japanese lockup and a contour-line texture. **Both were dropped** — the user
selected only the full-bleed S-curve from the comp's flourishes. So the column is
**re-centred on the section's own vertical axis** rather than pinned to the comp's
y-positions, which would otherwise leave a fifth of the section empty at the foot and
read as an unfinished page. Internal pitches are the comp's; the block's position is not.

### One viewport

Same aspect-locked technique the section already uses, re-derived for the new block.
Every desktop length is a multiple of one unit. **As built:**

```css
--u: max(8.6px, min(1vw, 1.62svh));
```

1u is 1% of the comp's width. The left column measures **48.1u** of ink — the comp's
69.72% of height plus the sub-label this build adds, at 15.36px per unit. Capping `--u`
against `1.62svh` is what holds that block inside 78% of the viewport height. It clears
the screen by re-scaling the whole block with every measured ratio intact, never by
compressing the vertical rhythm — the one move that reads as cramped.

**Centred by `align-items: center` on the section, not by `top: 50%` with a
`translateY(-50%)`.** A transform moves the paint but not the layout box, so the
translated version left the section's `scrollHeight` 240px past its `clientHeight` — and
that reading is exactly the evidence used to prove nothing is being clipped by
`overflow: hidden`. Centring in flow keeps the check honest.

The photograph needs no such arithmetic: it is full-bleed and its clip is expressed in
fractions of its own box.

Below roughly 640px of viewport height the 8.6px floor takes over and the section is
allowed to run past one screen rather than shrink the body copy out of legibility.

### Tablet

The phone's `clamp()` ceilings are all reached well before 820px, so type that fills a
390px screen fills less than half of a tablet and strands ~400px of bare ground down the
right flank. Every ceiling is raised in proportion between 640px and 999px, so the block
is the same rhythm read larger. **Scaled, not centred** — centring would break the
left-aligned editorial column the comp is built on, and that column is the section.

### Mobile

Not held to one screen. The section stacks and **the photograph leads** — it is the
argument for booking, and the heading reads better once the room has been seen. This is
the order the existing section already uses when stacked. The curve moves to the bottom
edge of the photograph so the shape still reads as a cut arch rather than a rectangle.

## Building the curve

Two `<clipPath clipPathUnits="objectBoundingBox">` paths and one stroked `<path>`,
defined **inside the section's own markup**. Inside, not in the page's sprite sheet: the
markup is copied byte-for-byte to two other pages, and a copy that reaches out to a
`<defs>` block elsewhere on the page is a copy that breaks silently on arrival. Dropping
the mon removes the section's last such dependency (`#mm-petal`, `#mm-core`).

- `objectBoundingBox` units mean the curve is expressed as fractions of the figure's own
  box, so it stretches with the section and the bleed to all three edges is exact at any
  aspect. The comp is 1.5:1; a laptop is 1.6:1 to 1.84:1, and the lobes flatten
  accordingly. That is acceptable — the shape is organic and has no correct aspect.
- The hairline is a separate `<path>` on the same coordinates with
  `preserveAspectRatio="none"`, so **clip and hairline distort identically** and cannot
  fall out of register. Two curves a few pixels apart read as misregistration, not as an
  offset — the old section's phone breakpoint already documents this failure.
- `vector-effect: non-scaling-stroke` on the hairline, so the stroke stays 1.4 CSS px
  under a non-uniform stretch that would otherwise make it thick on one flank and thin on
  the other. (Note: this is the one property that stroke width genuinely needs. It has
  nothing to do with dash length — see the experience section's note.)

Desktop and mobile use different paths, swapped at the breakpoint.

### Motion

One slow ambient drift on the photograph *inside* the clip — `transform` only, in the
manner of the hero's `drift`. The mask stays still and the room moves within it, which is
the cheaper and better-looking half of what the old section animated. Disabled under
`prefers-reduced-motion`, along with the CTA's transitions.

## Content

### Copy

Eyebrow: `RESERVE`, tracked caps, `--menu-accent`, with a short hairline rule beside it —
taking the slot the comp's blossom seal occupies. The mon is dropped.

Heading: `RESERVE YOUR TABLE`, two authored lines.

Body, three lines, keeping Misono's existing voice rather than the comp's generic
placeholder:

> A counter, a season, and a chef who decides the order. Tell us when you would like to
> sit and how many are coming — the evening is arranged from there.

### The CTA

Label `RESERVE NOW` with a trailing arrow, in an outlined rectangle at 20.44% of width,
`--res-gold` border, `--menu-accent` label.

**The href, the target and the pre-written message are untouched.** The mechanism is
still WhatsApp and still `wa.me/254700000000?text=…` with the message already composed.
Only the control's appearance changes.

The sub-label sits **beneath the box, not inside it**. Inside, it makes the button two
lines and the comp's clean single line is lost; beneath, the button matches the comp
exactly and the guest still learns where the tap goes before making it.

Hover keeps the ink wipe (`::before { scaleX(0) → scaleX(1) }`, 520ms) the rest of the
site uses, so the control moves like everything else on the page. Focus-visible and
active states are required, per the project's standing interactive-state rule.

### The meta row

Two items with hairline divider, replacing the old four:

| | |
|---|---|
| **OPENING HOURS** | Mon – Sun · 12:00 PM – 11:00 PM |
| **LOCATION** | Nairobi & Mombasa, Kenya |

Hairline-stroke icons (clock, pin) at the weight the section's other drawn lines use.

### Photograph

`assets/img/reserve-interior.jpg` — the frame already in the slot. A dim Japanese dining
room: dark wood tables, ceramic dishes, vermilion lacquer cups, warm pendants, shoji
behind. No new asset is sourced.

**As built, it is graded in CSS rather than re-baked.** The file measures **62 of 255** —
the floor of the chapters band, which is where a lit macro belongs, not a wide interior —
and it was levelled for the old contained blob, which showed a fraction of the area the
full-bleed frame does. Lifted to **~78**, the band this room's subject sits in:

```css
filter: saturate(1.08) contrast(0.94) brightness(1.18);
```

`contrast()` **before** `brightness()`, and **below 1**: contrast pulls toward 128, which
opens the shadows and pulls the pendants back from the ceiling before the lift multiplies
them. `brightness()` alone at the 1.26 the same mean requires clips both lamps to flat
white discs. Verified at 78.7 as painted, measured off the render rather than the file —
`shoot-reserve.mjs` prints it on every capture, so the next change to this filter is
checked rather than guessed.

`object-position: 50% 42%`. Note that the X component does almost nothing here: the file
is 0.888 portrait and the desktop frame box is near 1:1, so `cover` scales to width and
nothing is cropped horizontally. Only Y is doing work.

No scrim. The room is the reason to book, and veiling it would be self-defeating.

## Rollout across the three pages

`index.html` is the source. `menu.html` and `about.html` carry byte-for-byte copies of
the reserve and ending blocks; the copies are never edited.

1. Rebuild `.reserve` in `index.html` — CSS and markup.
2. Re-copy both blocks into `menu.html` and `about.html`.
3. Re-derive the line ranges in the two `diff` verification commands in CLAUDE.md. They
   will shift, and a stale range makes the verification pass while comparing the wrong
   text — worse than no verification.
4. Confirm the expected deltas and nothing else: `menu.html` two (one blank line, one
   `prefers-reduced-motion` / `scroll-behavior` block), `about.html` none.

The peach adaptation blocks at the foot of `menu.html` and `about.html` are re-checked
against the new section, and kept in step with each other. Any new ground adaptation goes
in those blocks, never in the copies.

`--res-hair` and `--res-gold` are declared inside `.reserve` itself, so the copies remain
self-contained. If the rebuilt section starts using a token role a page has not used
before, check that page's `:root` actually carries it — this has failed silently twice on
`about.html` already.

## Placeholders — pending real content

Carried forward from the old section, plus two new:

| Placeholder | Where | Status |
|---|---|---|
| `+254 700 000 000` | the `wa.me` href | unchanged, still invented |
| Mon – Sun, 12:00 PM – 11:00 PM | the meta row | **new** — user-supplied, unverified |
| Nairobi & Mombasa | the meta row | **new** — user-supplied; supersedes CLAUDE.md's "Nairobi assumed", and asserts two locations |

Both new items are claims a guest can hold the restaurant to. They go on CLAUDE.md's
pending-content list beside the phone number so all three are swapped in one pass.

Removed from the site entirely by this change, and therefore no longer pending: counter &
table seating, parties up to eight, dinner Tuesday–Sunday, a reply within the hour.

## Out of scope

- Any change to the ending block, beyond re-copying it unchanged.
- Any change to the hero, menu, gallery, dish or about sections.
- A booking form, availability calendar or reservation integration. WhatsApp remains the
  entire mechanism.
- Sourcing a new photograph.
- The comp's vertical Japanese lockup and contour-line texture.

## Verification

Served from `http://localhost:3001` — port 3000 belongs to another project on this
machine, confirmed by its `<title>`. `screenshot.mjs` is the wrong tool: it shoots full
page, so the section lands three viewports down a tall PNG where the only thing that
matters cannot be read. Two tools were written instead, and both live in the project
root:

- **`node shoot-reserve.mjs [page] [width|preset] [height]`** — scrolls the section to
  the top of the viewport, shoots it, and prints `--u`, fit, copy-column clipping, both
  heading lines as a share of width against the comp, and the photograph's mean luminance
  as painted.
- **`node compare-reserve.mjs [width] [height] [page]`** — the band-by-band gap table and
  the S-curve, both against the comp's own measurements.

Two traps they encode:

- **Scroll with `behavior: 'instant'`, positioned via `getBoundingClientRect`, never
  `offsetTop`.** `.reserve` is `position: relative`, so `offsetTop` is not a document
  coordinate and the capture lands on a different section entirely; and the page sets
  `scroll-behavior: smooth`, so a plain `scrollTo` is still easing when the shutter
  fires. Both produce a perfectly sharp screenshot of the wrong thing.
- **`scrollHeight > clientHeight` is not a clipping test here.** The photograph drifts
  inside a mask that holds still, so it always overruns its box by ~6px and the section
  always reports overflow. Test the copy column's rect against the section's.

### Results

| check | target | result |
|---|---|---|
| `RESERVE` ink width | 20.51% of section | 20.49% |
| `YOUR TABLE` ink width | 29.56% | 29.67% |
| worst band-gap error | — | **0.19u** (2.7px at 1440) |
| worst S-curve error, 1440×900 | — | **0.64%** of width |
| worst S-curve error, 1512×820 | — | **1.17%** of width |
| photograph as painted | the 64–84 band | 78.7 |
| fits one screen, nothing clipped | all | 1000×700, 1280×720, 1366×768, 1440×900, 1512×820, 1600×900, 1920×1080, 2560×1440 |
| left column clear of the photograph | ≥ 0 | 9.9% of width at the tightest point |

Contrast re-derived on the peach: heading 13.6:1, body 6.3:1, accent 4.8:1, border 3.26:1
as a non-text boundary, and the CTA's hover state 13.6:1 peach-on-ink. Reduced motion
kills the drift and every transition. The `wa.me` href, its pre-written message and
`target="_blank"` are byte-identical to before.

All three pages verified, not just `index.html`. `temporary screenshots/` emptied at the
end.
