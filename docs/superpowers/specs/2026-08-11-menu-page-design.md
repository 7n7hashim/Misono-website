# Misono — Menu page design

**Date:** 2026-08-11
**Deliverable:** `menu.html` (new). `index.html` modified only to point its two
"Explore Menu" buttons and its footer "Menu" nav link at the new page.

## Reference

`assets/img/menu isnpo.jpeg` — a scroll capture of a dark restaurant page: a
centred title with four photographs floating around it. Adapted to a light warm
cream ground, and to Misono.

## Measurement

Taken off the reference as a share of viewport width (capture frame ≈ 1295px
wide), because a video capture and a 1440px screenshot cannot be compared in
pixels.

| element | reference | menu.html |
|---|---|---|
| frame width | 17.0–17.2% of W | 17.1% |
| frame aspect | ~3:4 portrait | 3:4 |
| upper pair inset from edge | left 3.5%, right 3.9% | same |
| lower pair inset from edge | left 7.3%, right 2.5% | same |
| vertical gap, stacked pair | 83px = 6.4% of W | 6.4% |
| right column drift, upper | 28px = 2.2% of W lower | 2.2% |
| right column drift, lower | 42px = 3.2% of W lower | 3.2% |
| display size | ~66px at W=1295 = 5.1% of W | 5.1% |
| display leading | 60px on 66px = 0.91 | 0.92 |
| eyebrow rule | 32px = 2.47% of W | 2.47% |

The finding that matters more than the numbers: **the lower pair is not aligned
to the upper pair.** The left one is inset further (7.3% vs 3.5%), the right one
less (2.5% vs 3.9%), so the whole bottom row shifts right — and the right column
hangs lower than the left in both rows. This is what stops the composition
reading as a grid, and it is the single most important thing to reproduce.

## Vertical construction

The reference is a phone capture cropped at the bottom: its lower two frames run
off the end of the image, so where its section began and ended cannot be
recovered from it. **The heading is therefore centred on the viewport**, per the
brief, and the field is built symmetrically outward from that centre line:

| | offset from centre, share of W |
|---|---|
| upper pair bottom | −3.2% |
| lower pair top | +3.2% |
| so upper top / lower bottom | −26.0% / +26.0% |

That places the measured 6.4% stacked gap straddling the centre line exactly.

Captions hang under the lower pair only, and the right column drifts down, so
the raw field runs 26.0% up and 31.8% down — bottom-heavy. The whole frame set
is lifted by half that difference, **2.9%**, which balances the margins above and
below while leaving the heading itself on the centre line. That is the only
reason the four vertical offsets are not round numbers:

```
UL  top: calc(50% - var(--W) * 0.289)
UR  top: calc(50% - var(--W) * 0.267)
LL  top: calc(50% + var(--W) * 0.003)
LR  top: calc(50% + var(--W) * 0.035)
```

No scroll cue. With the heading on the centre line, anything below it in the
same column reads as part of the heading and breaks the symmetry.

## Fitting one viewport

Half the field is 28.9% of W, so what must clear the window is that much above
the centre line and the same below, plus padding. Solving at 900px high gives
W = 1440 exactly:

```
--W: min(100vw, 160vh)
```

Every size is a share of `--W`, so the block scales as one unit and the internal
rhythm never compresses; positions are a share of the **viewport**, so the frames
inset from the true window edge as the reference's do. Measured result: frames
hit 17.1% dead on at 1024×768, 1280×800, 1440×900 and 1680×1050, and the heading
sits at offset 0.0px from the viewport centre at every desktop width, with
margins balanced to within 4px.

The title box is 48% wide, not 52%: the binding constraint is the lower-left
frame, inset furthest at 7.3% and so reaching furthest into the centre.

## Palette and type

Type is taken from `index.html` unchanged: Cormorant Garamond 300/400 display, Jost
300/400 utility.

The ground is a muted peach, `--ground #F7E8DF` — `hsl(22, 58%, 92%)`. Three numbers
keep it from going cheap: hue held at 22 (apricot, not the pink of hue 12 or the tan
of 34), saturation capped at 58 so it reads as a tint of paper rather than a colour,
and lightness at 92 — low enough to be unmistakably peach next to white, high enough
to stay a ground rather than a surface.

> **Amended 2026-08-11.** As written, this section said the ground *diverged* from the
> homepage, which sat on `--cream #FCF8F5`. It no longer does: the peach was taken
> across to `index.html` the same day and is now the ground for the whole site. The
> cream is gone from both pages. Everything below about deriving contrast against the
> peach applies site-wide, not just here.

Peach is darker than cream, which costs contrast, so the ink colours are **re-derived
against this ground rather than carried over**:

| token | cream value | on peach | why |
|---|---|---|---|
| `--menu-ink` | `#2F1B19` | unchanged, **13.6:1** | never at risk |
| `--menu-body` | `#6B5750` | **`#63504A`**, 6.3:1 | the cream value falls to 5.7 |
| `--menu-accent` | `#9A5C26` | **`#99551C`**, 4.8:1 | the cream value falls to **4.47 — fails AA** |

That is the whole of the typographic adjustment; nothing else moved. Geometry was
re-measured after the colour change and is byte-identical.

Two details the peach forced:

- **The bloom fades to transparent, not to `--ground`.** A flat peach across a full
  viewport reads as a swatch, so the centre is lifted by a warm near-white radial. It
  must fade to transparent: the ellipse is 85% of the box high and centred at 46%, so at
  900px tall the section's bottom edge only reaches 63.5% along the gradient — still
  mid-interpolation, and a level off the carte beginning immediately below. Fading to
  transparent lets the body's own ground show through, so edges match at every viewport
  rather than at the one that was measured. Verified by sampling rendered pixels across
  the boundary: max adjacent jump 3 levels, and it falls on grain rows, not the seam.
