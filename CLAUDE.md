# CLAUDE.md — Frontend Website Rules

## Project: Misono
High-end Japanese omakase restaurant in Kenya (Nairobi assumed — unconfirmed).

A design exists and is being built on. The 2026-08-08 direction was cleared and moved
to `_archive/`; everything since is new work, and `_archive/` is still not to be read
for direction.

### The ground
**The whole site is on a muted peach, `--ground #F7E8DF`.** It started on `menu.html`
and was taken across to `index.html` on 2026-08-11. The cream it replaced is not a
second ground and is not used anywhere — see the tokens table for what became of the
`--cream` token.

The two exceptions are both full-viewport photographs, not grounds: the homepage hero
and `about.html`'s opening. `body` stays on `--ink` behind each, deliberately — a
failed image then leaves white type on black rather than white type on peach.

`about.html`'s statement section was built on `--ink` first, matching its reference,
and moved to the peach on 2026-08-12; that is settled. **A photograph is the only
reason to leave the peach.** Re-derive contrast per ground rather than carrying it
across, and expect roughly four things per section not to follow from re-pointing the
ground — on the statement they were the vignette's polarity, the grain's blend mode,
the heading's text-shadows, and the gradient tails that are literals. The arithmetic
for each is in that file, beside the declaration it belongs to.

### Pages
- **`index.html`** — the homepage. Full-viewport photographic hero, then the teppanyaki
  menu section, an about section (`#beyond`), a dish feature, reservations (`#reserve`),
  and a closing footer nav. Every section below the hero is on the peach.

  **The hero has a PORTRAIT crop of its own as of 2026-08-25**, keyed on aspect ratio
  rather than width, because the aspect is what does the cropping. Desktop is untouched.
  Three things are load-bearing:

  - **On a portrait viewport the vertical half of `object-position` does NOTHING.**
    `cover` scales this 1.874:1 frame to the short axis, which is the height, so the
    frame shows 97.1% of its own height at every portrait size and only the x steers.
    The old rule said `44% 56%` and the 56 had never had any effect — it read as a
    decision for months. The visible slice is a quarter of the source width (23.9% at
    390x844), so *which* quarter is the whole design.
  - **A percentage anchor is aspect-stable, which is why one value serves every phone
    and the tablet.** At `54.5%` the window's centre moves 53.4% → 53.6% as the slice
    narrows from 38.8% (768x1024) to 20% (a foldable); a taller phone tightens around
    the same composition instead of sliding off it. Do not add per-device values.
  - **The wordmark sits at `top: 68%` on a phone — lower-middle, on the counter's own
    shadow under the chef.** Judge type over a photograph on the **worst 12px tile**
    under it, never on the mean: the mean is what says a wordmark lying across a row of
    lit cups is comfortable at 10:1. Floors across every portrait size from 320x568 to
    430x932 are 4.6 / 6.8 / 8.5 (name needs 3:1 at 40px, tagline 4.5:1, icons 3:1), and
    they hold at both ends of the 42s drift — the crop is still moving while a reader
    looks at it, so a position solved at 1.03 alone is solved for half the animation.
  - **The bed under the block was re-CENTRED, not deepened, and that is the general
    lesson.** Every hot tile in this composition is at the type's right end where the
    lit cups are; moving the radial's peak from 42% to 48% of its box lifted the name's
    floor 3.7 → 4.6:1 for 0.10 of extra alpha. Reach for the geometry before the depth
    — at the 0.86 this once carried, the bed reads as a smudge laid over the photograph.
  - **The block sat at 76%, down in the chairs, for one revision, because the tool was
    measuring with the bed switched off.** Hiding `.hero__brand` to sample what is under
    the type takes its `::before` with it, so every position reported as if it had no
    bed and the whole 56–68% band looked unavailable at 2.7–3.6:1. When a measurement
    rules out most of the design space, check the instrument before accepting it.
- **`menu.html`** — the menu page, built 2026-08-11. An editorial composition matched to
  `assets/img/menu isnpo.jpeg` (four portrait photographs floating around a heading
  centred on the viewport), then the carte, then the reservation section and the closing
  wordmark footer.

  The opening composition gained a **3D entrance** on 2026-08-17 — the eyebrow, the two
  display lines and the four frames arriving out of depth over about two seconds, on the
  house `.js` / `.is-in` + IntersectionObserver contract. It changes nothing about the
  layout: **every rest state is a true `transform: none`**, verified at 1440x900,
  1280x800 and 390x844. Spec at
  `docs/superpowers/specs/2026-08-17-menu-flavors-entrance-design.md`; read it before
  retiming anything. Four things are load-bearing:

  - **Depth is a `perspective` PROPERTY on three parents, not a `perspective()` function
    inside each transform.** That is what lets the rest state be `transform: none`, which
    is what keeps a hairline Cormorant at 300 from being rasterised once and stretched —
    the same finding that keeps `will-change` off `about.html`'s statement. Do not add
    `will-change` here either.
  - **`perspective` reaches direct children only, and the site has now been bitten by
    that.** The display lines are grandchildren (`.flavors__title` > h1 > span), so the
    property is declared on `.flavors__display` as well. Declared on the title alone it
    reaches the eyebrow and stops, and the lines' `translateZ` silently has no camera:
    nothing errors, and it reads as a heading that fades while the frames move in depth,
    i.e. as a decision. A line reporting apparent scale 1.000 at t=0 is this bug.
  - **`.flavors__field`'s perspective-origin is the window centre, which is where the
    heading is**, so a frame pushed back in Z is projected toward the heading and its
    slide out to its own measured inset comes free from the projection coming undone.
    Nothing writes a per-frame translateX — the four measured insets are still the only
    thing deciding where a frame lands. The drift is proportional to distance from that
    origin, so it scales itself down on a narrow viewport with no media query.
  - **The overshoot is not `y2`.** The peak of a `cubic-bezier(x1,y1,x2,y2)` sits around
    t=0.8 and well below y2: y2=1.12 peaks at 1.026 and y2=1.20 at 1.055. Solve it
    against the travel it drives rather than picking y2 by eye.
- **`about.html`** — the about page, complete as of 2026-08-14. Seven sections, then the
  transplanted reserve and ending blocks. The first four were built 2026-08-11/12 and
  alternate dark photograph and peach so the page reads close / claim / wide / record;
  the next two open out into pinned sequences and the seventh closes it:
  1. the **opening**, a full-viewport photograph matched to `assets/img/about inspo.jpeg`;
  2. the **statement** ("BOLD, UNIQUE, / AND / UNMATCHED / CULINARY / CRAFTSMANSHIP"),
     matched to `assets/img/abouttt page.jpeg`;
  3. the **plate**, one full-bleed photograph and nothing on it — no eyebrow, no caption,
     no scrim — with a scroll parallax;
  4. the **figures**, four numbers on the peach with a count-up. This one is **76svh, not
     100** — four numerals are ~150px of ink and a full viewport read unfinished rather
     than generous.
  5. the **chapters**, built 2026-08-13 and matched to `assets/img/scroll through for
     about.png`. A pinned four-part scroll on the peach: a 3:4 photograph on the left, a
     text column, and a roman-numeral track whose height is **the photograph's height
     exactly** — that is the reference's alignment rule, not a coincidence. Spec at
     `docs/superpowers/specs/2026-08-13-about-chapters-design.md`; read it before
     touching the motion.

  6. the **experience**, built 2026-08-13 and matched to `assets/img/about line
     scroll through.png`. A second pinned scroll (261svh) on the peach: an editorial
     masthead, then three 3:4 photographs at staggered heights with one continuous
     gold line drawn through all of them. Spec at
     `docs/superpowers/specs/2026-08-13-about-experience-design.md`.

  7. the **ichie**, built 2026-08-14 and designed from scratch — no reference. The
     page's closing beat: 一期一会, "one time, one meeting". A single screen on the
     peach, **not pinned** (two pins back to back is already the limit), with two
     photographic plates in one `perspective` box at opposite Z drifting at opposite
     rates off the shared `track()` loop. The 5% size difference between the plates
     is perspective doing its job, not a layout error. Its front plate is **the only
     landscape frame on the site** — that is what stops the pair reading as a pair.
     Spec at `docs/superpowers/specs/2026-08-14-about-ichie-and-ending-design.md`.

  The page is now complete: ichie is followed by the transplanted reserve and ending
  blocks, so the re-copy contract below **does** apply to it. See that section.

  The experience section runs on **the same rAF loop** again, and writes **one number
  for the whole section** — `--draw`, 0 to 1, on `.experience`. Every card, caption,
  badge, dot and ring derives its own state in CSS from it against its own `--at`. Four
  things about it are load-bearing:

  - **The SVG dash does not work the obvious way, and it fails silently in two
    different directions.** `pathLength` + a unitless `stroke-dasharray` does not
    normalise, because CSS resolves the number to a *length* and pathLength only
    applies to a `<number>` — that build starts a second dash partway along and paints
    the end of the line from the first frame. Writing the path's real length in user
    units is also wrong, by exactly the viewBox-to-CSS-px scale, because **`px` in
    these properties is a CSS pixel of the rendered box, not a user unit.** What works
    is expressing the length in the stage's own width so the scales cancel:
    `--ex-len: calc(1.07998 * var(--ex-w))`. `vector-effect: non-scaling-stroke` has
    nothing to do with it. Verify by measuring the painted tip against
    `getPointAtLength`, not by looking at it — 1.42x too fast looks like a line that
    simply draws quickly.
  - **Every `--at` is measured, never estimated from x.** `node measure-ex-path.mjs`
    prints the table. The path is 2210.8 units over 1985 of horizontal travel and two
    of its segments are near-vertical, so an x-derived fraction fires every mark in
    the back half early.
  - **The scale unit is solved against a *measured* block height.** Adding the
    reference's ink extents gave 48.75u; the real block is 51.1u, and the 2.4u
    difference is half-leading that no screenshot measurement contains. Sizing to the
    prediction fitted 1440x900 and overran 1512x820.
  - **Reduced motion puts every property derived from `--draw` back by name**, not by
    resetting `--draw` — the script writes it as an inline style, which beats a media
    query.
  - **The line's speed is scroll distance, not duration.** It was slowed 15% on
    2026-08-14 by taking the runway from 140svh of travel to 161. `LEAD` and `TAIL` are
    fractions of the travel, so the beat, the draw and the hold all stretch together and
    the timing's shape is unchanged; the per-card ramps are in draw-units and follow for
    free. Do not reach for the ramp multipliers to retime this.

  Its three photographs are **not lazy**, for the same reason the chapters' are not.
  `screenshot.mjs` cannot capture it either; use `node shoot-experience.mjs [width]
  [height] [p,p,p...]`, which prints `--draw` and the frame/caption opacities beside
  each file.

  The chapters section runs on **the same rAF loop** as the statement and the plate —
  `pin()` beside `track()` in that file's script, same one-number-per-element contract.
  There is no GSAP on this site and adding one for this would have bought nothing.
  Three things about it are load-bearing:

  - **Every measurement is a multiple of `--ch-u`, and `--ch-u` is `min(1vw, 1.62svh)`.**
    A viewport share alone is not enough: the reference capture is 1.90:1 and a laptop is
    not, so a block that fits 1440x900 clipped its masthead and its last line at the
    1440x780 and 1512x820 a real browser actually gives you. **Scale the whole block as
    one unit; never claw the pixels back by compressing individual gaps** — that keeps
    the type big and throws away the rhythm the reference was measured for.
  - **All four photographs make the same move**: each waits 86svh below its place and
    rises into it, driven by its own `--d`. An earlier build had chapter I rise from
    below the viewport and the rest do a curtain inside a fixed frame, and the first
    arrival did not read as the same gesture as the three that followed.
  - **Every custom property the script writes needs a rest state in the reduced-motion
    block, not only the ones with a visible animation.** The since-removed `--enter` had
    none of its own; left at its CSS default of 0 it meant `translateY(72svh)` and it
    parked all four frames 648px below their row.

  Its four photographs are **not lazy, deliberately** — they share one grid cell, so a
  lazy frame reaches its turn undecoded and rises as an empty rectangle.

  The statement's five lines are authored breaks, not a wrap, and each is its own depth
  plane in its own `perspective` box — so `translateZ` scales a line about its own centre
  and never moves it, and the measured composition holds exactly at rest. One custom
  property (`--cam`) is written per frame by a rAF loop; all six planes derive their
  transform from it in CSS. **Nothing there carries `will-change` on purpose** — promoting
  these makes Chrome rasterise the type once and stretch it, which a hairline serif shows
  immediately. Both facts are load-bearing; read the block at the foot of that file's
  `<style>` before touching the motion.
