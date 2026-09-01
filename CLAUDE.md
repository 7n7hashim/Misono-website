# CLAUDE.md — Frontend Website Rules

## Project: Li's Chinese Restaurant
A Chinese restaurant in Kenya with two branches. **Rebranded from Misono, a Japanese
restaurant, on 2026-08-26** — the architecture was kept and everything else was replaced.
Spec: `docs/superpowers/specs/2026-08-26-lis-rebrand-design.md`.

**Every fact on this site is researched, not invented, and is listed with its source in
that spec.** The short version, all read 2026-08-26 from Li's own site
(`lischineserestaurantnairobi.co.ke`), its published menu and its Mombasa listing:

| | |
|---|---|
| Mombasa — **the original** | Petrocity Plaza, 1st floor, Links Road, Nyali, 80112 · +254 799 402101 · Tue–Sun 11:00–21:00 |
| Nairobi — the second | Petrocity, Limuru Road, Gigiri (QR74+JR2) · +254 746 815 106 · Tue–Sun 11:00–22:30 |
| Both | closed Mondays |
| Email | reservations@ / info@ / orders@ / careers@lischineserestaurantnairobi.co.ke |
| People | Hari Khasu, Executive Chef · Morris Mativo, Manager |
| Private dining | 2 VIP rooms, 12–15 covers — **Mombasa only**, confirmed there and nowhere else |
| Services | reservations, takeaway, Uber Eats, full bar, free parking |
| Socials | IG @lischineserestaurant · IG @lischinese (Msa) · X @LisChinese · TikTok @lischineserestaurantnrb |

**The carte on `menu.html` is REAL** — 84 dishes with Li's own KSh prices, off the
published menu. Nothing on that page is invented, which reverses what it used to be.

**NEVER ASSERTED, and each for a reason:** no founding year for either branch (none is
published — the site says only that Mombasa came first); no drive times or distances on
the location cards; no single phone number presented as reaching both branches; no dish
that is not on the real carte.

### The ground
**The whole site is on a warm ivory, `--ground #F6EEE1`.** It replaced a muted peach with
the rebrand: the ivory reads pink beside a deep red, and the red is the accent the whole
palette now turns on. The `--cream` token is not a second ground — see the tokens table.

The two exceptions are both full-viewport photographs, not grounds: the homepage hero and
`about.html`'s opening. `body` stays on `--ink` behind each, deliberately — a failed image
then leaves white type on black rather than white type on ivory.

**A photograph is the only reason to leave the ivory.** Re-derive contrast per ground
rather than carrying it across, and expect roughly four things per section not to follow
from re-pointing the ground — on `about.html`'s statement they were the vignette's
polarity, the grain's blend mode, the heading's text-shadows, and the gradient tails that
are literals. The arithmetic for each is in that file, beside the declaration it belongs to.
### Pages
- **`index.html`** — the homepage. Full-viewport photographic hero, then the wok section,
  a sharing section (`#beyond`), the Peking duck feature, reservations (`#reserve`), and a
  closing footer nav. Every section below the hero is on the ivory.

  **The hero has a PORTRAIT crop of its own**, keyed on aspect ratio rather than width,
  because the aspect is what does the cropping. Desktop is untouched. Load-bearing:

  **THE FRAME WAS WIDENED 2026-08-27, 1.874:1 → 1.60:1 (1717x1073).** The hero read as
  too tightly cropped, and the zoom was compounding in THREE places at once — which is
  why no single change fixed it: the bake threw away 20% of the source HEIGHT to make a
  letterbox, CSS `cover` threw away another ~17% of the WIDTH on a 1.6:1 desktop box, and
  the drift ran 1.03 → 1.065 on top. A reader saw ~78% of the photograph. **1.60:1 is
  chosen rather than the source's native 1.50:1 for two reasons**: it matches a 1440x900
  viewport exactly, so `cover` crops nothing there, and the full frame clips the chef's
  forehead, which reads as a mistake. The crop's slack is taken entirely off the TOP
  (`ay=1.0`), which is where that head crop is.

  - **On a portrait viewport the vertical half of `object-position` does NOTHING.**
    `cover` scales this 1.60:1 frame to the short axis, which is the height, so the
    frame shows ~97% of its own height at every portrait size and only the x steers.
    The rule once said `44% 56%` and the 56 had never had any effect — it read as a
    decision for months. The visible slice is 27.7% of the source width at 390x844
    (23.9% before the widening), so *which* slice is still the whole design.
  - **A percentage anchor is aspect-stable, which is why one value serves every phone
    and the tablet.** Do not add per-device values.
  - **THE CROP IS A BALANCE, NOT A MAXIMUM, because the flame is both the photograph and
    the contrast problem.** Re-solved to `50%` on 2026-08-26 for the new frame. Pushed
    left far enough to be comfortable (20–44%) the phone gets a dark kitchen with a wok in
    it and no fire at all; pushed right (the old 54.5%) the flame lands ON the wordmark and
    the name measures 2.27:1 against a 3:1 floor. At 50% the flame is fully in frame and
    every floor clears.
  - **The wordmark sits at `top: 68%` on a phone.** Judge type over a photograph on the
    **worst 12px tile** under it, never on the mean: the mean under the name at the old
    crop was 17.4:1 while its worst tile was 2.27:1. Re-measured after the widening, at
    SCALE=1.045 (the drift's far end, the worst case): **9.35 / 5.90 / 11.55** (name
    needs 3:1, tagline 4.5:1, icons 3:1). **The wider frame IMPROVED two of the three
    margins** against the 4.80 / 6.56 / 8.07 it replaces, because the flame is now a
    smaller share of what a phone can see — widening a frame is a contrast move as well
    as a composition one. 54% and 58% both fail now (tagline 5.13 and 3.70). The crop is
    still moving while a reader looks at it, so a position solved at one zoom is solved
    for half the animation.
  - **`shoot-hero-mobile.mjs` candidates MUST carry their unit.** `50%`, never `50` —
    a bare number is invalid CSS, the page's own rule governs instead, and every row of
    the sweep comes back byte-identical. That is the same signature as the two-bed-
    declarations trap below, and it is not the tool being broken. The tool also pins the
    zoom itself (`SCALE`, default 1.03) rather than reading the page's 1.012, so its
    readings are conservative by that difference.
  - **The bed under the block: reach for the GEOMETRY before the depth.** Every hot tile
    is at the type's right end, so the peak sits right of centre — moving it 48% → 54% is
    the first move and the cheap one. But geometry alone was not enough for a frame with an
    open flame in it: a flame is 250 of 255 and it moves, where the old frame's worst
    feature was a row of lit cups. The phone bed went 0.44 → **0.64**, which is where the
    floors come back to what this design has always held. 0.70 and 0.76 both clear by more
    and were not taken: past ~0.7 the bed stops being a shadow and becomes a scrim, and at
    0.86 it reads as a smudge laid over the photograph.
  - **`EXTRA_CSS` on `shoot-hero-mobile.mjs` is how a bed is solved.** A crop and the bed
    serving it have to be measured in one run or the numbers are not comparable. Editing
    the page between runs works too, but note there are TWO bed declarations — the base
    one and a phone override inside `@media (max-width: 640px) and (max-aspect-ratio: 4/5)`
    — and below 640px it is the override that governs. Editing only the base one produces
    a sweep where every candidate reports identical numbers.
  - **The block sat at 76% for one revision because the tool was measuring with the bed
    switched off.** Hiding `.hero__brand` to sample what is under the type takes its
    `::before` with it, so every position reported as if it had no bed. When a measurement
    rules out most of the design space, check the instrument before accepting it.