- **The footer gradient stops at `#F4E2D8`.** The accent is the footer link's `:active`
  colour, and by `#F3E0D5` it has fallen to 4.48:1. That is the darkest peach the foot
  can end on and still clear AA.
- **Frame shadows were carried up** (0.06 / 0.09 / 0.12 from 0.05 / 0.07 / 0.09). A
  darker ground swallows a shadow; at the cream opacities the frames read as pasted on.

## Images

Four, chosen as a set rather than picked individually. Top pair are the dark
anchors, bottom pair the light ones — the reference's own structure, and it
supports the title sitting high.

| position | file | caption | correction |
|---|---|---|---|
| upper-left | `hero-omakase-1717.jpg` | The Counter | contrast 1.03 |
| upper-right | `teppanyaki-flambe.jpg` | Teppanyaki | saturate 0.92, contrast 1.04 |
| lower-left | `chirashi-plate.webp` | Chirashi | contrast 1.04, cropped tight to the bowl |
| lower-right | `gallery/food7.jpg` | Sashimi | saturate 0.88, contrast 1.03, brightness 0.98 |

Corrected per frame, not on one shared curve — they were shot under different
light. No scrim over any of them; each carries a layered ember-tinted shadow so
it reads as a print laid on paper.

The other seven dish photographs were rejected for this page: ungraded flash
snapshots with cluttered backgrounds, which read cheap against a cream ground.
They remain in use on the homepage where the dark ground carries them.

## Structure

1. **Composition** — full viewport, cream. Eyebrow and two-line display dead
   centre, four floating frames with captions around it, nothing else. No
   header: the reference has none, and anything in the top-left crowds the
   upper-left frame. Navigation lives in the footer.
2. **The carte** — same cream ground, no seam. Six courses in two columns:
   Omakase, Sushi & Sashimi, Teppanyaki, Small Plates, Dessert, Sake. Prices in
   KES. **All menu content is placeholder** pending real content from the
   client, and is marked as such in the markup.
3. **Reserve** — the homepage's reservation section, transplanted verbatim from
   `index.html` (CSS lines 997–1478, markup 2014–2114). Cream ground, WhatsApp
   CTA with the pre-written message, the mon, the photograph in its ring.
4. **Ending** — the homepage's closing footer, transplanted verbatim (CSS
   1480–1716, markup 2122–2134): the huge MISONO wordmark at 4.5% ink on cream,
   then Menu / About / Contact and the copyright.

### On the transplant

Both blocks are **byte-identical** to the homepage's, deliberately. Verified: 28
of 29 computed properties match exactly at 1440×900 (the 29th is the reserve
image at 680px vs 681px, sub-pixel rounding from document position). Three
edits, all intended:

- the copied ending carried a global `html { scroll-behavior: smooth }` that is
  not part of the component and that `menu.html` already sets;
- footer `Menu` gains `aria-current="page"`;
- footer `About` points at `index.html#beyond`, since `#beyond` does not exist
  on this page. `Contact` stays `#reserve` — that section now exists locally.

If either block needs to change, change it in `index.html` and re-copy. The
point of the transplant is that the two pages cannot drift.

The mon's `#mm-petal` / `#mm-core` paths live inside the homepage hero's `<svg>`
`<defs>`. This page has no hero, so they are repeated in a hidden sprite before
the reserve section — same paths, not a redrawing.

### The peach runs the whole page

Settled 2026-08-11: the transplanted sections are on peach too, so there is one
ground end to end and no cream on the page.

**Nothing in the copied blocks was edited to achieve it.** Both take their ground
from `var(--cream)`, so an adaptation block after the copies re-points that one
property at `--ground` and both sections move without a declaration changing.
The copies stay re-copyable from `index.html`.

Three things do not follow from that and are handled individually:

1. **`--res-gold` → `#AC7634`.** `index.html` picked `#B8813F` precisely because
   it clears 3:1 as a non-text boundary — but on cream it makes it by 0.18, at
   3.18:1, and that margin was not there to spend. On peach it falls to
   **2.81:1 and fails**. Darkened until it clears with room, 3.26:1. It bounds
   the WhatsApp button, which is why it matters.
2. **The ending's gradient tail is a literal**, so `--cream` cannot reach it. The
   homepage deepens its foot by exactly (−2, −3, −4) across the block; the same
   step is applied to the peach rather than a value picked by eye, giving
   `#F5E5DB`. Footer links sit at 6.2:1 at their dimmest.
3. **The wordmark needed no change**, which is worth recording because it looks
   like it should have. Its alpha is 0.045 and the homepage calls the resulting
   +9 luminance delta "the whole brief" — but that delta is (ground − ink) ×
   alpha, and ground − ink is within a few points of the same on both grounds.
   Measured: 9,10,10 on cream, **9,9,9 on peach**. Re-deriving it would have
   made it wrong.

`--res-hair` is untouched: only ever decorative here (the rule, the ring), so no
minimum applies, and on the button's dark hover state it still reads at 7.8:1.

Verified by sampling rendered pixels across all three section boundaries: max
adjacent jump 2, 0 and 1 levels, none of them falling on the boundary row.

Below 900px the four-around-the-title composition cannot hold. It becomes a
centred title with a staggered two-column pair below it — the drift is kept, the
grid is still refused.

## Out of scope

Real menu copy, prices, and the confirmation that the city is Nairobi. Street
address, phone and social links stay as they are on the homepage.