- **`contact.html`** — the contact page, begun 2026-08-17 and **completed the same
  day**. **Seven sections**: a full-viewport photographic hero, then `.touch`
  ("GET IN TOUCH", an editorial two-column enquiry form), `.details` (PHONE and
  EMAIL), the two location bands, the FAQ, and the transplanted reserve and
  ending blocks. Everything below the hero is on the peach.

  **The page is no longer a dead end, and that reverses a decision made earlier
  the same day.** It was built deliberately without a reserve block or a footer,
  so the topbar was the only way out; the locations work added both. Three
  consequences, none of them oversights:

  - `:root` gained `--cream` — **not as a colour**, but as the hinge the peach
    adaptation block turns. `contact.html` now carries the site's **third**
    adaptation block; keep all three in step.
  - **`.details` is no longer the page's ending but keeps its closing gradient
    anyway**, by decision. It ends on `#F5E5DB` and `.locale` opens on `#F7E8DF`
    — a step of 2/3/4 per channel. That was *measured from the render*, not
    assumed: largest per-channel step across the boundary is **4**, below the
    threshold of visibility. `verify-locale.mjs` re-checks it.
  - **`#F5E5DB` is still this page's binding contrast ground.** `--res-gold`
    clears 3:1 there by 0.17 and `--menu-accent` clears 4.5 by 0.16.

  **CLAUDE.md used to say a transplant here would need `--cream` and `--ember`.
  Only `--cream` is real.** `--ember` is declared in `index.html` and
  `about.html` and **read nowhere on the site** — `menu.html` has carried both
  copies for days without declaring it. Do not add it on the strength of the old
  note.

  - **The two location bands** (`.locale--mombasa`, `.locale--nairobi`) — one
    component, two instances, matched to `assets/img/map inspo.png`. Mombasa
    takes the reference composition, Nairobi mirrors it. Spec at
    `docs/superpowers/specs/2026-08-17-contact-locations-faq-design.md`. Four
    things are load-bearing:

    - **Cap height is the type invariant, not ink width**, and this section
      binds harder than the hero did. The comp's heading is 17 characters at
      29.79% ink width; these are **seven** characters each, so matching ink
      width would set a seven-letter word across a third of the viewport.
      Target is **cap 2.70% of viewport width**, solved by pixel scan to
      `4.1 × --lu` — measured 2.71% at 1440 and 2.66% at 1280.
    - **`--lu` deliberately has NO `svh` clamp**, unlike `--tu` and the reserve
      column's `--u`. Those exist to hold a block inside one screen and earn it;
      this is an editorial band that is *allowed* to exceed a viewport, as the
      reference's own does. Adding the clamp means re-solving every multiple.
    - **The section is inset 7.18%, not the comp's 8.85%** — the site's own
      inset, which `.touch` and `.details` use directly above it. A misalignment
      against a neighbour on the same screen beats fidelity to a comp.
    - **`perspective` is per-element and does two opposite jobs**, exactly as in
      `.touch`. `.locale__stage` is ONE shared box for the photograph's entrance;
      **every marker gets its own box**, or it is dragged toward the shared
      centre and lands on the composition. `.locale__head` needs the property
      too — the heading carries a `translateZ`, and without a camera on its
      direct parent the entrance silently degrades to a fade.

  - **The FAQ** — seven questions on `<details>`/`<summary>`, animated
    `grid-template-rows: 0fr → 1fr`. **Deliberately the quietest section on the
    page**: no photograph, no depth, no perspective box anywhere in the block.
    It follows two full-bleed photographs with floating markers, and answering
    that with a third piece of spectacle would leave the page with no shape.
    It **opens with JS off**; the smooth transition is an enhancement, needed
    only because a browser does not render a closed `<details>`'s children, so
    there is nothing for CSS to transition from.
  Specs at `docs/superpowers/specs/2026-08-17-contact-hero-design.md` and
  `docs/superpowers/specs/2026-08-17-contact-getintouch-design.md`; measured
  tables for all three sections are at the foot of that file's `<style>`.

  Three tools, and they do not overlap. `node shoot-contact.mjs [width]
  [height] [p,p,...]` for the hero — painted luminances with the type hidden,
  the heading's ink width and cap height from a pixel scan, the eyebrow's
  contrast against its own bed. `node shoot-touch.mjs [width] [height]
  [ms,ms,...]` for `.touch`'s entrance, on the same seed-and-pause contract as
  `shoot-flavors.mjs`. `node verify-touch.mjs` for everything that is not a
  single moment: the field rules as painted, fit across seven viewports,
  reduced motion, and the hero parallax.

  On the hero, five things are load-bearing:

  - **This frame is the photometric INVERSE of `about.html`'s opening, and that
    is what decided the grade.** That one is a lit core in a dark room (whole
    71, corner 27, centre 117); this is a lit *corner* — the pendant — and a
    dark core (49.5 / 116 / 41). So its wash and bed do not carry across: its
    bed exists to subdue a hinoki counter at 117 and on a centre of 41 it
    crushes the mural to black. The correction is split between a bake lift to
    mean 60 and a bed taken from 0.60/0.42 down to 0.24/0.14 — all of it in the
    bake goes hazy, all of it in the CSS goes black. **No vignette is baked in**,
    unlike every other bake here, because this frame's only lamp is in a corner.
  - **The heading is "We are at Your Service" as of 2026-08-18** (previously
    "We're at Your Service"; the caps are `text-transform`, not the source).
    22 characters now rather than 21, so the measured ink width moves 43.3% →
    46.7%. **Cap height is untouched at 1.875%** — it is set by font-size, not
    by the string — which is exactly why cap height is the invariant here and
    ink width is not.
  - **`.touch` + `.details` FIT ONE DESKTOP SCREEN TOGETHER**, and that is now
    an assertion in `verify-touch.mjs` (`pair`), not something to re-check by
    eye. It took two passes on 2026-08-18: first dropping `.touch`'s
    `min-height: 100svh` — which made sense when this was the page's last
    section, but with four sections below it left 561px of ink in a 900px box
    and 339px reading as a hole — taking the pair from a flat 1.49 screens to
    1.10; then removing a further 88px to get under 1.00.

    **That 88px came out of five places, not one**, because a single cut deep
    enough to do it alone is exactly what makes a form feel compressed: the
    form's field gap 3.5tu→2.6, `.touch`'s padding 5tu→4, the message box
    8tu→6.5, `.details`' padding 5tu→3.6 and its rule margin 4.2tu→2.8, plus
    its `min-height` 30svh→20 where it had stopped being a floor and become
    47px of nothing. Everything is `--tu`-based, so the saving scales with the
    window: measured spare runs +26px at 1280x720 (the tightest) to +96px at
    2560x1440.

    **The assertion is scoped to ≥1000px on purpose.** Below that the columns
    stack and a phone cannot show a four-field form and the contact details at
    once — flagging it there would be the same stale-assertion noise the axis
    check had to be cured of.
  - **The eyebrow, not the heading, sets the contrast floor.** The heading has
    ~16:1 where it needs 3:1 and never binds; `--res-hair` at 12.4px is held to
    4.5:1 and runs out first, worst case 5.56:1. This page is also the first
    thing on the site to set **type** in `--res-hair`, which is documented
    decorative-only — a new role, so it is measured per viewport.
  - **Cap height is the invariant across the two photographic openings, not ink
    width**, and the opposite looks tempting. `about.html` set 21 characters in
    its reference, had 26 of its own, and so held cap and let the reference's
    49.5% ink width go. This heading is 21 again — so both numbers ought to hold
    together, and they do not: it measures 43.3%. Character count does not decide
    ink width; glyph widths do. Chasing 49.5% would set this page's type *larger*
    than `about.html`'s so a shorter sentence could fill a longer line.
  - **`--ease-push` is new because both of the site's eases are UI eases.** They
    are front-loaded by design, and a camera move must not be: on `--ease-reveal`
    the push-in was three-quarters over in the first fifth of its duration and
    then crawled. **A timeline capture caught that; looking at the finished page
    never would**, because the rest state is identical either way. Seek the
    entrance before believing it.
  - **The parallax is live as of 2026-08-17, and used to be dormant.** One rAF
    loop writes one number (`--par`) and `.hero__media` derives its transform in
    CSS, on the house contract. Until `.touch` and `.details` were added the page
    was one viewport tall, the document never scrolled, and `--par` sat at 0
    forever — it had to be driven by a temporary spacer to be seen at all, and
    this file used to say not to "fix" a reading of `--par 0.0000`. That no
    longer applies: driven by real scrolling it runs 0 → 1 linearly and the media
    translates 0 → 108px at 1440x900, exactly the 12svh of `--par-travel`.

    **Test the media against `.hero`'s rect, never against the viewport.** The
    media only has to cover its own section; checked against the viewport it
    reports a gap at every scroll position past the first, which is not a gap —
    it is `.touch` coming into view. That false positive is in `verify-touch.mjs`
    now as a comment, because it cost a round of chasing a bug that did not exist.

  **Every "Contact" link on the site points here as of 2026-08-17** — the footer
  nav on all four pages and `about.html`'s topbar.

  **The dead-end problem is now solved, and `#reserve` is reachable again.**
  Both of the consequences this file used to record are spent: the page has a
  footer, so the topbar is no longer the only way out, and it carries its own
  reservation block, so the booking CTA is reached by scrolling on the page a
  reader is already on. The four pages now end identically.

  Its `:root` carries only the tokens it uses, and it **gained eight on
  2026-08-17**: `--ground`, `--menu-ink`, `--menu-body`, `--menu-accent`,
  `--misono-indigo`, `--ease-settle`, `--ease-pop` — and later `--cream` with
  the transplant. The two eases are the instructive ones — they are declared in
  **`menu.html`'s** `:root` and read like site-wide tokens, and the first draft
  of the spec specified them without carrying them across. Used undefined they
  do not error: every eased transform silently falls back to `ease` and an
  entrance built on two solved overshoot curves quietly loses its overshoot.
  **Check every `var()` in the file against `:root` rather than reasoning about
  which tokens "must" be there.**

  On `.touch` and `.details`, four things are load-bearing:

  - **`perspective` does two opposite jobs in this one section, and the choice
    is per-element rather than per-page.** The entrance wants ONE shared
    perspective box: `.touch__form`'s origin is its own centre, so a field
    pushed back in Z is projected toward it and the stack opens outward as it
    lands with no per-field `translateX`. The decorative marks want the
    OPPOSITE — given one shared box they were dragged 135px toward that centre
    and landed 62px over the form and 61px under the masthead, which reads as
    clumsy placement rather than as a bug. Each mark therefore gets **its own**
    `perspective` box, which is `about.html`'s statement section exactly: a
    plane in its own box scales about its own centre and never moves. Measure
    the painted rect against the content's, do not look at it.
  - **A field's underline is a UI component boundary, not decoration.** It is
    the only thing identifying where the control is, so WCAG 1.4.11 puts a 3:1
    floor on it. `--res-hair` measures **1.74:1** and is documented
    decorative-only; the rule takes `--res-gold` at 3.26:1. `.details` is
    checked against **`#F5E5DB`** — the foot of its own closing gradient, which
    is the binding ground on this page, not the flat peach. `--res-gold` clears
    there by 0.17 and `--menu-accent` by 0.16; deepen that tail and both must
    be re-derived.
  - **`.touch` and `.details` ARE ONE COMPOSITION ON ONE GRID**, rebuilt
    2026-08-18. Treat them as a single design object; editing either alone is
    what produced every problem the rebuild fixed.

    **The flaw was never spacing — it was that the two blocks did not agree
    about where anything was.** `.details` was centred where `.touch` is a
    two-column grid, capped at 78tu where the form is capped at 66, with its
    own tinted ground and its own centred rule. Nothing aligned across the
    boundary, so no amount of tuning could stop it reading as a second
    section. Three rounds of spacing work had already been spent on it.

    They now share one grid: same width, same centring, same columns
    (`minmax(0, 0.68fr) minmax(0, 1fr)`, gap 5.5tu). **PHONE sits under the
    masthead and EMAIL under the form** — the email is the longer fact and
    lands in the wider column for the same reason the form does. **The two
    `grid-template-columns` must stay identical; the alignment between the
    rows IS the composition.**

    Four things are load-bearing:

    - **The closing gradient is gone, and that single change does most of the
      work.** It existed when `.details` was the page's ending; a tint under
      one half of a composition is what made it read as a band regardless of
      spacing. Two measured consequences: the binding contrast ground becomes
      `--ground` #F7E8DF rather than #F5E5DB, so `--res-gold` and
      `--menu-accent` both *gain* (3.26:1 and 4.80:1), and the seam into
      `.locale` goes from a step of 4 per channel to **0**.
    - **Removing a background is not the same as setting one.** Dropping the
      gradient with nothing in its place fell through to
      `body { background: var(--ink) }` and rendered the whole block as a
      **black band with unreadable type** — and every measurement still
      passed, because heights, grid alignment and fit are geometry and none of
      them look at colour. Only the screenshot caught it.
    - **Merging bought space rather than costing it.** The two sections'
      meeting paddings were spending ~150px on nothing; collapsing them into
      one interval (set by the connector rule's margins, with `.touch`'s
      padding-bottom at zero) paid for a heading at 4.8tu instead of 3.9 and a
      form gap back at 3.2tu instead of 2.6 — and it still fits one screen
      with more room than the squeezed version had.
    - **The connector rule needs a top margin.** With `.touch`'s bottom
      padding at zero it lands directly under the form, and at margin-top 0 it
      drew *through* the Send Message button's bottom edge.

    The masthead column is **stretched and split** — heading and tick at the
    top, paragraph pushed down with `margin-top: auto`. Top-aligning both
    columns left the form's ~200px height advantage as one undifferentiated
    hole; splitting turns it into an interval, and the paragraph's last line
    lands on the same baseline as the Send button (measured delta 0).

    **`verify-touch.mjs` is now on its THIRD invariant here, and the first two
    are the lesson.** "Every item's centre sits on the page axis" was true of
    a stack; "the two ink centres balance about the axis" was true of two
    centred cells. Both encoded an *arrangement* rather than a *rule*, and
    both fired at nearly every viewport the day the arrangement changed. It
    now asserts **grid agreement** — PHONE on the masthead's line, EMAIL on
    the form's, measured dx −0.0 everywhere — which is a property of the
    composition itself. When a check fires everywhere, suspect the check.

    **Ordering matters in this file.** A `.details` or `.touch` override
    placed *above* the base rules loses at equal specificity: it silently
    killed a font-size change and kept a divider horizontal on 2026-08-18.
    Put overrides after the base rules.
  - **The vertical kanji needs `white-space: nowrap`, and without it the
    failure is silent.** Six glyphs are taller than the window, so `vertical-rl`
    breaks them into a second column — and `rl` puts that column to the LEFT,
    so お問い合わせ reads out of order. At whisper alpha it looks like decorative
    texture rather than like broken type, which is why it survived a build.