- **`menu.html`** — the menu page. An editorial composition matched to
  `assets/img/menu isnpo.jpeg` (four portrait photographs floating around a heading
  centred on the viewport), then the carte, then the reservation section and the closing
  wordmark footer.

  **The carte is Li's REAL menu** — 84 dishes with real KSh prices across ten courses,
  read off the published menu on 2026-08-26. Nothing on the page is invented, which
  reverses what it used to be. Prices move; re-read before launch.

  **The PRELOAD goes on `menu-duck`, and which frame carries it is MEASURED.** It sat on
  `lis-hero` — `index.html`'s hero, carried across with the policy — where it is the
  *smallest* of the four frames, 151px on a phone against `menu-seafood`'s 189. So the
  page spent its one high-priority fetch on a frame that is not the LCP. Chrome reports
  the LCP element here as **`menu-duck`**: not the largest by area, because the entrance
  runs two seconds and LCP lands on whichever frame reaches full opacity first with real
  area. **Re-measure with a throttled profile before moving it — the answer is not the
  one geometry predicts.**

  **This page's LCP is gated by its own entrance, not by bytes.** It sits at ~1.7–2.3s on
  a throttled phone and barely moved when the preload was corrected, because the frames
  are still fading in. Do not reach for byte reductions to move this number, and do not
  shorten the choreography to chase it.

  **The four opening frames get DEDICATED files (`menu-duck`, `menu-dimsum`,
  `menu-seafood`, plus the hero), not marquee tiles.** Three of them reused a gallery tile
  at first, which is what the design they replace did — but the tiles are 560px tall,
  built for a marquee, and these frames paint into a 3:4 portrait slot needing up to 683
  device px. `dish4-dimsum` topped out at 445 and was genuinely soft. The dedicated files
  cost ~100KB on a mobile load and ~550ms of LCP on a throttled profile; the composition
  is the first thing on the page and the LCP element, so it is worth it.

  **Do not diagnose that with `naturalWidth`.** It is density-corrected once an `<img>`
  has a srcset, so `paintedWidth * dpr / naturalWidth` reports ~3x on frames that are
  perfectly served. Compare the CHOSEN RUNG'S REAL WIDTH ON DISK against the device
  pixels the layout asks for. That false reading is what prompted the change; the change
  was right anyway, but for one frame out of three.

  The opening composition has a **3D entrance** — the eyebrow, the two
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
- **`about.html`** — the about page. Seven sections, then the transplanted reserve and
  ending blocks. The first four alternate dark photograph and ivory so the page reads
  close / claim / wide / record;
  the next two open out into pinned sequences and the seventh closes it:
  1. the **opening**, a full-viewport photograph matched to `assets/img/about inspo.jpeg`;
  2. the **statement** ("BOLD, UNIQUE, / AND / UNMATCHED / CULINARY / CRAFTSMANSHIP"),
     matched to `assets/img/abouttt page.jpeg`;
  3. the **plate**, one full-bleed photograph and nothing on it — no eyebrow, no caption,
     no scrim — with a scroll parallax;
  4. the **figures**, four numbers on the ivory with a count-up. This one is **76svh, not
     100** — four numerals are ~150px of ink and a full viewport read unfinished rather
     than generous. **All four are now SOURCED** (2 restaurants, 150+ dishes, 30 ways
     with seafood, 6 nights a week), counted off Li's own published menu and its
     listings. The set they replace was invented outright and two of them — a seat count
     and a course count — were claims a guest could turn up and check.
  5. the **chapters**, built 2026-08-13 and matched to `assets/img/scroll through for
     about.png`. A pinned four-part scroll on the ivory: a 3:4 photograph on the left, a
     text column, and a roman-numeral track whose height is **the photograph's height
     exactly** — that is the reference's alignment rule, not a coincidence. Spec at
     `docs/superpowers/specs/2026-08-13-about-chapters-design.md`; read it before
     touching the motion.

  6. the **experience**, built 2026-08-13 and matched to `assets/img/about line
     scroll through.png`. A second pinned scroll (261svh) on the ivory: an editorial
     masthead, then three 3:4 photographs at staggered heights with one continuous
     gold line drawn through all of them. Spec at
     `docs/superpowers/specs/2026-08-13-about-experience-design.md`.

  7. the **reunion** (`.reunion`, renamed from `.ichie` with the rebrand), designed from
     scratch — no reference. The page's closing beat: 团圆 *tuányúan*, the reunion
     dinner, and by extension any table with everyone at it. A single screen on the
     ivory, **not pinned** (two pins back to back is already the limit), with two
     photographic plates in one `perspective` box at opposite Z drifting at opposite
     rates off the shared `track()` loop. The 5% size difference between the plates
     is perspective doing its job, not a layout error. Its front plate is **the only
     landscape frame on the site** — that is what stops the pair reading as a pair.
     The section carries NO service claim, deliberately: the version it replaces made
     two, and both needed checking.
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
  EMAIL), the two location bands, the FAQ (now EIGHT questions), and the transplanted reserve and
  ending blocks. Everything below the hero is on the ivory.

  **The page is no longer a dead end, and that reverses a decision made earlier
  the same day.** It was built deliberately without a reserve block or a footer,
  so the topbar was the only way out; the locations work added both. Three
  consequences, none of them oversights:

  - `:root` gained `--cream` — **not as a colour**, but as the hinge the ivory
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
  `--li-red`, `--ease-settle`, `--ease-pop` — and later `--cream` with
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
    floor on it. `--res-hair` measures **1.62:1** and is documented
    decorative-only; the rule takes `--res-gold`, which clears at **3.75:1** on
    the ivory. `.details` dropped its closing gradient in the 2026-08-18
    rebuild, so `--ground` is the binding ground here — there is no tail left
    to check against.
  - **`.details` NAMES ITS TWO CELLS Reservations and Email**, and carries the
    Nairobi line only. Li's two branches have two different numbers; each is on
    its own location card below, where there is room for it. Cramming both into
    a two-cell block is what makes a site claim one number reaches both.
  - **THE EMAIL IS 45 CHARACTERS AND THAT IS A LAYOUT CONSTRAINT.**
    `reservations@lischineserestaurantnairobi.co.ke` against the 26-character
    address `.details__value`'s size was solved for. At 1440 it still leaves
    516px of slack so desktop is untouched — but on a 390px phone it ran 94px
    past the content box, and the base rule's `white-space: nowrap` turned that
    into horizontal scroll for the whole document. The 639px block now wraps it
    (`overflow-wrap: anywhere`, since an email has no space and this domain has
    no hyphen) and drops it to 2.25tu. `verify-touch.mjs` reports it as
    `email-slack`; watch that number if the address ever changes.
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

