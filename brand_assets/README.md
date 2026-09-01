# Li's Chinese Restaurant — brand assets

## What is real

- **`lis-logo-official-150.jpg`** — the actual logo, downloaded from
  `lischineserestaurantnairobi.co.ke/logo.jpg` on 2026-08-26. It is the ONLY
  artwork obtainable: **150x150, JPEG, on an opaque white square**. Measured
  brand colours are red **#CD393E** and black **#1B191A**, and those are the
  values `--brand-red` and the mark's ink are taken from.

  At 150px it cannot be a hero wordmark and it cannot sit on a photograph.
  **Ask the client for vector artwork.**

## What is a reconstruction

- **`lis-mark.svg`** — the mark redrawn from that JPEG, and inlined into all
  four pages. **VERIFY IT AGAINST OFFICIAL ARTWORK BEFORE LAUNCH.**

  How it was made, because the method decides whether it is faithful:

  - **Ring.** The red pixels form an annulus at r 65–75.7px about (75,75) in
    the source. In a 100-unit box: `cx=50 cy=50 r=46.2 stroke-width=7.1`.
  - **Chopsticks.** Two tapered bars, handles at the top, tips at the bottom.
    A runs x=2.25 at the top to x≈26.6 at the bottom (slope 0.217), width
    5.3→2.4. B is near-vertical at x≈22.7, width 6→1.8. They cross at
    **y≈88**, low in the ring, which is what the source does.
  - **The `Li's` lettering is FITTED, NOT TRACED.** A Moore-boundary trace of
    the 150px glyphs produced visible staircase artefacts and would have
    shipped worse than either alternative. The letterforms are straight-edged
    wedges, so their edges were **least-squares fitted** instead: the L stem's
    left edge is `x = 0.0836y + 34.47` and its right `x = -0.0813y + 43.54`,
    residual **0.17 units**. The edges really are straight, which is why
    fitting beats tracing. The `s` is the one genuinely curved glyph and is a
    blurred trace with two Chaikin passes.

  Everything takes `currentColor`, so one file works white on a photograph
  and two-tone on the ivory.

- **`../assets/favicon.svg`** — the same mark, flattened: no `<use>`, no
  `currentColor`, since a tab icon inherits no CSS context. **An XML comment
  may not contain a double hyphen** — written the obvious way the file stops
  being well-formed and the browser shows a broken-image icon with a clean
  200 on the wire and nothing in the console. This file carries no comments
  at all.

## The wordmark

`LI'S` is set in Cormorant Garamond, not in the logo's own lettering. A 150px
raster cannot supply a 120px wordmark, and a typographic lockup is the honest
answer. Size and tracking are solved together — see `.hero__name` in
`index.html`; four glyphs enlarged on their own get big before they get wide.

## Superseded

Misono's artwork (`misono logo.jpeg`, `misono-mark.svg`,
`misono-mark-mono.svg`) is in `_archive/misono-bakes/`. It belongs to a
different restaurant and must not reach this site.
