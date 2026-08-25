# Misono — homepage ending section

Date: 2026-08-11
Reference: `assets/img/Home page ending.jpeg` (1320 x 619 crop)

> **Amended 2026-08-11 — the ground changed after this was written.** Everything
> below measures against `--cream #FCF8F5`; the site now sits on `--ground #F7E8DF`
> and the cream is gone. The measurements stand as the record of how the section was
> derived — do not read the hex values as current. What actually changed: the
> gradient tail `#FAF5F1` → `#F5E5DB` (same (-2,-3,-4) step, re-applied), and the
> body/accent inks were re-derived. **The wordmark's 0.045 alpha did NOT change** —
> the +9 delta is (ground − ink) × alpha, and that difference is within a few points
> on both grounds. Measured 9,10,10 on cream and 9,9,9 on the peach. See the peach
> adaptation blocks at the foot of `index.html` and `menu.html`, and CLAUDE.md.

## Job

The closing frame of the homepage. It sits directly under the reservation section
and carries three things: an oversized, near-invisible MISONO wordmark, the three
primary links, and a copyright line. Nothing else.

## Measured from the reference

The reference is a dark frame. Everything below is what was measured off it before
translating to Misono's cream.

| Quantity | Measured |
|---|---|
| Ground luminance | 7.7 |
| Wordmark ink width | 880px of 1320 = **66.67% of viewport width**, centred |
| Wordmark peak luminance | 16.7 → delta **+9**, i.e. ~3.6% white over the ground |
| Wordmark vertical extent | y 320–532 (212px) |
| Nav word runs | MENU 557–591, ABOUT 625–663, CONTACT 698–750 |
| Nav gaps | 34px and 35px → **even, 2.58% of viewport width** |
| Nav cap height | ~10px → font-size ~11px = 0.83% of width |
| Nav luminance | 254 hovered (MENU), ~110 resting |
| Wordmark bottom → nav top | 16px (1.21% of width) |
| Nav bottom → copyright top | 20px (1.52% of width) |
| Copyright luminance | ~50 → ~2:1 against the ground |

## Decisions