**Both files carry a ground adaptation block at the foot of the `<style>`, and they say
the same things.** The copies are never touched to get onto the ivory: they take their
ground from `var(--cream)`, and the block re-points that one property at `--ground`.
Four things do not follow from it and are handled item by item — `--menu-body` and
`--menu-accent` (below AA on ivory at their cream values), `--res-gold` (fails 3:1),
the ending gradient's hardcoded tail, and, on `index.html` only, the dish hairlines.
Each block also records that the closing wordmark's alpha correctly needs **no** change,
because it looks like it should. **Put any future ground adaptation in those blocks,
never in the copies, and keep the two blocks in step.**

Entries into `menu.html` from the homepage: both "Explore Menu" CTAs and the footer
"Menu" link. Keep them pointed there.

### Design tokens
Established in `index.html` and reused. Do not invent alternatives to these.
**All re-derived against the ivory on 2026-08-26** — none was carried across from the
peach, which is the standing rule.

| token | value | ratio on the ground | note |
|---|---|---|---|
| `--ground` | `#F6EEE1` | — | warm ivory. Every section, every page |
| `--ink` | `#0B0806` | — | behind the two full-viewport photographs only |
| `--menu-ink` | `#241A14` | 14.79:1 | display type |
| `--menu-body` | `#6A574A` | 5.93:1 | body |
| `--menu-accent` | `#A3221C` | 6.51:1 | the deep red — eyebrows, rules, links |
| `--li-red` | `#A3221C` | 6.51:1 | same value, the FILL/focus role. White on it is 7.49:1 |
| `--brand-red` | `#CD393E` | 4.29:1 | the measured logo red. **Device only — never type** |
| `--res-gold` | `#9C7230` | 3.75:1 | non-text boundary |
| `--res-hair` | `#D9B98A` | 1.62:1 | decorative only, no minimum applies |

**THE ONE RULE THE WHOLE RE-SKIN TURNS ON: red is a LIGHT-ground colour here.**
`--menu-accent` measures 6.51:1 on the ivory and **2.67:1 on `--ink`**. Anything that has
to be read on a dark section takes gold or ivory instead. Reaching for the accent on a
photograph is the mistake this palette makes available.

`--brand-red` #CD393E is the red measured off the official `logo.jpg`. It clears the 3:1
non-text floor and fails AA for body text. It colours the mark and nothing else.

**The old token NAMES were kept as the values moved**, because there are ~1,400 `var()`
call sites across four pages and renaming all of them to move a palette is how a rebrand
breaks a layout. `--menu-*` and `--res-*` therefore no longer describe a menu or a
reservation — they are the site's ink / body / accent / boundary / hairline roles.
`--misono-indigo` is the one that *was* renamed, to `--li-red`, because it carried the
old brand's name; it is the focus ring and the location pill's fill.

A token that is used but not defined **fails silently, and it has happened twice on the
same page in the same week.** `--menu-accent` was missing from `about.html`'s `:root`
until the chapters section: every `var(--menu-accent)` was an invalid declaration, so type
fell back to inherited ink and a rule that took the accent as its `background` did not
draw at all. Then `--res-gold` was missing when the experience section became the first
thing on the page to need a non-text boundary: the path and the rings inherited
`stroke: none` and did not draw, while the dots fell back to SVG's default fill and came
out **black** on the ground. Nothing errored and nothing logged either time. When a page
starts using a token role it has not used before, check `:root` actually carries it.
`verify-locale.mjs` now checks every `var()` in `contact.html` against `:root`.

**The same class of failure, in a third form: `perspective` is inherited by nobody.** It
applies to an element's **direct children** and stops, so a `translateZ` on a grandchild
has no camera to be projected through — see `menu.html`'s entrance, where the display
lines sit two levels below the element the property was first declared on. Nothing errors
and it does not look broken either; it looks like a decision. If a depth transform is not
projecting, check where the property is declared against where the transformed element
actually sits in the tree before touching any numbers.

