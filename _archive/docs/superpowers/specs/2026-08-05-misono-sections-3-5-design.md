# Misono — sections 3–5 and the footer

Date: 2026-08-05
Reference: `assets/video/design pages vid.mp4` (7.7s screen recording, studied at 5fps)

## What the reference is

The video picks up exactly where Misono's gallery strip already ends, and runs four
blocks:

1. **EXQUISITE FLAVORS** — full-viewport near-black stage. A large warm dish photograph
   crosses the frame on a diagonal, its edges dissolved into the background so it floats
   rather than sits in a box. Fine dust specks over it. Centred: serif caps heading →
   short hairline rule → two-line paragraph → hairline-framed `LEARN MORE`.
2. **ROLLED TO PERFECTION** — the same head pattern pinned near the top of the section,
   with an enormous chopsticks-and-roll close-up rising from the bottom edge and
   travelling past the text more slowly than the scroll. No CTA.
3. **RESERVE YOUR TABLE** — two-line heading, then a form roughly 768px wide:
   `Name|Phone`, `Email|Date`, `Time|Seats`, a full-width `Message`, and a centred
   hairline `BOOK TABLE`. Fields are square-cornered, filled a shade above the page,
   with ash placeholders. Fields visibly light up staggered, left column before right.
4. **Footer** — the wordmark set enormous at roughly 4% opacity and clipped by the footer
   box, `MENU ABOUT CONTACT` beneath it, then a tiny copyright.

Every block fades up with the rule and paragraph lagging the heading. Every photograph
moves slower than the scroll. There is no navigation below the hero.

### Measurements

The recording is 1024×576 of a ~1890px viewport, so frame pixels × 1.875 ≈ real pixels.

| Element | Frame | Real | Notes |
|---|---|---|---|
| Section heading cap height | 26px | 48.8px | 2.58% of viewport — see note below |
| Heading tracking | — | — | width/char ÷ cap = 1.050; Misono's is 1.072 at `.22em` |
| Divider rule | ~22px wide | ~41px | hairline, centred |
| Form column | 410px | ~769px | ⇒ **`48rem` max-width** |
| Field height | ~28px | ~52px | square corners |
| CTA box | 105×22px | ~197×41px | 1px hairline, transparent fill |

## Why this extends the existing system rather than introducing one

`.beyond-title` / `.beyond-rule` / `.beyond-copy` / `.gal-cta` **already are** the
reference's head pattern — Marcellus caps at `.22em`, a 28px hairline in gunjō, Jost 300
at 13px/1.95, and a hairline box that fills ivory on hover. The measured heading above
(~41px at 1440) lands in the same tier as `.beyond-title`'s 44px.

So the new sections reuse those declarations by **adding selectors to the existing
rules** (`.beyond-title, .sec-title { … }`) rather than copying values into new rules or
refactoring the old ones. `.beyond` renders identically, and the two can never drift.

**On heading size.** The reference's headings measure 2.58% of viewport width against
Misono's 2.22%, which reads as "go bigger". Measuring its hero wordmark settles it: that
is a script face at 7.34% of viewport, so its section heading is 0.35 of its wordmark
where Misono's is 0.67 of its own. Relative to the lockup it has to stay under, Misono's
44px is already the larger of the two. Size left alone; the measure and leading of the
copy were what actually needed correcting.

## Sections

### §3 `.omakase` — "Omakase, entrusted"

- `min-height:100svh`, flex column, content optically centred.
- The loin bleeds off the top edge with the slate running empty beneath it, so the lockup
  sits in the dark with the warm form directly above.
- Feathered top and bottom only (4.5%), never the sides — the reference's frames run clean
  off all four edges, and a side feather reads as a vignette.
- A dust field: a small tiled radial-gradient layer at low opacity, drifting.
- Head pattern + hairline CTA `Discover omakase`, reusing `.gal-cta`'s frame-and-fill.
  Measured at 5.03:1 against the brightest pixel behind it.
- Parallax at `0.55` of the available bleed.

### §4 `.craft` — "Cut with intention"

- `min-height:165svh` — the reference spends real scroll on this image, and the section
  needs runway for the photograph to cross the type.
- Head sits high; the frame starts at `34svh` and runs to the section's foot, so it is
  under the type from the moment the type arrives. Anchoring it to the foot instead left
  the whole first viewport empty.
- Baked portrait: the box is taller than it is wide even on a desktop.
- Long fades at head and foot (17%/20%) — it begins mid-section, and its foot fade is what
  carries the frame over the join into §5.
- Parallax at `1`, the full bleed. No CTA.

### §5 `.reserve` — "Reserve your table"

- Heading breaks to two lines by design (`max-width` on the heading, not a `<br>`).
- `<form>` at `max-width:48rem`, two columns collapsing to one below 768px:
  `Name|Phone`, `Email|Date`, `Time|Seats` (`<select>`), `Message` (full width).