**Ground — cream, not dark.** The user chose to continue the reservation section's
`--cream` (#FCF8F5) rather than invert to the reference's near-black. The two cream
blocks meet with no rule and no border; an almost imperceptible vertical gradient
(#FCF8F5 → #FAF5F1) runs down the footer so the page settles into its close instead
of the two sections reading as one flat slab. Verified by measuring the PNG, not by
eye — a false seam and a JPEG artefact look identical in a downscaled crop.

**Wordmark — MISONO in Cormorant Garamond 300 at the hero's own 0.16em tracking**,
sized so its ink spans the reference's 66.67% of viewport width, horizontally
centred, warm ink at very low alpha. The reference's ghost is a *lighter* mark on a
dark ground; on cream it inverts to a *darker* one. Target the same perceptual
weight: a luminance delta of about 9 against the ground, tuned by measuring the
render rather than by choosing an alpha that sounds right.

The letterform is not redrawn. It is the wordmark already set in the hero
(`.hero__name`), at the same family, weight and tracking, including the
`margin-right: -0.16em` that cancels the trailing letter-space so the block centres
on its ink rather than on its box.

**Nav — Jost 300, uppercase, ~0.26em tracking, even 2.58vw gaps.** The reference
runs its links dim (lum ~110, about 3:1) and takes them to full white on hover.
That relationship is kept and the contrast floor is raised: resting `--menu-body`
(#6B5750, 6.5:1), hover `--menu-ink` (#2F1B19) with a hairline underline wiping in
from the centre. `focus-visible` gets a ring tinted from `--misono-indigo`;
`active` settles 1px. Only `transform` and `opacity` animate.

**Link targets — existing ids only.** The brief forbids modifying the sections
above, so no new `id` attributes were added to them. MENU → `#menu-heading` (the
only id the menu section owns), ABOUT → `#beyond`, CONTACT → `#reserve`. Each
target gets `scroll-margin-top` from this block so the landing is not flush to the
viewport edge. Swap to `/menu`, `/about`, `/contact` when those pages exist.

**Copyright — held at 6.5:1**, not the reference's ~2:1. It is real text.

**Height — `min-height: 72svh`**, content grouped in the lower-middle so the
wordmark / nav / copyright cluster keeps the reference's tight 16px / 20px rhythm
and the negative space accumulates above it. All three elements are sized in `vw`
with px floors, so the block scales as one piece and never needs scrolling —
consistent with the reservation section's one-viewport rule.

## Deviations from the brief, and why

- The brief asked for "cream/white typography". Cream type on a cream ground is
  invisible. Typography is warm ink instead. Forced by the cream ground choice.
- The brief's copyright is "understated"; the reference's is nearly unreadable.
  Understated is honoured, unreadable is not.

## Built — final measured values at 1440x900

Reference figures are its own, scaled to a 1440 frame where they are widths.

| | Reference | Built |
|---|---|---|
| Wordmark ink span | 66.89% of width | **67.29%** |
| Wordmark centre | frame centre | 718.5 of 720 |
| Wordmark peak delta | 11.0 over its ground | **9.59** — deliberately fainter, see below |
| Nav ink span | 14.77% of width | **14.72%** |
| Nav gaps | even, 2.58% of width | even, 35px = 2.43% |
| Wordmark → nav | 16px | **16px** |
| Nav → copyright | 20px | **20px** |
| Copyright → bottom | ~27px | 32px |

Three values needed correcting after the first render, all by measurement:

- `--end-mark` at 14.8vw put the ink at 68.26%; 14.59vw lands it.
- The line box was carrying 22px of half-leading under the caps, which walked
  the nav 47px down against a 17px target. `line-height: 0.653` — Cormorant's
  exact cap height — makes the box the ink, so every gap below is a real
  ink-to-ink measurement.
- Nav tracking was fitted to the reference's span and closed at **0.16em**, the
  hero wordmark's own value.

The wordmark is held at delta 9.59 rather than the reference's 11.0. Equal
luminance deltas do not read equally at opposite ends of the range, and on a
bright cream field the mark was already fully legible; the brief asks for
extremely subtle over faithful, so it stays on the fainter side.

Verified: no seam at the section join — the ramp falls 2.8 luminance across the
footer with no step above 0.85, measured, since a false seam and a JPEG artefact
are indistinguishable by eye. No horizontal overflow at 1440 / 1280 / 820 / 390.
Resting nav 6.41:1, hover 15.39:1, focus ring 7.37:1. Links are 21px of ink in a
44px tap target, expanded by an absolutely-positioned `::before` so the hit area
does not re-enter layout and move the measured gaps. Anchor navigation confirmed
to scroll, landing the target 45px below the viewport top.

## Revision, 2026-08-11 — wordmark enlarged

The user asked for a much taller wordmark with a strong vertical presence. The
first build matched the reference's width exactly (66.89%) and still read short,
and the reason is structural rather than a mistake in the measurement:

**The reference's wordmark is a script.** Ascenders and descenders make its ink
24.5% as tall as it is wide. Letterspaced caps have only cap height, so at the
same width they come out **14%** as tall. Matching the reference's width could
never match its vertical presence.

Reaching a 24.5% ratio with undistorted caps would need them 1595px wide on a
1440px screen. So width was spent to its limit and the remainder taken from the
block:

- `--end-mark` 14.59vw → **19.9vw**, running the ink to 93.6% of the viewport —
  as large as it goes while still reading as MISONO rather than a cropped M and O.
- `--end-stretch: 1.15` (1.22 on phones), a vertical scale anchored at the
  baseline. It thickens Cormorant's horizontal hairlines 15% against unchanged
  stems; at 4.5% alpha that is below the threshold of visibility. Anchoring at
  the baseline means the mark grows upward into the empty cream and the 16px gap
  to the nav holds without recalculation, and being a transform it stays out of
  layout so the flex column still measures the unscaled box.

Result: ink height **136px → 215px (+58%)**, vertical presence 21% → **33.2%** of
the block. The nav and copyright are untouched — both still measure 14.72% and
16px / 20px against the reference.

Two things this broke, both found by measuring:

- **The mark stopped centring.** At 93.6% it is wider than a 7.18%-inset content
  box, and an overflowing `nowrap` line does not centre — `text-align` puts its
  start at the content edge and runs the whole overflow off the end side, which
  walked it 54px right. The section gave up its inline padding (nothing else
  there comes near an edge; the nav carries its own inset), and the trailing
  letter-space is now corrected by `translateX(0.08em)` inside the transform,
  since the hero's `margin-right: -0.16em` trick cannot work when the width is
  what overflows.
- **Portrait tablets drained the presence.** The mark scales with width, the
  block scaled with height, and at 820x1180 that put a 123px mark in a 704px
  block — 17.5% against the desktop's 33%. `min-height` gained a `52vw` term,
  which binds only where the viewport is tall relative to its width; the svh
  term still wins at 1440x900 and 1280x720.

Verified after the change at 1440 / 1280 / 820 / 390 / 320 / 1920: presence
25.9–36.9%, no side or top clipping, no horizontal overflow, hover and anchor
scrolling unchanged.

## Out of scope

No new imagery. No changes to any section above the footer. Real page URLs, the
street address, and social links remain pending per CLAUDE.md.