### The reservation section
Rebuilt 2026-08-15 against `assets/img/inspooooo.png`, replacing the 2026-08-10
composition on all three pages at once. Spec at
`docs/superpowers/specs/2026-08-15-reservation-redesign-design.md`; the older spec is
marked superseded and kept only for the CTA's reasoning.

Full-bleed photograph on the right, its left edge a **two-lobe gourd curve** with a tan
hairline tracing outside it, and an aspect-locked type column on the left. Four things
about it are load-bearing:

- **The curve is a `clipPath` in `objectBoundingBox` units, declared in the section's own
  markup.** Fractions of the figure's own box, so it stretches with the section and the
  bleed to top, right and bottom stays exact at any aspect — verified against the comp's
  table at both 1.6:1 and 1.84:1, worst error 1.17% of the width. The hairline is a
  separate `<path>` on the same coordinates with `preserveAspectRatio="none"`, so the two
  distort **identically** and cannot fall out of register; it carries
  `vector-effect: non-scaling-stroke` because a non-uniform stretch would otherwise leave
  the line thick on one flank and thin on the other.
- **The hairline is drawn in full and sits *under* an opaque photograph.** Measured, it
  runs 1.2% of the width outside the photo edge down the upper lobe, converges and
  crosses at y≈60%, is invisible to y≈87%, then reappears widening to 2.1%. All three
  come free from the occlusion being real rather than drawn. Do not try to draw it as an
  offset of the edge.
- **The shape has a cusp at y≈42%** — a pointed tongue of ground with its tip at 63.61%,
  whose underside falls 3.3% of the width in 0.19% of the height. It is the difference
  between a gourd and a lazy ellipse. Sampling the comp coarsely misses it, and a
  scan that reads the lit plaster wall as ground misses the whole sweep and makes the
  Bézier overshoot. `measure-reserve-ref.mjs` reprints the comp's tables and
  `make-reserve-path.mjs` regenerates both curves from them, flagging any control handle
  that leaves its segment's x range. Both read pixels through the Chrome puppeteer ships,
  since there is no ImageMagick or canvas module here, so both must be run from the
  project root.
- **The photograph is graded in CSS, not re-baked.** `reserve-interior.jpg` measures 62 of
  255 — the floor of the chapters band, where a lit macro belongs, not a wide interior —
  and full-bleed it now covers half the screen. Lifted to ~78 with
  `contrast(0.94) brightness(1.18)`, in that order and with contrast *below* 1: contrast
  pulls toward 128, opening the shadows and pulling the pendants back before the lift
  multiplies them. `brightness` alone at the 1.26 the same mean needs clips both lamps to
  flat white discs.

The type column is one aspect-locked block on `--u: max(8.6px, min(1vw, 1.62svh))`,
48.1u of ink, **centred by `align-items` and not by `top: 50%` with a translate** — a
transform moves the paint but not the layout box, and the layout box is what proves
nothing is being clipped. Verified to fit one screen at 1000×700 through 2560×1440.