`--ember` was declared in two files and read by nothing on the site. **It was deleted
with the rebrand**; `grep -c 'var(--ember)' *.html` had returned zero for weeks. Do not
reintroduce a token on the strength of a note — check whether it is actually read.

`--cream #FCF8F5` **appears nowhere on any page as a colour.** The token exists because it
is the name the transplanted section CSS uses for "my ground", and re-pointing that one
property is what moves those sections onto the ivory without editing them. Do not reach
for it as a colour, and do not delete it — it is the hinge all three adaptation blocks turn.

Type is **Cormorant Garamond** (display, 300/400) with **Jost** (utility, 300/400).
Never pair anything else without being asked. `contact.html` also sets four glyphs of
Simplified Chinese; **that stack is SC-first on purpose** — the Japanese faces it used to
name all carry 联系我们, so nothing would have looked broken, but several of those
characters have different regional glyph forms and a Chinese restaurant setting Chinese in
Japanese shapes is an error only the people it matters to would notice.

### Still to confirm with the client
Everything on this site is **researched from public sources, not client-confirmed.** The
sources are listed in the rebrand spec. In priority order:

- **The two phone numbers and the email.** +254 746 815 106 (Nairobi, on the official
  site) and +254 799 402101 (Mombasa, on its TripAdvisor listing);
  reservations@lischineserestaurantnairobi.co.ke. Each branch carries its own number on
  its own location card, which is why `.details` presents one number labelled
  Reservations rather than implying one line reaches both.
- **Whether the Nairobi number takes WhatsApp.** The reserve CTA on all four pages says
  "Opens WhatsApp" and links `wa.me/254746815106`. The number is real; WhatsApp on it is
  not verified, and if it is wrong the primary booking CTA is a dead end.
- **The opening hours.** Both branches Tue–Sun from 11:00, closed Mondays; Nairobi to
  22:30, Mombasa to 21:00. **The shared reserve block says only "Tuesday – Sunday /
  Closed Mondays"** — it is byte-copied to four pages and cannot assert one branch's
  closing time as the house's. The exact times live in the location bands and the FAQ.
  **Those two must stay in step**; it is the same claim twice on one page and that pair
  has drifted before.
- **The private dining answer.** Mombasa's two rooms at 12–15 covers are in its listing.
  Nairobi's private events are on Li's own site but no room or capacity is published, so
  the FAQ says "takes enquiries" and stops. **Do not make it more confident.**
- **The dietary answer.** Vegetarian breadth is countable off the real carte and is
  stated plainly. **Halal, vegan and gluten-free are NOT confirmed for either branch**,
  the answer says so in bold, and allergies go to a phone call. That is the honest
  position, not a hedge — do not soften it.
- **The prices.** Real as of 2026-08-26, but a menu moves. Re-read before launch.

**`contact.html`'s enquiry form does not submit, by decision rather than oversight.**
There is no backend; `mailto:`, WhatsApp and a third-party endpoint were all offered and
design-only was chosen. A handler cancels the submit event for one reason — a form with
no action reloads the page and throws away everything a guest typed. **There is
deliberately no success state**, because telling someone their message was sent when
nothing was sent is worse than a button that visibly does nothing. To wire it up: give
the `<form>` an action and delete that handler.

**Every photograph on the site is a placeholder and is flagged as one in the markup.**
Li's own imagery is not available at usable resolution or licence. The frames are Pexels,
matched dish by dish to dishes that are actually on Li's carte, and graded to the site's
existing bands. Each one's markup comment names the single property a replacement has to
have. The two location photographs matter most: a location band implies the picture IS
the place, and neither is — Mombasa is the waterfront rather than Links Road in Nyali,
Nairobi is Uhuru Park and the CBD, ~10km south of Gigiri.

**The logo is a reconstruction.** The only artwork obtainable is a 150x150 JPEG on an
opaque white square. See `brand_assets/README.md` for how the mark was rebuilt and why
the wordmark is set in Cormorant rather than in the logo's own lettering. **Ask the
client for vector artwork.**

**Written rather than sourced, and all of it about Chinese cooking in general rather
than about Li's specifically:** the four chapters and the experience cards on
`about.html`, the `Tuányúan` closing section, the four parts of the Peking duck on
`index.html`, and the section copy throughout. None of it makes a service claim a guest
could turn up and check — that was the specific failure of the copy it replaced, which
asserted a seat count, a course count, a nightly service and a founding year.

### Specs
Design decisions are written up in `docs/superpowers/specs/`. Read the relevant one
before changing a page that has one — it records what was measured and why, which is
not recoverable from the CSS alone.

## Performance
Optimised 2026-08-24, re-audited 2026-09-01. The site was carrying 1.4–2.9MB per page and
taking 7–14.6s to finish loading on a throttled phone; it now carries 0.18–0.43MB and
finishes in 1.5–3.4s, with **no change to any layout, any photograph's grade, or any
animation**.

**The 2026-09-01 pass took another 392KB off the eight page/profile pairs** — and did it
while *adding* 7KB of icons to every page and replacing five stale photographs with the
correct, heavier ones. Nearly all of it was one page: `contact.html` went **816K → 427K**
on desktop and 421K → 327K on mobile, because the ladder had no rung for a non-retina
desktop. `about.html` went the other way, +35K, and that is the price of serving the
right photograph rather than the Misono one it had been serving. Verified after: no
element moved anywhere across all eight page/viewport pairs, `dist` renders pixel-identical
to source, and scrolling holds a 16.7ms median with **zero tasks over 50ms** on every page
at 4x CPU throttle.
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

**THAT TRAP HAD ALREADY FIRED, AND THE SITE SHIPPED WRONG PHOTOGRAPHS FOR DAYS.**
Audited 2026-09-01: of the 24 derivative files whose width happened to survive the
rebrand, **18 were still the Misono photograph** — `reserve-interior` (the reservation
block, i.e. ALL FOUR PAGES), `contact-hero`, `about-plate`, `about-ch2-hand` and
`about-ex3-room`. The `<img src>` JPEG fallback was correctly Li's; every browser that
takes AVIF or WebP — which is every current browser — got the old restaurant's picture.