- Fields: `--kon` fill, `1px solid rgb(237 231 220 / .12)`, no radius, Jost 300,
  placeholders in `--hai`, `:focus-visible` moves the border to `--gunjo` with an ivory
  outline at `2px` offset.
- Labels present and visually hidden — placeholders are not labels.
- Selects get a CSS-drawn chevron; `appearance:none` with an explicit background so the
  native control cannot reintroduce a system look.
- `Book table` uses the `.gal-cta` treatment, centred.
- No `action` — the endpoint is a placeholder, marked in the markup beside the others.
- §4's photograph is **not** repeated here. A second copy faded in from the top of this
  section put a hard edge across the join (the two crops do not line up); `.craft`'s long
  foot fade carries it instead.

### Footer `.foot`

- The hero lockup enlarged — same uppercase, same `--track` — at `opacity:.06`, clipped by
  the footer box. A watermark, not a heading: at 6% it carries no typographic weight and
  cannot compete with the hero lockup. Mixed case read as a second wordmark.
- `MENU / ABOUT / CONTACT` at the hero nav's exact 10.4px / `.26em` / `--shirogane`.
- `© 2026 MISONO` in `--hai`.

## Motion

All animation is CSS. `site.js` only adds classes and writes one custom property.

- **Reveal.** One `IntersectionObserver` (threshold 0.2, `rootMargin` trimming the
  bottom) adds `.is-in` to each block. Inside, `--d` sets the delay: heading 0ms, rule
  140ms, copy 260ms, CTA 380ms. Transform is `translateY(8px) → 0` with opacity, 1100ms
  on the project's `cubic-bezier(.16,1,.3,1)`, and the heading's tracking opens
  `.20em → .22em` over 1400ms. Both numbers were measured off the recording frame by
  frame: its headings rise ~5.6px and widen 2.4% while brightening from a third to full.
- **Form stagger.** Fields carry `--d` at 60ms increments in DOM order, which reproduces
  the reference's left-before-right lighting.
- **Parallax.** A single `scroll` listener, rAF-batched, writes `--p` on each registered
  element; CSS consumes it as `translate3d(0,var(--p),0)`. `data-parallax` is a *fraction
  of `--bleed`*, and `--bleed` is read off the DOM, so the travel can never exceed the
  amount the frame is oversized by — otherwise the photograph's own edge slides into the
  section. All rects are read before any style is written.
- **Only `transform` and `opacity` animate.** No `transition-all`.

### Static state

`.no-anim` — set by `site.js` under `prefers-reduced-motion` **or** `navigator.webdriver`,
exactly as the hero does — renders every block in its final revealed state and disables
parallax. This differs from the hero deliberately: the hero's static state is scene 1's
still, but these sections have no meaningful "before" state, and screenshots must show
the true composition. Content is also fully visible with JS disabled, since `.is-in`
only ever *adds* the finished state.

## Imagery

**Two** photographs, not four — the reference uses exactly two across these sections, and
adding more would be adding to it. Each ships in a wide and a tall crop, so four files.

Both come from one shoot (Pexels 3296276 / 3296280): the same salmon loin, slate and
light. Two unrelated stock frames read as two stock frames however good each is alone;
one shoot read across two sections reads as a restaurant that photographed its own food.
The crops are deliberately unalike — a still form, then two hands and a blade — so the
shared source buys cohesion without repeating a picture.

Per the project's grade-at-encode-time rule, each is cropped and graded with ffmpeg
before it ships; the CSS mask only shapes the edge. A new `bake-scenes.sh` sits beside
`bake-gallery.sh` and regenerates them from originals, printing the same `YAVG`/`U`/`V`
numbers so changes are judged by measurement.

Two crops per scene — wide for ≥768px, tall for below — matching the hero's breakpoint so
a viewport never downloads the wrong one.

## Out of scope

Hero and `.beyond` are not touched. No navigation is added below the hero (the reference
has none). The form does not submit.

## Implementation order

1. Source and bake the four scenes; write `bake-scenes.sh`.
2. Extend the shared head-pattern selectors in `index.html`'s stylesheet.
3. `.omakase`, then `.craft`, then `.reserve`, then `.foot` — CSS and markup per section.
4. Reveal + parallax in `assets/site.js`.
5. Screenshot at 1440×900, 1920×1080, 820×1180, 390×844; compare against reference
   frames; correct; re-screenshot. At least two rounds.
6. Update `CLAUDE.md` with the rules this work establishes.

## Verification

- Composition matches the reference at desktop, tablet and mobile across ≥2 rounds.
- `.beyond` and the hero are pixel-unchanged.
- Reveals and parallax are visible with `?anim=1`; the static state is complete without it.
- Form is keyboard-navigable with visible focus on every control.
- CTA label contrast ≥ 4.5:1 against whatever passes behind it.