**The reserve and ending blocks are transplanted byte-for-byte from `index.html`** —
CSS 997–1524 and 1525–1762, markup 2155–2253 and 2256–2275 (**every one of these numbers
moves whenever anything above it changes, on the copies as much as on the original** —
re-find the blocks rather than trusting them; last checked 2026-08-17, and the reserve
markup grew 20 lines that same day with the opening-hours change). The menu page's
slice moved twice in one sitting on 2026-08-17, and the second move looked exactly like
drift: `diff` reported 11 added lines at the head of the copy, which is what a shifted
window and a corrupted copy both look like. Re-derive the offset before believing it.

**The same trap fired again on 2026-08-17, in the other direction.** A fixed-length
window over the *ending* CSS reported `about.html` differing on its last line. The copy
was byte-identical; the window had simply run one line past the block's true end, into
whitespace belonging to the adaptation block that follows. **Bound a diff by the block's
own last line, never by a length carried from the original.** (A blank separator was
added to `about.html` so all three copies now have the same shape and this particular
false positive cannot recur.)

**Four pages now carry the copies**: `menu.html`, `about.html` since 2026-08-14, and
`contact.html` since 2026-08-17. The ending block carries one intentional delta per page,
`aria-current="page"` on that page's own footer link. Do not edit the copies. Change
`index.html` and re-copy, or the four pages drift apart, which is the whole point of
copying rather than rewriting.

**Diff the markup blocks, not only the CSS** — the commands below cover CSS only, and it
was diffing the markup that caught a five-line drift nobody had noticed.

The reliable way to verify is to re-derive every range first, which is what this does:

```bash
python3 - <<'PY'
import re, difflib
def find(l,p,s=0): return next(i for i in range(s,len(l)) if re.match(p,l[i]))
src=open('index.html').read().split('\n')
cs=find(src,r'^  /\* -+ reserve \*/'); ce=find(src,r'^  /\* ={10,}',cs)-1
es=find(src,r'^  /\* ={10,} ending'); ee=find(src,r'^  /\* ={10,}',es+1)-2
ms=find(src,r'^  <section class="reserve" id="reserve"'); me=find(src,r'^  </section>',ms)
fs=find(src,r'^<!-- ={10,} ending ==== -->'); fe=find(src,r'^</footer>',fs)
for page in ('menu.html','about.html','contact.html'):
    d=open(page).read().split('\n')
    for name,(a,b),pat in (('reserve CSS',(cs,ce),r'^  /\* -+ reserve \*/'),
                           ('ending CSS',(es,ee),r'^  /\* ={10,} ending'),
                           ('reserve mk',(ms,me),r'^  <section class="reserve" id="reserve"'),
                           ('ending mk',(fs,fe),r'^<!-- ={10,} ending ==== -->')):
        m=src[a:b+1]; i=find(d,pat)
        out=[x for x in difflib.unified_diff(m,d[i:i+len(m)],lineterm='',n=0)][2:]
        print(f'{page:13s} {name:12s} ' + ('IDENTICAL' if not out else f'{len(out)} diff lines'))
        for x in out[:6]: print('    '+x)
PY
```

`menu.html` expects **one** delta: a `prefers-reduced-motion` / `scroll-behavior` block
and the blank line under it, which it handles in its own `html` rule instead. It used to
be described as two because a stray blank line in the reserve CSS was counted separately;
that line went with the 2026-08-15 rebuild. **`about.html` and `contact.html` expect
none — both copies are byte-identical**, because neither has a `scroll-behavior` rule of
its own for the copy's version to collide with. Anything else, on any page, is drift.

**The ending block grew a line and lost five on 2026-08-17**, when every "Contact" link
was pointed at `contact.html`. The five were the `PLACEHOLDER — swap to /menu, /about and
/contact once those pages exist` note, which had become untrue the moment it was carried
out; a one-line `<!-- === ending ==== -->` marker replaced it. That also **fixed a real
drift nobody had caught**: `menu.html` had never carried the placeholder comment at all,
so its ending markup had been five lines short of the other two since it was transplanted.
Re-copying is what surfaced it. Diff the markup blocks, not just the CSS ones — the
verification commands below only cover the CSS.

The markup is byte-identical on all three pages too, which it was not before 2026-08-15:
`menu.html` carried a hidden `#mm-petal` / `#mm-core` sprite purely to feed the reserve
mon, and `about.html` used those ids **without ever defining them**, so its mon drew
nothing at all and had done since the block was transplanted. The rebuild drops the mon,
so the sprite is gone from `menu.html` and the dangling reference from `about.html`. The
reservation block now reaches outside itself for nothing — its clip paths are declared in
its own markup — and that is a property worth keeping.

**Both files carry a peach adaptation block at the foot of the `<style>`, and they say
the same things.** The copies are never touched to get onto the peach: they take their
ground from `var(--cream)`, and the block re-points that one property at `--ground`.
Four things do not follow from it and are handled item by item — `--menu-body` and
`--menu-accent` (below AA on peach at their cream values), `--res-gold` (fails 3:1),
the ending gradient's hardcoded tail, and, on `index.html` only, the dish hairlines.
Each block also records that the closing wordmark's alpha correctly needs **no** change,
because it looks like it should. **Put any future ground adaptation in those blocks,
never in the copies, and keep the two blocks in step.**

Entries into `menu.html` from the homepage: both "Explore Menu" CTAs and the footer
"Menu" link. Keep them pointed there.

### Design tokens
Established in `index.html` and reused. Do not invent alternatives to these:

| token | value | ratio on the ground | note |
|---|---|---|---|
| `--ground` | `#F7E8DF` | — | the site's ground, both pages, every section |
| `--ink` | `#0B0806` | — | behind the hero photograph only |
| `--menu-ink` | `#2F1B19` | 13.6:1 | display type on the ground |
| `--menu-body` | `#63504A` | 6.3:1 | body |
| `--menu-accent` | `#99551C` | 4.8:1 | accent — eyebrows, rules, links |
| `--res-gold` | `#AC7634` | 3.26:1 | non-text boundary, the WhatsApp button |
| `--res-hair` | `#D4AD7E` | — | decorative only, no minimum applies |
| `--misono-indigo` | `#3A5280` | — | the one measured brand value, from the logo photo |
| `--ember` | `#C47026` | — | **declared but READ NOWHERE** — see below |

A token that is used but not defined **fails silently, and it has now happened twice on
the same page in the same week.** `--menu-accent` was missing from `about.html`'s `:root`
until the chapters section: every `var(--menu-accent)` was an invalid declaration, so type
fell back to inherited ink and a rule that took the accent as its `background` did not
draw at all. Then `--res-gold` was missing when the experience section became the first
thing on the page to need a non-text boundary: the drawn line took it as `stroke` and the
marks as `fill`, so the path and the rings inherited `stroke: none` and did not draw at
all, while the dots fell back to SVG's default fill and came out **black** on the peach.
Nothing errored and nothing logged either time. When a page starts using a token role it
has not used before, check `:root` actually carries it.

**The same class of failure, in a third form: `perspective` is inherited by nobody.** It
applies to an element's **direct children** and stops, so a `translateZ` on a grandchild
has no camera to be projected through — see `menu.html`'s entrance, where the display
lines sit two levels below the element the property was first declared on. Nothing errors
and it does not look broken either; it looks like a decision. If a depth transform is not
projecting, check where the property is declared against where the transformed element
actually sits in the tree before touching any numbers.

`--ember` is **dead as of the 2026-08-17 audit**: `grep -c 'var(--ember)' *.html` returns
zero across the whole site. It is declared in `index.html` and `about.html` and read by
nothing. This file used to instruct that a reserve/ending transplant needed it — that was
wrong, and `menu.html` had been disproving it for days. Do not add it to a `:root` on the
strength of a note; check whether a token is actually read first. Left in place rather
than deleted, since removing a declared-but-unused token is not worth a regression risk
on four pages, but **do not treat it as a live token**.

`--cream #FCF8F5` is **superseded and appears nowhere on any page as a colour.** The token still
exists because it is the name the section CSS uses for "my ground", and re-pointing that
one property is what moves a section onto the peach without editing it. Do not reach for
it as a colour, and do not delete it either — it is the hinge both adaptation blocks turn.

Type is **Cormorant Garamond** (display, 300/400) with **Jost** (utility, 300/400).
Never pair anything else without being asked.

Contrast is re-derived per ground, not carried across. `--menu-ink` is the only one that
survived the move to peach untouched — it clears 13.6:1 and had the room. The other
three were re-derived: at their cream values they measure 5.66, 4.47 and 2.81 on the
peach, so two fail AA and one fails the 3:1 it was chosen for. If the ground changes
again, re-derive rather than carry; the peach blocks in both files show the arithmetic.

### Still placeholder, pending real content
Street address, phone, email, social links, **the entire carte on `menu.html`** (every
dish, note and price is invented), and the reservation link.

**`contact.html`'s enquiry form does not submit, by decision rather than
oversight.** There is no backend on this site; `mailto:`, WhatsApp and a
third-party form endpoint were all offered on 2026-08-17 and design-only was
chosen. A handler cancels the submit event for one reason — a form with no
action reloads the page and throws away everything a guest typed. **There is
deliberately no success state**, because telling someone their message was sent
when nothing was sent is worse than a button that visibly does nothing. To wire
it up: give the `<form>` an action and delete that handler. Nothing else changes.

**`contact.html`'s locations and FAQ are researched, not invented — but every
claim in them still needs confirming.** All of it comes from public listings
(`misono.co.ke`, EatOut, Foursquare, WanderBoat) on 2026-08-17:

- **Mombasa is NYALI, not Shanzu — CONFIRMED 2026-08-20.** The original brief
  said Shanzu; every listing found says Links Road, Nyali, a different suburb
  roughly 6km south, and the client confirmed Nyali is correct. The heading,
  copy and both marker cards on `contact.html` are built on it, as is the FAQ's
  first answer. Settled — do not re-open it on the strength of the old brief.