**Nothing detected it, and three separate checks each had a reason not to.** The rungs'
dimensions matched, so a geometry check passed. Both photographs were graded to the same
band, so mean luma agreed to within 0.7 of 255 and no grading check fired. And
`compare-photos.mjs` measures a rung against **its own source**, which for a stale file
means measuring the old photograph against the new one and reporting it as a quality
number rather than as a wrong image. What finds it is PSNR between the SHIPPED rung and
the CURRENT source: a re-encode scores 40dB and up, a different photograph scores 8–12.

The fix is a clean re-bake, not a repair — `rm -rf assets/img/r` then
`node bake-responsive.mjs --force`. **After any source is re-cropped or replaced, delete
the directory rather than trusting `--force`**, and re-run
`apply-responsive-markup.mjs` after, since deleting rungs changes the ladder.

**`bake-responsive.mjs` DOES NOT NOTICE A CHANGED SOURCE AT THE SAME WIDTH, and the
failure is silent.** It keys on the output filename, which is `stem-width`, so when
`lis-hero.jpg` was re-cropped 1.874:1 → 1.60:1 on 2026-08-27 at the same 1717 width, the
run wrote only the two rungs whose widths were *new* (1210, 1450) and left five carrying
the old geometry. Nothing errored; the report said every variant met its PSNR floor,
because every variant it actually encoded did. The page then served a 1.874:1 rung to a
box expecting 1.60:1 on most viewports. **`ls -la assets/img/r/` and read the
timestamps**, or check a rung's real aspect with `ffprobe`, before believing a re-bake —
and `rm assets/img/r/<stem>-*` first when a source has been recropped. `--force` does the
same job for every image at once (~36s for the whole site).

**Deleting rungs changes the ladder, so `apply-responsive-markup.mjs` MUST run after.**
The widths are demand-derived, and the widened hero's demand produced 1210/1450 where the
old one produced 1020/1270. The markup and the `<link rel=preload imagesrcset>` both still
pointed at the deleted widths until the wiring pass was re-run.

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
  to 6303.6 at 1440. Nothing looked wrong. The nine tile ratios and **both** reunion
  plates are therefore **pinned in CSS**, which also means the layout no longer depends on
  which rung was chosen. Everything else is `width:100%; height:100%; object-fit: cover`
  in a sized box.

  **The reunion BACK plate was missed until 2026-09-01, on reasoning that was true of
  only one layout.** It was left unpinned because it is `height: 100%` in a sized box —
  correct on desktop, where `.reunion__plate--back` carries `aspect-ratio: 3 / 4`, but
  below that breakpoint the plate has no height of its own and the image drives it. A
  ladder that gained a 350px rung rounded 1466x1100 to 466 rather than 466.7 and moved
  the whole reserve block up 0.7px on a phone — 43 elements, which is what
  `compare-layout.mjs` is for. **When a rule is justified by "it is in a sized box",
  check every breakpoint's box.**
- **`sizes` is PER PAGE.** `lis-hero` is a full-viewport hero on `index.html` and a
  15vw framed photograph on `menu.html`. One merged value made `menu.html` fetch — and
  preload — the 1717px rung to paint a frame a fifth that wide. **That fix was silently
  defeated for days and was only caught on 2026-08-27.** `apply-responsive-markup.mjs`
  reads its hint from **`img-manifest.json`**, not from `img-sizes.json`, and
  `bake-responsive.mjs` was not carrying `sizesByPage` into the manifest — so
  `sizesFor()` fell through to the merged `sizes` on **every** run of the pipeline, and
  `menu.html` was handed index's `101.4vw`, preloading a 1210px rung at
  `fetchpriority="high"` to paint a 150px frame. The field is carried now. **When a
  per-page value looks wrong, check the manifest rather than `img-sizes.json`** — the
  measuring tool had it right the whole time. Verify by reading `currentSrc` off the
  real page at a real dpr, not by reading the srcset.
- **The LADDER is the union of every page's demand, not the merged maximum per
  viewport.** A rung only helps if it sits just above a real request. The plate is 1271
  device px on `index.html` and 295 on `menu.html`; a ladder built from merged maxima had
  no rung below 810 and `menu.html` fetched 227KB for a 171px frame.
- **`naturalWidth` is density-corrected once an `<img>` has a srcset**, so it reports the
  painted intrinsic size of the chosen rung, not the file's size. `measure-img-sizes.mjs`
  reads true dimensions from disk with ffprobe for exactly this reason. Read off the DOM
  after the responsive pass, the hero measured 371px and the plate measured 0, and every
  ladder silently collapsed to nothing.
- **`duck-plate` is WebP-only and gets the WHOLE ladder.** It is the one alpha cutout
  on the site; ffmpeg cannot carry an alpha channel into AVIF here (libsvtav1 has no gray
  encoder for the aux stream) and **the failure is silent** — the encode succeeds and
  returns a fully opaque image, verified 30.4% transparent in, 0.0% out. Every other
  image gets only the two ends of its WebP ladder, because WebP is a fallback tier there;
  for this one WebP *is* the ladder, and thinning it left every device above 340px
  fetching the 1122 rung.
- **The ladder is thinned by GAP, not by position** (changed 2026-09-01). The old rule
  spliced rungs out of the middle until five remained, which is right only when an
  image's demand is narrow. `lis-hero` is asked for at 101.4vw on `index.html` and
  15.2vw on `menu.html` — a 6.1x span — and middle-thinning removed exactly the rungs
  `menu.html` needed, leaving `[280, 350, 1210, 1450, 1717]`: a **3.46x hole** where
  every other ladder on the site sits between 1.2 and 2.1. A 390px phone fetched the
  1210 rung, 36KB, to paint a 450px frame, at `fetchpriority=high` on that page's LCP
  path. The rule now drops whichever rung leaves the smallest hole, keeps both ends, and
  stops early rather than opening a gap wider than 1.60; five is the target, seven the
  ceiling. **Rungs cost disk and bake time, not reader bytes** — a reader still
  downloads exactly one.
- **A rung that a WIDER rung beats on bytes is pruned.** The CRF search runs per rung
  against that rung's own reference, so neighbours settle on different points of a coarse
  grid: `menu-seafood` came out 152K at 710 and **145K at 900**. Such a rung is strictly
  dominated — the wider file is sharper AND smaller — so a phone picking it by `sizes`
  downloads more to see less. Pruning only ever moves a request UP the ladder, and every
  surviving rung has already cleared the same PSNR floor. Eight were pruned on the first
  run. The bake prints them under `PRUNED`; **delete the orphaned files afterwards**, or
  they sit in `assets/img/r` referenced by nothing.
- **`measure-img-sizes.mjs` takes the WIDEST each image is ever painted, sampled through
  the scroll** (changed 2026-09-01). `getBoundingClientRect` includes transform scale and
  this site animates, so one reading at the end of a scroll caught whatever the
  choreography was doing: the three menu frames, the turning duck plate and the
  parallaxed contact hero each reported a different width every run and the ladders
  churned by up to 40px with nothing in the design changed. **Measuring at rest
  (`prefers-reduced-motion`) is repeatable and wrong in the other direction** —
  `about-opening` rests at 1440 and is painted at 1499 while the parallax runs, so a
  rest-derived ladder put its nearest rung at 1500 against a request of 1500.5 and the
  page fetched the 1880. A max is stable *and* is the quantity that matters, since
  under-serving the peak is what makes a photograph soft. It caught the duck plate's real
  peak, 89.8vw → 96.9vw.
- **Desktop demand is sampled at dpr 1 as well as at retina.** Every desktop row in the
  viewport table assumed a retina panel, but a 1080p or 1440p external monitor is the
  commonest desktop configuration there is — and it is what `perf.mjs`'s own desktop
  profile emulates. Without it the locale bands' nearest rung sat at 1220 against a real
  request of 1228, and a 1440 desktop fetched the 1570 rung: **422KB to paint 1228
  pixels.** It goes into `devAll` only, so `sizes` — derived from `vw`, which is
  dpr-independent — is untouched and the transplanted reserve block stays byte-identical.
  This single change took `contact.html` from 816K to 427K on desktop.
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

### Two tooling traps found during the 2026-08-26 rebrand
Both were silent, both cost time, and both are fixed in the tools:

- **`apply-responsive-markup.mjs` tested for the STRING `<picture>`, not the element.**
  Every page's CSS carries two comments that mention `<picture>` by name, so on pages
  unwrapped back to bare `<img>` it took the "already wrapped" branch, found nothing to
  refresh, and printed `refreshed 0 <picture> candidate lists` — which reads exactly like
  a successful no-op. The guard now requires `<picture>` followed IMMEDIATELY by `<source`
  or `<img`; a looser "…`<img>` somewhere after it" test still matched, because the prose
  in the very next comment block contains both.
- **`page.screenshot()` returns a `Uint8Array`, and `Uint8Array.toString('base64')`
  ignores its argument** and returns the bytes as a comma-separated decimal list. Every
  pixel-scanning tool built its data URL that way, so the URL was silently malformed and
  the only symptom was an `EncodingError` from `img.decode()` several frames later. Eight
  tools were wrapped in `Buffer.from(...)`. `Buffer.isBuffer()` on the result is the quick
  check if it recurs.

### Verification — run these after touching anything above
```bash
node compare-layout.mjs --save   # snapshot every classed element's rect, BEFORE a change
node compare-layout.mjs          # ...then diff the live site against that snapshot
node compare-photos.mjs    # each rung vs its original, at four real device profiles
node verify-rungs.mjs      # every rung IS its own source photograph (see below)
node verify-dist.mjs       # dist vs source: CSS rule counts, geometry, painted pixels
node perf.mjs after        # bytes, LCP, FCP, CLS, TBT — desktop and throttled mobile
node perf-scroll.mjs       # frame cost while scrolling, at 4x CPU throttle
node verify-touch.mjs      # the contact page's own checks, unchanged and still passing
node verify-locale.mjs     # the location bands' own checks, unchanged and still passing
```
**`verify-rungs.mjs` is the guard against the stale-derivative bug**, and it is the one
check here that found a live fault rather than confirming its absence. It compares each
shipped rung's luma against its CURRENT source downscaled to that rung's size: a
re-encode of the same photograph scores 40dB and up, a different photograph scores 8–12,
and there is no middle ground to tune against. Exit 1 and the fix line if any fail.
`--quick` does the widest AVIF and WebP per image. Two things it encodes, both of which
produced confident false positives first:

- **The alpha cutout is compared over opaque pixels only, and the mask is ERODED.**
  `duck-plate` reported 21dB — the signature of a wrong photograph — on files baked from
  that very source minutes earlier. The bake resizes through Chrome's canvas and this
  check through swscale, and on a hard-edged cutout those two disagree along the rim by
  far more than compression does. Only the 1122 rung passed, which is the source's own
  width and so resampled by neither: **a failure that spares exactly the un-resampled
  rung is a resampler mismatch, not a stale file.**
- **`yuva420p` is what WebP reports**, and it neither ends in `a` nor starts with one of
  the packed RGBA names. A format test that missed it left the gate silently inactive.

**Negative-test it after changing it.** Restore a known-old derivative over a current one
and confirm it reports STALE — a checker of this kind that has only ever printed green is
indistinguishable from one that cannot fail.

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

## Deploying — Vercel
`vercel.json` is the deploy config and it carries **no comments**, deliberately. Vercel
validates it against a strict schema that rejects *any* additional property, so the
`"//": "..."` convention fails the deploy outright — `Invalid vercel.json - should NOT
have additional property`. The reasoning for every line therefore lives here:

- **`outputDirectory: "dist"`.** `npm run build` runs `build.mjs`, which writes `dist/`;
  Vercel looks for `public/` by default. **The build succeeds and the deploy fails after
  it**, which reads as a build error and is not one — the log ends with four green page
  rows and then `No Output Directory named "public"`.
- **The `headers` mirror `serve.mjs` PROD=1 exactly.** One year immutable for
  `/assets/img/r/` and `/assets/fonts/`, one day for the rest of `/assets/` and
  `/brand_assets/`, revalidate for HTML. Immutable is safe on those two paths **because
  those filenames are content-addressed by width** — `bake-responsive.mjs` regenerates
  them wholesale and a changed image gets a changed name. Do not extend it to anything
  hand-named.