- **The founding dates**, 1995 Nairobi and 2006 Mombasa. The Nairobi copy
  deliberately says "The first Misono opened in 1995. Today it sits at…" rather
  than joining them: Foursquare places an earlier Misono in Woodley Estate, so
  the founding date and the current address cannot be asserted as one
  continuous fact. **Do not "improve" that into one fluent sentence** — the
  fluent version asserts a continuity nothing supports.
- **The card landmarks** — the Java House opposite, Nyali City Mall, The Green
  House, Adams Arcade. **No card carries a distance or a drive time**, and none
  should be added without a source: the reference's cards read "12 min drive ·
  8 km", not one such figure is verifiable, and this is the page whose whole job
  is telling people where the restaurant is.
- **Two FAQ answers are load-bearing and must not be made more confident.**
  Q6 (dietary): vegetarian selections are confirmed, including on the boats;
  **halal, vegan and gluten-free are NOT, for either branch**, and the answer
  sends allergies to a phone call on purpose. Q5 (private dining) names
  **Nairobi and only Nairobi** — that room is confirmed; Mombasa's is not.
- **The FAQ's hours must stay in step with the reservation block.** They are the
  same claim made twice on the same page, and that claim contradicts the client.

**`contact.html`'s two contact facts are new and unverified**, supplied from
public listings on 2026-08-17: `+254 722 511229` (the Nairobi listing) and
`restaurantmisono@gmail.com` (the Mombasa one). Confirm both alongside the
invented `wa.me` number and the opening hours. **A second Mombasa number,
`+254 722 530204`, appears in listings and is not yet used anywhere** — with two
branches now named on the page, one number for both is a claim worth revisiting. **One claim to check in
particular:** the reservation block on the other three pages says "Nairobi &
Mombasa", and this page presents one number and one address as reaching both —
a claim the site has not made anywhere before.

**`contact.html`'s hero photograph** (`assets/img/contact-hero.jpg`, Pexels 19300593) is
a placeholder and is flagged as one in that file's markup, for two reasons. Pexels
supplies **no model release**, and an identifiable person on a restaurant's contact page
reads as that restaurant's staff — a claim the photograph cannot support. It also reads
Pan-Asian rather than distinctly Japanese: a rattan pendant, a painted mural, a
dark-uniformed waiter, no counter and no teppan. It was chosen over frames that *were*
unambiguously Japanese because those could not carry the heading. The composition depends
on exactly one property of whatever replaces it — **a lit subject OFF centre, leaving the
middle calm** — and on nothing else about the file.

**The reservation section's two facts are new and unverified**, and because that block is
copied to three pages they appear on the whole site at once:

- **Opening hours — "Monday – Sunday / 12:00 – 23:00", CONFIRMED by the client
  2026-08-20.** One schedule for both branches. This **reverses** the 2026-08-17 change,
  when the site briefly carried "Nairobi 12:00–21:30 / Mombasa 12:00–21:00" taken from
  public listings on the reasoning that a listing is more likely to be current than a
  phrase remembered from conversation.

  **That reasoning was wrong, and it is the lesson worth keeping.** Asked directly, the
  client confirmed the hours they had given on 2026-08-15. The listings are stale, not
  the brief. When a public source disagrees with the person who owns the restaurant, ask
  them — do not quietly prefer the source and ship a fact you know they would dispute.

  Keep it in step with the FAQ's hours answer on `contact.html`; that is the same claim
  made twice on one page and the two have already drifted apart once.

  Two shape constraints, both learned by measuring: the value must stay **two lines**
  (the copy column is an aspect-locked 48.1u of measured ink verified to fit one screen
  from 1000x700 to 2560x1440, and a third line changes that height), and it must not
  wrap. Both current lines are shorter than the branch lines they replaced, so the fit
  can only have improved.
- **"Nairobi & Mombasa, Kenya".** Also supplied 2026-08-15, and it **supersedes the old
  "city unconfirmed, Nairobi assumed"** — but it now asserts *two* locations, which
  nothing else on the site does and which changes what "the counter" means on
  `about.html`. Confirm before launch.

Both sit beside the invented `wa.me` number `+254 700 000 000` in the section's own
comment, so all three get swapped in one pass.

Gone from the site with the 2026-08-15 rebuild, and therefore no longer pending: counter
& table seating, parties up to eight, dinner Tuesday–Sunday, a reply within the hour.

On `about.html` specifically, four things are written rather than supplied:

- **The whole of the ichie section.** Written copy. No numbers in it, but two service
  claims a guest could hold the restaurant to: that the fish is cut *after* you are
  seated, and that the Teppan is taken back to bare steel between courses. Confirm both.