- **Rule ORDER is load-bearing.** Vercel applies every matching rule and the last match
  wins per header key, so the general `/assets/(.*)` must come BEFORE the two specific
  paths. Reversed, the immutable rules are silently overwritten by the one-day rule and
  nothing anywhere reports it.
- **`cleanUrls: false`, deliberately.** Every internal link on the site is an explicit
  `menu.html` / `about.html` / `contact.html`, including in the ending block copied
  byte-for-byte across four pages. `cleanUrls` puts all of them behind a 308.

`.vercelignore` keeps `_archive/`, `docs/`, `perf-results/`, the screenshot scratch and
the CLI's own `.env*` / `.vercel` credentials out of the upload. Verified by building
from a copy with those directories removed: same 203 assets, all four pages, exit 0.

**A git-connected redeploy rebuilds the commit it was pointed at, not `main`'s tip.** A
redeploy triggered from the dashboard after a fix was pushed cloned the commit *before*
the fix and failed identically — check the `Cloning ... (Commit: xxxxxxx)` line in the
log against `git rev-parse --short origin/main` before concluding the fix did not work.

## `_archive/`
The whole previous site — **and, since 2026-08-26, all of Misono's photography and bake
scripts.** Moved rather than deleted. Contains the old `index.html`, `assets/site.js`,
every baked image and video, the old design spec, `CLAUDE.md.original`, and:

- `_archive/misono-photography/` — 35 originals: the nine dish photographs that were the
  previous restaurant's own material, the client-supplied hero and counter masters, the
  chirashi cutout, and every teppanyaki/sushi frame. **They belong to a different
  restaurant and must not reach this site.**
- `_archive/misono-bakes/` — the five superseded `bake-*.py` scripts and the old mon SVGs.

**Do not read it for direction and do not restore from it** unless the user asks. It is
kept only so nothing is unrecoverable. `node build.mjs` derives its copy list from the
markup, so `_archive/` cannot reach a deploy by accident.

## Assets on hand
- `brand_assets/lis-logo-official-150.jpg` — **the real logo, and the only artwork there
  is: 150x150, JPEG, opaque white square.** Measured red **#CD393E**, black **#1B191A**.
  At that size it cannot be a hero wordmark and cannot sit on a photograph.
- `brand_assets/lis-mark.svg` — the mark **redrawn** from it and inlined into all four
  pages. Ring and chopsticks are measured geometry; the `Li's` wedges are least-squares
  fits of the source edges (residual 0.17 units) rather than a pixel trace, which shipped
  visible staircase artefacts. **A reconstruction — verify against official artwork.**
  Full method in `brand_assets/README.md`.
- **The site icon set, baked by `bake-favicons.mjs`** (2026-09-01). Seven files wired
  into all four pages, and **two different drawings rather than one file scaled**:

  - **The small mark** — `assets/favicon.svg`, `favicon-16.png`, `favicon-32.png` — is
    the full mark reduced to its two structural elements, the red ring and the crossed
    chopsticks, with the lettering dropped. At 16px the full mark collapses into a red
    blob with dark streaks through it: the ring's stroke lands at 1.1px and the `Li's`
    wedges at well under a pixel. The small drawing thickens the ring to 13/100 and
    pulls it right so the two elements never merge.
  - **The chopsticks stay LEFT of the ring's centre, as they are in the real mark.**
    Centred, they read as a **prohibition sign** — a circle with a line through it —
    which is the one thing this icon must not look like. That was tried and rejected.
  - **The large mark** — `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png` —
    is the full artwork, lettering and all, **inset to 78%**. iOS and Android mask these
    to a rounded shape or a circle and the mark's ring spans 92% of its viewBox, so
    uninset it loses its edges to the mask.
  - **Both sit on an OPAQUE ivory ground.** The chopsticks are `#1B191A`; on a
    transparent icon they vanish against a dark browser tab. The ground is what keeps
    every element in the colour role the palette documents.
  - `assets/site.webmanifest` carries the 192 and 512 tiles. **A manifest names its
    icons in JSON, which `build.mjs`'s HTML attribute scanner cannot see** — left alone,
    those two tiles were the one part of the set that never reached `dist/`, and nothing
    reported it, because the manifest copies fine and every page renders. `build.mjs`
    now parses the manifest and follows them.
  - **An XML comment may not contain a double hyphen**: written the obvious way the SVG
    stops being well-formed and the browser shows a broken image with a clean 200 on the
    wire and nothing in the console. `favicon.svg` therefore carries no comments — the
    reasoning lives in `bake-favicons.mjs` instead.
- No brand style guide exists. If one arrives, its values win over anything derived.

**Every photograph is a Pexels placeholder baked by `bake-lis-photography.py`**, which
carries the source id, crop, grade and target band for all 27 frames in one table, plus
the reproduce command. The `.dish` cutout has its own script, `bake-duck-plate.py`.
Each frame's markup comment names the single property a replacement must have.

- `assets/img/duck-plate.webp` — the turning plate on the homepage, an alpha cutout of a
  Peking duck pancake. **Three things decide whether the file works, and all three are
  about the fact that it TURNS:** the plate's centre must be the file's centre or it
  orbits; the plate is an ellipse in the source (ry/rx 0.9410, the camera ~20° off
  vertical) and is scaled circular or it wobbles once per revolution; and the silhouette
  comes from a flood of the GROUND inward from the border, not a threshold on the plate,
  so no pale surface is left baked onto the rim. **The white plate centre reads as ground
  to any brightness test** — it survives only because the rim encloses it and the border
  flood cannot reach it. Do not replace the flood with a threshold.
- `assets/img/gallery/dish1..9-*.jpg` — the nine marquee tiles. **Their WIDTHS are the
  nine the row has always had** (856, 671, 510, 445, 563, 564, 637, 450, 306, all 560
  tall), so `.beyond__track` keeps its measured width and the marquee's percentage
  translate is untouched. A replacement must keep its slot's width.
- `assets/img/menu-{duck,dimsum,seafood}.jpg` — 900x1200, dedicated to `menu.html`'s
  opening frames. See that page's note for why they are not marquee tiles.