- **The whole of the chapters section.** Every word of the four chapters is written copy.
  No number appears in it on purpose, so there is nothing new to fact-check — but it
  leans on **the counter** twice in chapter IV ("seated facing the work", "conversation
  runs across the counter"), which stands or falls with the same unverified claim the
  statement paragraph makes below.

- **The statement paragraph.** The heading is the client's own five lines; the paragraph
  under it ("At Misono, tradition is not kept behind glass…") is written copy. It claims
  a counter and a nightly service — check both before it ships.
- **All four figures**, which are invented outright: 14 years in practice, 50+ signature
  preparations, 12 seats at the counter, 9 courses each evening. The last two are the
  load-bearing ones — seat count and course count are checkable claims a guest will hold
  the restaurant to, so get the real numbers before this page goes anywhere near
  production. The brief's own "100% Japanese-inspired" and "5-star" were dropped on
  purpose; the reasoning is at `.figures` in that file.

### Specs
Design decisions are written up in `docs/superpowers/specs/`. Read the relevant one
before changing a page that has one — it records what was measured and why, which is
not recoverable from the CSS alone.

## Performance
Optimised 2026-08-24. The site was carrying 1.4–2.9MB per page and taking 7–14.6s to
finish loading on a throttled phone; it now carries 0.27–0.65MB and finishes in
1.5–3.4s, with **no change to any layout, any photograph's grade, or any animation**.
Both of those are asserted by tooling rather than by eye — see the verification tools
below, and run them after touching anything here.

**The bottleneck was bytes, and only bytes.** The rAF architecture was measured before
anything was changed and is already excellent: `node perf-scroll.mjs` reports a median
frame of 16.7ms and **zero tasks over 50ms** on every page at 4x CPU throttle, before
and after. One loop per page, one number per element, transforms derived in CSS,
observer-gated and self-halting — there was nothing to fix and nothing was changed.
Do not "optimise" the motion; it is not where the time goes.

### Responsive photography
Every photograph is served as AVIF, with WebP behind it and **the untouched original
JPEG as the `<img src>`**. Originals are never modified — they remain the fallback and
the input every `bake-*.py` expects.

The pipeline is three steps and they must run in this order:

```bash
node measure-img-sizes.mjs --json   # what the layout actually paints -> img-sizes.json
node bake-responsive.mjs            # encode the ladder -> assets/img/r/ + img-manifest.json
node apply-responsive-markup.mjs    # wire <picture> into the four pages
```

`apply-responsive-markup.mjs` is idempotent: on a page that already has `<picture>` it
**refreshes the candidate lists in place** rather than wrapping again, so a re-bake at a
different ladder is a one-command update.

Seven things here are load-bearing:

- **`picture { display: contents }` is required, not cosmetic.** Several of these images
  are flex or grid items of their own parent — `.beyond__track img` is `flex: none` in a
  `max-content` row whose marquee translate is a percentage *of that row* — and a wrapper
  would take the slot instead of the `<img>`. Selector matching is unaffected: every rule
  on this site reaches these images by class or as a descendant, never as a direct child.
- **An `<img>` sized `width: auto` takes its ratio from the BITMAP, not from the
  width/height attributes.** The attributes only supply a ratio until the image loads. A
  rung whose height was rounded to an even number is a fraction of a percent off, and in
  a row of 27 marquee tiles those fractions summed to 4.6px — `.beyond__track` went 6299
  to 6303.6 at 1440. Nothing looked wrong. The nine tile ratios and the ichie front
  plate are therefore **pinned in CSS**, which also means the layout no longer depends on
  which rung was chosen. Those are the only two places on the site where a bitmap ratio
  can reach layout; everything else is `width:100%; height:100%; object-fit: cover` in a
  sized box.
- **`sizes` is PER PAGE.** `hero-omakase` is a full-viewport hero on `index.html` and a
  15vw framed photograph on `menu.html`. One merged value made `menu.html` fetch — and
  preload — the 1717px rung to paint a frame a fifth that wide.
- **The LADDER is the union of every page's demand, not the merged maximum per
  viewport.** A rung only helps if it sits just above a real request. The plate is 1271
  device px on `index.html` and 295 on `menu.html`; a ladder built from merged maxima had
  no rung below 810 and `menu.html` fetched 227KB for a 171px frame.
- **`naturalWidth` is density-corrected once an `<img>` has a srcset**, so it reports the
  painted intrinsic size of the chosen rung, not the file's size. `measure-img-sizes.mjs`
  reads true dimensions from disk with ffprobe for exactly this reason. Read off the DOM
  after the responsive pass, the hero measured 371px and the plate measured 0, and every
  ladder silently collapsed to nothing.
- **`chirashi-plate` is WebP-only and gets the WHOLE ladder.** It is the one alpha cutout
  on the site; ffmpeg cannot carry an alpha channel into AVIF here (libsvtav1 has no gray
  encoder for the aux stream) and **the failure is silent** — the encode succeeds and
  returns a fully opaque image, verified 30.4% transparent in, 0.0% out. Every other
  image gets only the two ends of its WebP ladder, because WebP is a fallback tier there;
  for this one WebP *is* the ladder, and thinning it left every device above 340px
  fetching the 1122 rung.
- **AVIF is encoded 10-bit (`yuv420p10le`) from 8-bit sources on purpose.** It costs
  almost nothing and it is what keeps the near-black fields from banding — `contact-hero`
  is 47% shadow. 4:2:0 is correct rather than a compromise: the sources are already 4:2:0
  JPEGs, so there is no chroma left to lose.

### Measuring image quality
`bake-responsive.mjs` searches a quality grid per variant for the cheapest setting that
clears a **luma PSNR floor** set by role (hero 43dB, feature 41.5, tile 39.5), and every
variant is verified rather than assumed. One trap cost most of an afternoon and is worth
knowing:

- **Do not put a `scale` filter in the comparison.** An earlier version passed
  `scale=W:H` even when the file was already W x H, and swscale's identity path is not
  bit-exact. That resampling error swamped the compression error and pinned every
  measurement near 39dB regardless of CRF. **A flat PSNR-vs-CRF curve is the symptom, and
  it reads as "the encoder is very good" rather than as a broken gauge.** The real curve
  runs 51dB at CRF 4 to 33dB at CRF 60. If it ever goes flat again, suspect the metric.
- **The alpha image is compared on luma over FULLY OPAQUE pixels only.** Chrome's canvas
  premultiplies on encode, so the anti-aliased rim differs by construction; weighting by
  alpha rather than gating on it reported 34.8dB on a plate that is pixel-identical
  wherever it is solid. Comparing RGB rather than luma then folded WebP's own chroma loss
  into the same number, pinning it at q0.94 and saving nothing at all.
- **A per-file PSNR is not the acceptance test.** `node compare-photos.mjs` renders the
  original and the rung the browser would actually pick at the size it is actually
  painted, through the same downscale, at four real device profiles. Numbers below ~38dB
  there are almost always the source JPEG's own chroma noise in shadow, which AVIF cleans
  up — confirm by looking at an amplified difference map before treating one as a
  regression.

### Loading and delivery
- **Only the LCP image on each page is eager.** Everything else is `loading="lazy"` plus
  `fetchpriority="low"`, and the sections whose frames are choreographed carry
  `data-warm="<selector>"`: a small observer flips them to eager **1.5 viewports out**,
  earlier than the browser's own lazy threshold and still off the first load. This is how
  the chapters, experience, ichie and locale frames stay off the critical path without
  losing the property that made them deliberately non-lazy — a frame that shares a grid
  cell and arrives undecoded rises as an empty rectangle. With JS off, native lazy still
  fetches them a viewport later.
- **Type is self-hosted** in `assets/fonts/`, latin subsets, **one variable file per
  family** covering 300–400. Asking the Google CSS API for `300;400` hands back two
  `@font-face` blocks pointing at two URLs, and a page that sets both weights — all four
  do — downloads the same 37.8KB outline twice. The three `<link>`s that were removed
  cost two DNS lookups, two TLS handshakes and a render-blocking stylesheet before the
  browser even learned a font URL. `menu.html` and `contact.html` set no italic anywhere
  and no longer declare one.
- **`'Cormorant Fallback'` is Georgia bent onto Cormorant's metrics** (`size-adjust:
  86.8%`, measured width ratio 0.8676 over a mixed sample) so the swap costs no layout
  shift. It is in every Cormorant stack, ahead of Georgia. **Jost is deliberately not
  given one** — it measures 1.0015x the system sans, and an override tuned on this
  machine's system font would be a guess on every other platform.
- **`serve.mjs` compresses and caches.** Brotli/gzip for text only — AVIF, WebP and
  woff2 are already entropy coded and compressing them adds bytes. Two header modes:
  default revalidates everything, so screenshot rounds always see the file on disk;
  `PROD=1` makes `assets/img/r/` and `assets/fonts/` immutable for a year, which is safe
  because those names are content-addressed by width.
- **Page transitions prefetch on intent** — pointerover, touchstart or focus on an
  internal link — not on idle. Prefetching all three other pages on load moves ~120KB for
  a reader who may only ever see one. Skipped entirely under Save-Data or 2g.

### `node build.mjs` — and why the comments stay in source
`dist/` is what ships. It strips every comment and copies **only what a page references**.

**About half the weight of `about.html` and `contact.html` is CSS comments**, and those
comments are this project's record of what was measured and why — not recoverable from
the CSS, and not to be deleted from source. They simply have no business crossing the
wire. Stripped and brotli'd: `about.html` 206K to 16K, `contact.html` 187K to 13K.

It is **comment removal, not minification**, deliberately: collapsing whitespace or
reordering declarations in a stylesheet built on measured values, and on a specificity
order that has already bitten this project twice, risks a silent visual change to save
bytes brotli would have found anyway.

The copy list is derived from the markup, which is what keeps **35.3MB** out of the
deploy — the reference comps in `assets/img/` (`heroinspo.png`, `map inspo.png`, `scroll
through for about.png`) and the whole of `_archive/`, including its eight MP4s. That
directory used to have to be excluded by hand; it now cannot ship by accident.

One trap in the copy list: **decode percent-encoding LAST**. The grain filters reference
themselves as `url("%23n")` inside an inline SVG data URI, and decoding before the
fragment test turns a same-document reference into a request for a file called `#n`.

### Verification — run these after touching anything above
```bash
node compare-layout.mjs --save   # snapshot every classed element's rect, BEFORE a change
node compare-layout.mjs          # ...then diff the live site against that snapshot
node compare-photos.mjs    # each rung vs its original, at four real device profiles
node verify-dist.mjs       # dist vs source: CSS rule counts, geometry, painted pixels
node perf.mjs after        # bytes, LCP, FCP, CLS, TBT — desktop and throttled mobile
node perf-scroll.mjs       # frame cost while scrolling, at 4x CPU throttle
node verify-touch.mjs      # the contact page's own checks, unchanged and still passing
node verify-locale.mjs     # the location bands' own checks, unchanged and still passing
```
`verify-dist.mjs` needs both servers:

```bash
PORT=3001 node serve.mjs
SERVE_ROOT="$PWD/dist" PROD=1 PORT=3002 node serve.mjs
```

**`SERVE_ROOT` is not optional, and leaving it off fails silently.** `serve.mjs` takes
its root from its own file location, not from cwd, so `cd dist && node ../serve.mjs`
serves the PROJECT ROOT: every URL 200s and the pages look right, because they are the
right pages — just the unbuilt ones. That made this tool compare the source site against
itself and report eight pixel-identical pairs, which is true and worthless. **The server
prints its root at startup; read it before trusting a dist run.** **Compare CSS rule counts, not just pixels** — a
stripping pass that ate one closing brace takes a whole rule block with it, and that
shows up in the count long before it shows up as a moved box.

**`compare-layout.mjs` and `verify-dist.mjs` should both report zero.** They did on
2026-08-24: no element moved anywhere across 1336 element rects, and all eight
page/viewport pairs were pixel-identical between source and `dist`. Anything else is a
regression.

`layout-snapshot.json` is that reference and is committed. **Re-save it only when a
layout change is intended**, and say so — re-saving to make a red run go green throws
away the only record of where the boxes used to be. It replaced an earlier arrangement
that diffed against `_baseline-*.html` copies of the pre-change pages, and the reason is
worth keeping: once those copies were tidied away the tool compared the live page against
a **404 body** and reported eight confident geometry differences. A missing snapshot now
exits 2 and says so.

Two notes on the harness itself. A comparison that flip-flops between identical and a
**bit-identical** difference is a cold-cache warm-up effect, not a bug — check by
comparing a build against *itself* before chasing it. And `naturalWidth` cannot be used
to identify a file any more; see the srcset note above.

## `_archive/`
The whole previous site, moved rather than deleted because this project has no git
history. Contains the old `index.html`, `assets/site.js`, every baked image and video,
both `bake-*.sh` scripts, the old design spec, and `CLAUDE.md.original` (the full
previous ruleset, including the reasoning behind every decision that was made).

It also holds `chirashi-plate-rimfit.webp`, the superseded plate cutout — see below.

**Do not read it for direction and do not restore from it** unless the user asks. It is
kept only so nothing is unrecoverable. It is also in a served directory, but `node build.mjs` derives its copy list from the
markup, so `_archive/` can no longer reach a deploy by accident. Delete it once the new
design is settled.

## Assets on hand
- `brand_assets/misono logo.jpeg` — the real logo, but a **photo of printed material**:
  angled, soft, on opaque paper. It cannot be dropped into a page as-is; it needs
  redrawing or a clean file from the client.
- `brand_assets/misono-mark.svg` and `misono-mark-mono.svg` — the mon **traced from that
  photo** by an earlier session. Both are reconstructions: verify against real artwork
  before shipping. The mono version is transparent and drawn to take its colour from CSS.
- `assets/img/food2-9.jpeg`, `foodinspo1.jpeg` — nine photographs of the restaurant's own
  dishes. Real Misono material and effectively irreplaceable, so keep them. They are
  ungraded phone snapshots shot under mixed light (some tungsten, some window-cool, some
  amber), so they need correcting per-frame before use, not one shared curve.
- `assets/img/chirashi-plate.webp` — the turning dish on the homepage. An alpha cutout,
  re-baked 2026-08-11 from `assets/img/foodfood.png`; the previous bake is in `_archive/`.
  Two things to know before touching it: its silhouette is cut at the **bowl**, and the
  bowl's centre is the **file's** centre, which is what lets it rotate without orbiting.
- `assets/img/r/` — the AVIF and WebP derivatives, ~200 files, all generated. **Never
  edit or hand-add anything here**; it is rebuilt wholesale by `bake-responsive.mjs` and
  its filenames are the contract the srcsets and the immutable cache headers rely on.
- `assets/fonts/*.woff2` — Cormorant Garamond (variable 300–400, plus italic 400) and
  Jost (variable 300–400), Google's own latin subsets, self-hosted. Re-fetch them the way
  they were fetched: puppeteer navigating to `fonts.googleapis.com` and `fetch()`ing the
  file URLs from page context — a direct navigation to a `.woff2` aborts.
- `assets/favicon.svg` — the mon, flattened from `brand_assets/misono-mark-mono.svg` with
  no `<use>` and no `currentColor`, since a tab icon inherits no CSS context. **An XML
  comment may not contain a double hyphen**: written the obvious way, the file stops being
  well-formed, and the browser shows a broken-image icon with a clean 200 on the wire and
  nothing in the console.
- No brand style guide exists. If one arrives, its values win over anything derived.

- `assets/img/about-plate.jpg` — the client-supplied counter shot on `about.html`'s plate
  section, delivered as `about alonepage.png` (1536x1024) and re-encoded to JPEG at q85
  (181K, checked against q80/q90 for 8-bit banding in its near-black field — none visible
  at any of the three). No crop or retouch, unlike the asset it replaced: this frame has no
  person in it. `object-position: 50% 58%` is deliberate, not centred — see `.plate__img`
  in that file for what a short, wide viewport does to a centred crop of this photograph.
  A stock photo (Pexels 9424910) held this slot until 2026-08-12 and needed both a chef's
  surgical mask and a health placard edited out; it and its bake script (`bake-about-room.mjs`)
  are gone now that a real asset exists. If sourcing a room shot again ever becomes
  necessary, the technique for both problems — the AVIF workaround below, and row-by-row
  interpolation for retouching a flat panel without leaving a seam — is worth rebuilding
  from first principles rather than hunting for it in history.

- `assets/img/about-ic{1,2}-*.jpg` — the two closing-section photographs (235KB the
  pair). Pexels 16388600 / 30682878, baked by `bake-about-ichie.py`. **Graded to 80 and
  64 — the chapters' band, not the experience section's** — because both are lit
  subjects in dark rooms. The 16-point spread runs the opposite way to the usual rule
  (a tight macro normally sits *above* a wide interior): here the macro's ground is a
  dark lacquered counter and the interior's is lit timber. `about-ic2-brush.jpg` is
  **4:3, the only landscape frame on the site**, and that is deliberate — it is what
  stops the two plates reading as a pair instead of as two depth planes.

- `assets/img/about-ex{1..3}-*.jpg` — the three experience photographs, 1100x1467 each
  (~650KB the set). Pexels 38539264 / 38773918 / 37996941, baked by
  `bake-about-experience.py`. **This set is graded to 90-108 mean, not the chapters'
  62-84, on purpose** — two of the three are lit rooms rather than lit subjects, the
  crudo's ground is a white plate that goes grey if pushed to 78, and three dark frames
  already sit above it on the same page. If a fourth section needs photographs, decide
  which band it belongs to before grading, not after.

- `assets/img/about-ch{1..4}-*.jpg` — the four chapter photographs, 1100x1466 each
  (~733KB the set). Pexels 36131817 / 30682797 / 9424913 / 36338002, cropped from 2:3 to
  3:4 and graded per frame. Nothing already on the site was reused, because every good
  photograph in `assets/img/` is already on screen somewhere else.

- `assets/img/contact-hero.jpg` — `contact.html`'s hero, 2000x1333 (476KB, in line with
  the site's other heroes at 434-586KB; the higher quality is kept deliberately because
  the frame is 47% shadow, which is where 8-bit banding lives). Pexels 19300593, baked by
  `bake-contact-hero.py`. **Graded to mean 60 and carrying no baked vignette at all** —
  the only bake here that does not, because its one light source is the pendant in the
  top-left corner and a baked vignette puts the lamp out. **It is a placeholder**: see
  the pending-content section below.

- `assets/img/locale-{mombasa,nairobi}.jpg` — the two location photographs, 2000x1125
  each (~1.1MB the pair), baked by `bake-contact-locations.py`. Pexels 13418220 / 9833516.
  **Both are placeholders and are flagged as such in the markup**, and on this section
  that matters more than elsewhere: a location band implies the picture *is* the place,
  and neither is. The Mombasa frame is the waterfront rather than Links Road; the Nairobi
  frame is Uhuru Park and the CBD, roughly 5km from Adams Arcade.

  **They are a fourth grading band, 108–118**, decided before grading rather than after.
  The three existing bands (62–84 chapters, 90–108 experience, 64–80 ichie) all grade
  something *lit inside a dark building*. These are open-air daylight frames of a whole
  district, and forced down to 90 a daylight aerial does not read as moody, it reads as
  drained. The band also has a hard floor from the composition: the marker cards are
  near-white, so the bake reports the **card zones** separately (Mombasa 151/86, Nairobi
  165/54) — a card on a sky above ~170 has a 1.4:1 edge and dissolves.

  Whichever frames replace them need **one property and no others: legible structure with
  at least two calm areas large enough to seat a card.**

### Baking images
`bake-chirashi-plate.py` + `bake-png-to-webp.mjs` in the project root, with the exact
reproduce command in the Python file's docstring. `bake-about-chapters.py`,
`bake-about-experience.py`, `bake-about-ichie.py`, `bake-contact-hero.py` and
`bake-contact-locations.py`, all with `bake-png-to-jpeg.mjs` + `fetch-pexels.mjs`, are
the same arrangement for the chapter, experience, closing, contact and location frames,
reproduce commands likewise in the docstrings.

**A near-white element laid OVER a photograph is a grading constraint, not a CSS one.**
The location bands were the first thing on the site to do it, and the fix belongs in the
bake: `bake-contact-locations.py` reports the mean luminance of the exact zones the cards
land in, and deepens the vignette until they hold. Reaching for a scrim in CSS instead
would have put a grey wash over a photograph the section exists to show.

**Pexels is thin on dark, cinematic Japanese counters with a calm centre.** Sweeps for
"omakase sushi counter", "sushi counter chef", "sushi bar counter interior", "teppanyaki
restaurant" and "elegant restaurant interior wood counter" returned food macros or
daylight-flat rooms almost exclusively; what finally worked came from "moody dark
restaurant interior". Budget for that before spending an hour on the literal terms.

**Judge a hero candidate by rendering the real heading over it at full size, not from a
contact sheet.** Thumbnails cannot answer the only question that matters — whether the
centre is calm enough to set type in — and they actively mislead: the strongest-looking
thumbnail in the contact sweep was a washi lantern that turned out to be a 240/255 object
sitting exactly where the heading goes, which no scrim can fix without destroying the
photograph.

**Desaturate before you warm, when the problem is a large flat cool field.** The
experience section's room frame has a green-grey plaster wall across most of it. Pushing
warmth at full saturation left the wall cold and turned the timber red — the fix is to
take saturation most of the way out first so the wall becomes neutral, *then* push the
warmth hard and let the one strongly coloured thing left carry the frame.

**Level a frame against the frames it shares a composition with, then against the band
its subject belongs to — in that order.** Three sections on `about.html` now sit on
three different bands (62-84, 90-108, 64-80) and each is right for what it holds. The
rule that a tight macro outranks a wide interior is about what is *lit*, not about how
close the lens is: the closing section inverts it because its macro's ground is a dark
counter and its interior's is lit timber.

**Grade the character by eye; solve the level.** Four stock frames from four
photographers arrive at four exposures — cropped and given only their artistic grade,
the chapter set measured 49, 60, 69 and 99 of 255, and each one looked right on its own.
`bake-about-chapters.py` sets contrast, saturation, warmth and vignette by eye but
bisects a **gamma per frame** until its mean luminance lands on a target. Aim for a band
rather than a single value: a wide night interior forced to the same mean as a lit macro
of one nigiri has been pushed somewhere it does not want to go.

**Pexels serves AVIF to Chrome**, whatever the `.jpeg` in the URL says, because the CDN
honours the Accept header — so a download lands as `ISO Media, AVIF Image` and has to go
through `sips -s format jpeg` before anything else will touch it. Pexels also blocks curl,
and `images.pexels.com` blocks cross-origin fetch from `pexels.com`; the way that works is
puppeteer navigating straight to the image URL and taking `response.buffer()`.

There is no `cwebp` and no ImageMagick on this machine, and `sips` reads webp but cannot
write it — so the webp encode goes through the Chrome that puppeteer already ships. Reuse
`bake-png-to-webp.mjs` for any other webp; it must be run from the project root, since it
resolves puppeteer from `node_modules/`. The same canvas-through-puppeteer approach is the
better tool for any PNG a client supplies that needs to ship as JPEG: `sips -s format jpeg`
works, but a canvas re-encode at the same nominal quality ran about half the file size on
`about-plate.jpg` — the difference is the encoder, not the setting.

**A cutout baked against one ground is not ground-independent.** The plate's first bake
fitted its rim rather than its bowl and left up to 52px of the pale surface the bowl
stands on baked in as opaque pixels. On the cream that was invisible. On the peach it
read as a light crescent, and because the plate turns, it orbited. Check any cutout
against the ground it will actually sit on, and measure the edge rather than trusting it.

**Known and not fixed:** the dish spec has the plate at 40.38% of the viewport, and
because that first fit took in the pale surface it has only ever rendered at ~38.2%.
Correcting it grows the plate ~32px at 1440 — a composition change, so it is being
left until asked for.

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.
- Measure the reference rather than eyeballing it, and measure it as a **share of viewport width** — a recording made at 1890px and a screenshot taken at 1440px cannot be compared in pixels.

## Brand Assets
- Always check the `brand_assets/` folder before designing. It may contain logos, color guides, style guides, or images.
- If assets exist there, use them. Do not use placeholders where real assets are available.
- If a logo is present, use it. If a color palette is defined, use those exact values — do not invent brand colors.

## Local Server
- **Always serve on localhost** — never screenshot a `file:///` URL.
- Start the dev server: `node serve.mjs` (serves the project root at `http://localhost:3000`).
- It compresses (brotli/gzip, text only) and sends ETags. Headers revalidate by default so
  a screenshot always sees the file on disk; `PROD=1` switches to immutable caching for
  `assets/img/r/` and `assets/fonts/`. `node build.mjs --serve` builds `dist/` and serves
  it with production headers on :3002.
- `serve.mjs` lives in the project root. Start it in the background before taking any screenshots.
- If the server is already running, do not start a second instance.
- `serve.mjs` refuses to bind an occupied port and says so. Other projects on this machine also use 3000 — if it is taken, run `PORT=3001 node serve.mjs` and screenshot `http://localhost:3001`. Check the served `<title>` matches this project before trusting a screenshot.

## Screenshot Workflow
- Puppeteer is installed locally in the project (`node_modules/`). Chrome cache is at `~/.cache/puppeteer/`.
- **Always screenshot from localhost:** `node screenshot.mjs http://localhost:3000`
- Screenshots save automatically to `./temporary screenshots/screenshot-N.png` (auto-incremented, never overwritten).
- Optional label suffix: `node screenshot.mjs http://localhost:3000 label` → saves as `screenshot-N-label.png`.
- Optional viewport (third arg): `node screenshot.mjs http://localhost:3000 label mobile` → `desktop` (default, 1440x900), `tablet` (820x1180), `mobile` (390x844), or `WIDTHxHEIGHT`.
- `screenshot.mjs` lives in the project root. Use it as-is.
- It captures **full page** and runs under `navigator.webdriver`. Anything that hides content until scrolled — `loading="lazy"`, `decoding="async"`, a scroll-triggered reveal — can render blank in a capture. Design the static state to be the finished state.
- **Since the 2026-08-24 performance pass, every photograph except each page's LCP image
  is `loading="lazy"`**, so a full-page capture shows more blank frames than it used to.
  That is the capture, not the page: scroll the viewport to the section and shoot it, or
  use the per-section shooters below, all of which already scroll for real.