- `assets/img/locale-{mombasa,nairobi}.jpg` — the two location photographs, **kept from
  the previous build** because they are generic city frames rather than restaurant ones.
  They are a fourth grading band, 108–118: the other bands all grade something lit inside
  a dark building, and a daylight aerial forced to 90 does not read as moody, it reads as
  drained. The band has a hard floor from the composition — the marker cards are
  near-white, so `bake-contact-locations.py` reports the CARD ZONES separately (Mombasa
  151/86, Nairobi 165/54); a card on a sky above ~170 has a 1.4:1 edge and dissolves.
- `assets/img/r/` — the AVIF and WebP derivatives, ~200 files, all generated. **Never
  edit or hand-add anything here**; it is rebuilt wholesale by `bake-responsive.mjs` and
  its filenames are the contract the srcsets and the immutable cache headers rely on.
- `assets/fonts/*.woff2` — Cormorant Garamond and Jost, variable 300–400, Google's own
  latin subsets, self-hosted. Re-fetch them the way they were fetched: puppeteer
  navigating to `fonts.googleapis.com` and `fetch()`ing the file URLs from page context —
  a direct navigation to a `.woff2` aborts.
- The reference comps in `assets/img/` (`heroinspo.png`, `map inspo.png`, `menu
  isnpo.jpeg`, `scroll through for about.png`, `about line scroll through.png`,
  `inspooooo.png` and the rest) are **kept**. The architecture they document is the
  architecture the site still has. `build.mjs` keeps all 35MB of them out of the deploy.

### Baking images
`bake-lis-photography.py` covers every frame; `bake-duck-plate.py` the one cutout. Both
take `bake-png-to-jpeg.mjs` / `bake-png-to-webp.mjs` and `fetch-pexels.mjs`, with the
reproduce command in each docstring. `bake-contact-locations.py` still bakes the two
location frames.

**THE BAND IS CHOSEN BEFORE GRADING, NOT AFTER**, and the bands are:

    hero            44-57     dark rooms with type over them
    reserve         64        a laid table behind the gourd clip
    about opening   71
    about plate     37        full bleed, nothing on it, allowed to be black
    chapters      62-84       lit subject in a dark room
    experience   90-108       lit rooms and white plates
    reunion       64-96
    contact hero    60        no baked vignette
    locale       108-118      open-air daylight
    gallery tiles  ~112       a marquee on a light ground, must stay appetising

**Grade the character by eye; SOLVE the level.** Frames from different photographers
arrive at different exposures — the chapter set measured 49, 60, 69 and 99 of 255 and
each looked right alone. The bake sets contrast, saturation, warmth and vignette by eye
but **bisects a gamma per frame** until its mean lands on the target. Gamma rather than a
gain, because a gain clips and these frames have their room in the shadows.

**A frame that cannot reach its band does not belong in it.** `about-ic1-duck` is a
bright studio overhead on a pale ground; solving it to the reunion band's 80 pinned the
gamma at its 3.2 ceiling, still missed, and what it did reach was crushed and edge-lit —
corner 103 against centre 44, the vignette inverted. It aims 96 instead, and the reason
is written beside it.

**Two frames bake no vignette or a corrected cast, and both are deliberate:**
- `contact-hero` bakes **no vignette at all** — its only light source is a pendant in the
  corner and a baked vignette puts the lamp out. **And it desaturates BEFORE it warms:**
  the room's brick carries a flat green-teal cast across most of the frame, and warmth
  pushed at full saturation left the green and turned the lamps orange. Saturation comes
  most of the way out first so the field goes neutral, then the warmth is pushed hard and
  the lamps carry the colour alone.
- `lis-hero` aims 52 rather than the 44 the frame it replaced measured, because it has an
  open flame in it. Solving the whole-frame mean to 44 with a 250/255 flame in shot spends
  the entire budget on the flame and crushes the room to black — which is where the
  wordmark sits. The bake reports the wordmark band separately for exactly this reason.

**A near-white element laid OVER a photograph is a grading constraint, not a CSS one.**
The fix belongs in the bake — deepen the vignette until the card zone holds. Reaching for
a scrim in CSS puts a grey wash over a photograph the section exists to show.

**Judge a hero candidate by rendering the real heading over it at full size, not from a
contact sheet.** Thumbnails cannot answer the only question that matters — whether the
area under the type is calm enough — and they actively mislead. Two of the strongest
thumbnails in the Li's sweep turned out to be Japanese izakaya interiors, which is the
one thing this site must not carry.

**Pexels is thin on premium Chinese interiors.** Sweeps for "chinese restaurant
interior", "asian fine dining interior" and "luxury restaurant interior" returned neon
street food, red-lantern kitsch, and a great deal of Japanese. What worked: "moody dark
restaurant interior", "chef wok restaurant kitchen", "dim sum restaurant interior" and
"round dining table restaurant". Budget for that before spending an hour on literal terms.

**A cutout baked against one ground is not ground-independent.** The previous plate was
fitted to the wrong boundary and carried up to 52px of the pale surface it stood on as
opaque pixels — invisible on cream, a light crescent on a warm ground, and because the
plate turns, it orbited. Check any cutout against the ground it will actually sit on, and
measure the edge rather than trusting it.

**Pexels serves AVIF to Chrome**, whatever the `.jpeg` in the URL says, because the CDN
honours the Accept header — so a download lands as `ISO Media, AVIF Image` and has to go
through `sips -s format jpeg` before anything else will touch it. Pexels also blocks
curl, and `images.pexels.com` blocks cross-origin fetch from `pexels.com`; what works is
puppeteer navigating straight to the image URL and taking `response.buffer()`.

There is no `cwebp` and no ImageMagick on this machine, and `sips` reads webp but cannot
write it — so the webp encode goes through the Chrome puppeteer already ships. Reuse
`bake-png-to-webp.mjs`, run from the project root. The same canvas-through-puppeteer
approach is the better tool for any PNG that has to ship as JPEG: `sips -s format jpeg`
works, but a canvas re-encode at the same nominal quality runs about half the file size.

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