- **`about.html`'s statement section is a live instance of that.** Full-page capture uses `captureBeyondViewport`, which never moves the layout viewport, so its `IntersectionObserver` does not fire and the section shoots **blank**. That is the capture, not the section. Scroll it to the viewport centre and shoot the viewport, or emulate `prefers-reduced-motion`, which skips the reveal and renders the composition outright. With JS off entirely it also renders complete — verified, 12,897 ink pixels below the fold.
- **The chapters section cannot be captured by `screenshot.mjs` at all**, for that reason plus a second one: it is several viewports tall and its state is a function of where you are inside it. Use `node shoot-chapters.mjs [width] [height] [p,p,p...]`, where each `p` is a position through the pin (0 is the moment it sticks, 1 the moment it lets go). It scrolls for real, waits two rAFs, shoots the viewport, and prints the `--d` and opacity of all four panels beside each filename — which is usually the faster way to tell a timing bug from a layout one.
- **`menu.html`'s opening entrance has its own tool** for the same reason plus a second
  one: a full-page capture never fires the observer, so the section shoots armed — that
  is, blank — and even with the observer firing, the shutter lands wherever a two-second
  choreography happens to be, which is not repeatable. `node shoot-flavors.mjs [width]
  [height] [ms,ms,ms...]` reloads the page per timestamp with `IntersectionObserver`
  stubbed so the section stays armed, adds `is-in` by hand, then pauses every transition
  and seeks it to the requested millisecond. It prints opacity, apparent scale and offset
  from rest per element; **a run at a large t reading `scale 1.000  offset 0.0, 0.0` on
  all seven is the proof the composition is untouched.** Two things it encodes:
  - **Do not replay by removing `is-in` and re-adding it.** Removing it starts a full set
    of reverse transitions, a paused animation never finishes and so is never dropped,
    and each pass then seeks a growing pile of half-finished transitions. Print the count
    and it is obvious — 15, 15, 14, 12, 9 across five passes of the same section. Look
    only at the PNGs and it is not.
  - **Scope any `getAnimations()` sweep to the section.** The reservation block's
    `reserve-drift` runs forever, and `finish()` throws on an infinite animation, so an
    unscoped sweep takes the run down over a section three viewports away.

- **`contact.html`'s `.touch` section has its own two tools**, for the same
  reasons `menu.html`'s opening does plus one of its own: it is **below the
  fold**, so the viewport has to be driven there before any of it is visible.
  `node shoot-touch.mjs [width] [height] [ms,ms,...]` seeds and pauses the
  entrance exactly as `shoot-flavors.mjs` does — reload per timestamp with
  `IntersectionObserver` stubbed, add `is-in` by hand, pause and seek — and
  prints opacity, apparent scale and offset from rest per element, with each
  element's predicted `p/(p−z)` beside it so a wrong number is legible rather
  than merely different. `node verify-touch.mjs` covers what is not a single
  moment: the field rules sampled from the render, fit across seven viewports,
  reduced motion, and the hero parallax. Scroll with `getBoundingClientRect`
  and `behavior: 'instant'`, never `offsetTop` — `.touch` is `position:
  relative`, so the reserve tooling's trap applies here unchanged.
- **The two location bands have their own two tools**, for the usual reason —
  `screenshot.mjs` shoots them ARMED, that is blank, because `captureBeyondViewport`
  never moves the layout viewport and the observer never fires. `node shoot-locale.mjs
  [width] [height] [p,p,...] [mombasa|nairobi|both]` scrolls each section through its
  travel and prints `--rise`, each element's apparent scale and its **painted rect
  against its content rect**; `node verify-locale.mjs` covers cap height, fit across
  seven viewports, the `.details`→`.locale` seam, reduced motion and every `var()`
  against `:root`. Three things they encode, all of which cost time:

  - **The entrance and `--rise` are different KINDS of thing and must be measured
    separately.** The entrance is a one-shot arrival; `--rise` is continuous scroll
    state. Shooting a position 140ms after scrolling to it catches the choreography
    partway and reports a layout that exists at no resting moment — the first run
    produced a heading at opacity 0.25 and a photograph at 0, which reads as a broken
    section rather than as a capture taken too early. `shoot-locale.mjs` drives every
    section once to let its entrance finish, **then** measures.
  - **`page.screenshot({clip})` takes PAGE coordinates, not viewport ones.** Passing a
    post-scroll `getBoundingClientRect()` straight in captures that far down from the
    top of the *document* — here, the dark hero. It does not error and the PNG looks
    like a real capture: the cap scan reported ink on every row and the seam check
    reported a step of 203. Add `scrollY`.
  - **Scan the FIRST GLYPH for a cap height, not the whole heading.** "Mombasa" has a
    `b` and "Nairobi" a `b` and a dotted `i`, so a full-width ink extent measures the
    **ascender**. It reported a 62px cap on a 59px font — a cap taller than its own em,
    which is what gave it away. Cross-check against `actualBoundingBoxAscent`; a
    constant ~2px excess is just the antialiased edge, and the two agreeing.

- **`index.html`'s hero has its own tool for the PORTRAIT crop**, and `screenshot.mjs`
  cannot stand in for it: a full-page PNG shows the hero at the top of a very tall
  image, where the one thing that matters — which quarter of the frame a phone actually
  sees, and what is under the type there — cannot be read off it. `node
  shoot-hero-mobile.mjs [width] [height] [pos,pos,...]` prints the visible window as a
  share of the SOURCE width (transform zoom included) and, per type element, the painted
  bed's mean luma and its worst 12px tile's contrast with the coordinates of that tile.
  A candidate may be written `54.5%|76%` to move the brand block with the crop — they
  are one decision. `SCALE=1.065` pins the drift at its far end. Two things it encodes:
  - **Sample the bed with the TYPE hidden — not the block.** The letters are white, so
    measured with them in place every crop reports as fine. But hide `.hero__brand`
    itself and its `::before` bed goes with it, and every position then reports as
    though it were unbedded. Hide `.hero__name`, `.hero__tagline` and `.hero__social`.
  - **The mean is the wrong instrument for type on a photograph.** It is what says a
    wordmark lying across lit cups is comfortable. Use the worst tile.

- **The reservation section has its own two tools**, because `screenshot.mjs` puts it three viewports down a tall PNG where the one thing that matters — whether the block fits a screen — cannot be read off it. `node shoot-reserve.mjs [page] [width|preset] [height]` scrolls it to the top of the viewport, shoots, and prints `--u`, whether the section fits, whether the copy column is clipped, the two heading lines as a share of width against the comp, and the photograph's mean luminance **as painted, filter and all**. `node compare-reserve.mjs [width] [height] [page]` prints the band-by-band gap table and the S-curve against the comp's own measurements. Two things they encode that cost an hour to find:
  - **Scroll with `behavior: 'instant'` and via `getBoundingClientRect`, never `offsetTop`.** `.reserve` is `position: relative`, so its `offsetTop` is not a document coordinate and the capture lands on whatever section happens to sit that far down; and the page sets `scroll-behavior: smooth`, so a plain `scrollTo` is still easing when the shutter fires. Both failures look like a correct screenshot of the wrong thing.
  - **`scrollHeight > clientHeight` is not a clipping test here.** The photograph drifts inside a mask that is holding still, so it always overruns its box by a few pixels and the section always reports overflow. Test the copy column's rect against the section's instead.
- After screenshotting, read the PNG from `temporary screenshots/` with the Read tool — Claude can see and analyze the image directly.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px".
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing.
- Judge subtle things (seams, banding, contrast) by measuring the PNG, not by eye — JPEG artefacts in a downscaled crop look exactly like a seam.
- **Clean up when done:** at the end of every assignment, delete the contents of `temporary screenshots/` (`rm -f "temporary screenshots/"*.png`). The PNGs are large and re-reading stale ones wastes tokens — regenerate fresh next time.

## Output Defaults
- One self-contained HTML file per page, all styles inline in a `<style>` block. The
  site is `index.html` + `menu.html`; add a page as a new file rather than a section.
- **Hand-written CSS, not Tailwind.** This was decided by the work, not by preference:
  the site is built out of mask gradients, per-image filter grading, radial blooms, SVG
  noise and keyframes that utilities cannot express, and the Play CDN's ~400KB of
  runtime-compiling JS buys nothing against that. Do not introduce Tailwind without
  being asked.
- Geometry that comes off a reference is written as a share of the viewport (or of one
  scale unit), never in pixels, and the derivation is left in a comment.
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT` — but check `assets/img/`
  first, most of what is needed is already there.
- **A new photograph is not finished until it has been through the responsive pipeline.**
  Add the `<img>` with its real `src`, `alt`, `width` and `height`, then run
  `measure-img-sizes.mjs --json`, `bake-responsive.mjs` and `apply-responsive-markup.mjs`
  — the last one wraps it in `<picture>` and wires the srcset. Give it a policy entry in
  `apply-responsive-markup.mjs` first, or it is left as a plain `<img>` and silently ships
  the full-size original.
- Mobile-first responsive.

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Pick a custom brand color and derive from it.
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans. Tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Use spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** Add a gradient overlay (`bg-gradient-to-t from-black/60`) and a color treatment layer with `mix-blend-multiply`.
- **Spacing:** Use intentional, consistent spacing tokens — not random Tailwind steps.
- **Depth:** Surfaces should have a layering system (base → elevated → floating), not all sit at the same z-plane.

## Hard Rules
- Do not add sections, features, or content not in the reference.
- Do not "improve" a reference design — match it.
- Do not stop after one screenshot pass.
- Do not use `transition-all`.
- Do not use default Tailwind blue/indigo as the primary color.
