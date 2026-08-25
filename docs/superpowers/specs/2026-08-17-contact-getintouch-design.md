# Contact page — Get in Touch, and the contact details

**Date:** 2026-08-17
**File:** `contact.html`
**Tooling:** `shoot-touch.mjs` (new), `shoot-contact.mjs` (existing, hero)
**Status:** built and verified. Supersedes the "hero only" scope of
`2026-08-17-contact-hero-design.md`; that spec's hero section is unchanged and
still authoritative for everything above the fold.

**Four things changed between this spec and the build, all under measurement.**
They are corrected in place below; this list is so nobody reads the diff as
drift:

1. **`.details` is stacked on one axis, not side by side.** Two column
   arrangements were built and each failed in a way the other fixed. See that
   section.
2. **The decorative marks get one `perspective` box EACH**, not one shared box.
   Shared, both were dragged 135px toward its centre and landed on the copy.
3. **`.touch__inner` is capped at 66tu and centred**, not run out to the 7.18%
   inset. At the inset the two columns sat 370px apart with nothing between
   them.
4. **`--hairline` was never added**; the divider takes `--res-hair`, which was
   already defined. The seven-token list is otherwise exactly as specified.

---

## What this is

Two sections added directly below `contact.html`'s hero, on the site's peach:

1. **`.touch` — GET IN TOUCH.** An editorial two-column composition: a masthead
   on the left, and a four-field enquiry form on the right whose fields are
   hairlines rather than boxes. Arrives out of depth on scroll.
2. **`.details` — the contact details.** PHONE and EMAIL, set as typography
   rather than as a data block. This is the page's ending.

The page was one viewport and a deliberate dead end. It now scrolls, and it is
still a dead end — see "The page still has no footer" below.

---

## Scope, and what was decided rather than assumed

Two questions were put to the client and answered before anything was designed.

**The form does not submit.** There is no backend on this site — every page is a
static HTML file — and the client chose *design only* over `mailto:`, WhatsApp
and a third-party form endpoint. The control is built, the fields validate in
the browser, and the button goes nowhere. **It is flagged as a placeholder in
the markup**, in the same terms `contact-hero.jpg` is flagged, so that whoever
deploys the site cannot mistake it for wired.

**There is no footer.** The client chose to let the contact details be the
page's ending rather than transplant the ending block. The consequence is
recorded below and is a decision, not an oversight.

Not built, because they were not asked for and the brief says not to crowd the
page: street address, opening hours, social links, a map, a second CTA.

---

## The ground

The peach, `--ground #F7E8DF`, for both sections. CLAUDE.md is unambiguous:
**a photograph is the only reason to leave the peach**, and neither of these
sections has one.

`body` stays on `--ink`. That is not carelessness — it is the hero's failure
mode, deliberately kept, so a frame that fails to load leaves white type on
black rather than white type on peach. The two new sections carry their own
`background`, which is what makes that safe.

### Tokens `:root` must gain

`contact.html`'s `:root` carries five tokens today and was written with an
explicit note that it is not sufficient for anything transplanted. It needs:

| token | value | role here |
|---|---|---|
| `--ground` | `#F7E8DF` | both sections' background |
| `--menu-ink` | `#2F1B19` | display type, the value a guest types, the contact values |
| `--menu-body` | `#63504A` | the masthead sentence |
| `--menu-accent` | `#99551C` | field labels, the eyebrow, the detail labels |
| `--misono-indigo` | `#3A5280` | focus rings |
| `--ease-settle` | `cubic-bezier(0.18, 0.84, 0.26, 1.12)` | the fields' and eyebrow's overshoot |
| `--ease-pop` | `cubic-bezier(0.15, 0.90, 0.22, 1.20)` | the two display lines' overshoot |

`--res-gold` and `--res-hair` are already present and keep their meanings.
`--ease-quiet` and `--ease-reveal` are present too, and are what the opacity
half of every transition and the rule's draw are written against.

**This list is the highest-risk part of the change.** A token that is used but
not defined fails *silently* — no error, no warning — and it has already
happened twice on `about.html`, once turning SVG dots black and once making
every `var(--menu-accent)` an invalid declaration. The list above is to be
checked against the built file, not assumed.

**The two eases are the live instance of that risk in this change, and the
first draft of this spec got it wrong.** `--ease-settle` and `--ease-pop` are
the entrance's whole character, and they are defined in **`menu.html`'s**
`:root`, not `contact.html`'s. Specified without being copied across, every
eased transform in the section would silently fall back to `ease` — no error,
and an entrance that still moves, just without the overshoot that is the entire
reason those two curves were solved. Their values are carried verbatim, not
re-derived: the peak of a `cubic-bezier` sits near t=0.8 and well below `y2`
(y2=1.12 peaks at 1.026; y2=1.20 at 1.055), so they are solved against travel
and re-guessing them by eye would undo that.

`--hairline` is deliberately **not** added. The details divider takes
`--res-hair` in a fading gradient, which is what `.reserve__metaitem` already
does — reusing a defined token beats introducing a seventh one for a single
rule.

### Contrast, re-derived on this ground rather than carried

Computed from sRGB relative luminance; the method reproduces CLAUDE.md's
published table exactly, which is what validates it.

| ink | on `#F7E8DF` | on `#F5E5DB` (the details' foot) | needs |
|---|---|---|---|
| `--menu-ink` | 13.60:1 | 13.25:1 | 4.5 |
| `--menu-body` | 6.32:1 | 6.16:1 | 4.5 |
| `--menu-accent` | 4.78:1 | 4.66:1 | 4.5 |
| `--res-gold` | 3.26:1 | 3.17:1 | 3.0 (non-text) |
| `--res-hair` | 1.74:1 | — | decorative only |

**The binding ground is the details section's settled foot, not the peach**,
because that section closes on a gradient (see below). `--res-gold` clears 3:1
there by 0.17 rather than by 0.26, and `--menu-accent` clears 4.5 by 0.16. Both
hold. Neither has room to spend, so if the gradient's tail is ever deepened,
both must be re-derived rather than assumed to have survived.

`--res-hair` is **not** used for anything a guest reads or operates. It appears
only as the details divider and as decorative rules, which is the role the token
is scoped to.

---

## `.touch` — the composition

Two columns above 1000px, stacked below it — the same breakpoint the reservation
section uses, for the same reason.

```
  ┌─ 7.18% ─┬──────────── masthead ────────────┬── gap ──┬───── form ─────┬─ 7.18% ─┐
            │  ENQUIRIES ──────                │         │  NAME          │
            │                                  │         │  ──────────────│
            │  GET IN                          │         │                │
            │  TOUCH                           │         │  EMAIL         │
            │                                  │         │  ──────────────│
            │  ───                             │         │                │
            │                                  │         │  PHONE         │
            │  A table, a private dinner, or   │         │  ──────────────│
            │  a question about the evening.   │         │                │
            │  Tell us what you have in mind.  │         │  MESSAGE       │
            │                                  │         │  ──────────────│
            │                                  │         │                │
            │                                  │         │ ┌────────────┐ │
            │                                  │         │ │ SEND MESSAGE → │
            │                                  │         │ └────────────┘ │
```

### The scale unit

`--tu: max(8.6px, min(1vw, 1.62svh))`, which is the reservation column's `--u`
in every respect. Every length in the block is a multiple of it, so the block
scales as **one piece**.

This is the site's most-repeated lesson and the one it has paid for twice: a
viewport share alone is not enough, because a reference capture is 1.90:1 and a
laptop is not. **Never claw pixels back by compressing individual gaps** — that
keeps the type big and throws away the rhythm.

Budget, at 1440x900 where `--tu` resolves to 14.4px:

| | tu | px |
|---|---|---|
| masthead column, ink | ~21 | ~302 |
| form column, ink | ~40 | ~576 |
| section | 100svh | 900 |
| air, top and bottom | ~18% each | ~162 |

The **form column sets the section's height**, not the masthead — it is the
taller of the two, which is why the masthead is free to be as spare as it is.

An earlier budget put the form at 33tu and left 47% of the viewport empty. That
is `about.html`'s figures problem exactly: a section with too little ink in too
much room reads *unfinished* rather than *generous*. The gaps between fields and
the height of the message field were grown until the block stands at ~40tu —
the fix is to give the block more ink, never to shrink the viewport around it.

Below ~640px of viewport height the 8.6px floor takes over and the section runs
past one screen rather than shrinking the labels out of legibility.

### The fields are hairlines, not boxes

No border, no fill, no rounded rectangle, no box-shadow. Each control is a bare
transparent `input` (or `textarea`) sitting on a single rule, with a real
`<label>` above it in small letterspaced Jost caps.

This is not an invention. `.topbar__link::after`, `.ending__link::after` and
`.hero__rule` are all the same gesture — a hairline that wipes out from a 50%
origin — and this is the first place on the site where that idiom becomes a
*control* rather than an ornament. That continuity is the reason the section
reads as belonging to this site rather than as a form dropped onto it.

| part | treatment |
|---|---|
| label | Jost 400, ~0.78tu, `letter-spacing: 0.2em`, uppercase, `--menu-accent` |
| typed value | Jost 300, ~1.05tu, `--menu-ink` |
| resting rule | 1px `--res-gold`, full width |
| focus rule | a second 1px rule in `--menu-ink`, `scaleX(0) → scaleX(1)` from a 50% origin |
| focus ring | `--misono-indigo`, on `:focus-visible` only |

**Labels, not placeholders.** Placeholder text has to clear 4.5:1 like any other
text, and it disappears the moment a guest starts typing — so the one thing
telling them what the field is for is gone exactly when they might check.

**The resting rule takes `--res-gold`, not `--res-hair`.** A text input's
underline is the only thing identifying where the control is, which makes it a
UI component boundary under WCAG 1.4.11 and puts a 3:1 floor on it.
`--res-hair` measures 1.74:1 and is documented decorative-only; `--res-gold`
clears at 3.26:1. This is the same class of mistake as the two silent token
failures — it looks right and fails a requirement nobody can see.

### The button

`SEND MESSAGE →`, reusing `.reserve__cta`'s mechanism exactly: a square
outline in `--res-gold`, `--menu-ink` filling from the left edge on
`scaleX(0) → scaleX(1)`, the label going to the ground colour, and the same
arrow path translating 22%. All four transitions at **520ms**, matched to the
fill — `.menu__cta`'s 420ms causes a visible dip, where the lettering reaches
the ground colour while the ink is still short of the right edge.

Written fresh for this page rather than copied, because there is no reserve
block here to copy from. The convergence is deliberate and is to be recorded in
a comment, so nobody later "unifies" two controls that are already the same
control on purpose.

`:hover`, `:focus-visible` and `:active` are all specified. No exceptions —
that is a hard rule in CLAUDE.md.

---

## The 3D

On the house contract established by `menu.html`'s entrance on 2026-08-17,
including all four of that section's load-bearing findings. Read
`2026-08-17-menu-flavors-entrance-design.md` before retiming any of this.

### Depth is a property, declared three times

```css
.touch__masthead { perspective: 1100px; }
.touch__title    { perspective: 1100px; }   /* the two lines are grandchildren */
.touch__form     { perspective: 1200px; }
```

**`perspective` as a property on the parent, never `perspective()` inside a
transform.** That is what lets every rest state be a true `transform: none`,
which is what stops Chrome rasterising a hairline Cormorant at 300 once and
stretching it. **No `will-change` anywhere in this section**, for the same
reason.

**It is declared on `.touch__title` as well as `.touch__masthead` because
`perspective` reaches direct children only.** The heading's two lines sit at
`.touch__masthead > h2 > span` — two levels down — so the property on the
masthead alone would reach the eyebrow and stop. That failure does not error,
does not warn, and does not look broken; it looks like a heading that fades
while the fields move in depth, i.e. like a decision. This is the exact bug
`menu.html` shipped and had to be measured out of. **A line reporting apparent
scale 1.000 at t=0 is this bug**, not a subtle animation.

### The two gestures

The masthead comes *forward* past the page and drops back; the fields come from
*behind* and rise. Two different moves, so ten elements do not read as one house
effect applied ten times.

`s = p / (p − z)` — the apparent scale each element arrives at:

| element | ease | z | delay | move | arrives |
|---|---|---|---|---|---|
| eyebrow | `--ease-settle` | −80 | 0 | 1200 | 0.932 — 6.8% small |
| `GET IN` | `--ease-pop` | −210 | 190 | 1500 | 0.840 — 16.0% small |
| `TOUCH` | `--ease-pop` | −240 | 330 | 1500 | 0.821 — 17.9% small |
| rule | `--ease-reveal` | — | 470 | 900 | `scaleX(0 → 1)` |
| sentence | `--ease-settle` | −60 | 560 | 1200 | 0.948 — 5.2% small |
| field 1 — Name | `--ease-settle` | −150 | 660 | 1100 | 0.889 — 11.1% small |
| field 2 — Email | `--ease-settle` | −170 | 750 | 1100 | 0.876 — 12.4% small |
| field 3 — Phone | `--ease-settle` | −190 | 840 | 1100 | 0.863 — 13.7% small |
| field 4 — Message | `--ease-settle` | −210 | 930 | 1100 | 0.851 — 14.9% small |
| Send | `--ease-settle` | −120 | 1060 | 1000 | 0.909 — 9.1% small |

Whole entrance: **2060ms**, matching `menu.html`'s ~2.08s. The eyebrow and the
two display lines carry `menu.html`'s own depths unchanged — they are the same
elements doing the same job, and re-deriving them would have made them differ
for no reason.

The fields get **progressively deeper down the stack** so they do not arrive as
one plane sliding forward, and they are 90ms apart — which is what makes "one
after another" legible as a sequence rather than a clump.

`--in-fade` is deliberately shorter than `--in-move` on every element: the move
is the thing worth watching, so each element is fully opaque well before it
stops moving. Fading and travelling over the same span reads as a cross-dissolve
and throws the depth away.

### The stack opens as it lands, for free

`.touch__form`'s `perspective-origin` is its own centre. A field pushed back in
Z is therefore projected *toward* that centre, and its travel back out to its
own row comes free from the projection coming undone.

This is `menu.html`'s finding restated: **nothing writes a per-field
`translateX`.** The row positions are decided by the layout and by nothing else.
It also means the effect scales itself down on a narrow viewport with no media
query, because the drift is proportional to distance from the origin.

### Parallax on the decorative planes

One rAF loop writes **one number** — `--drift`, 0 to 1 across the section — on
`.touch`, and two decorative planes derive their transforms from it in CSS at
opposite rates. That is `about.html`'s ichie device and the site's
one-number-per-section contract. There is no GSAP on this site and this is not
the thing to add one for. The loop lives beside the hero's `track()` in one rAF,
as `about.html` does with `pin()`.

**Each mark gets its own `perspective` box.** This was specified as one shared
box — ichie's arrangement — and measured wrong: one box has one
`perspective-origin`, its own centre, so a mark in the right margin is projected
*toward* the middle. At 1440x900 the drag was **135px**, which put the kanji
62px over the form and the mon 61px under the masthead. Neither read as a bug;
both read as clumsy placement.

Given its own box, a plane's origin is its own centre, so `translateZ` scales it
about that centre and never moves it — `about.html`'s statement section exactly.
Measured after the change: kanji clear of the form by 87px, mon clear of the
masthead by 14px.

**Note this is the opposite choice from the entrance**, where the shared origin
*is* the effect. Same property, two jobs on one page: one wants the lateral drag
and one must not have it.

The two planes:

1. **`お問い合わせ`** *(otoiawase, "enquiry")*, set vertically with
   `writing-mode: vertical-rl` at whisper alpha, `lang="ja"`,
   `aria-hidden="true"`.
2. **The mon**, `brand_assets/misono-mark-mono.svg`, large, offset and nearly
   invisible. It is drawn to take its colour from CSS, which is what makes this
   possible.

**Stated risk: no Japanese webfont is loaded on this site.** Those glyphs render
in whatever CJK face the visitor's OS supplies — Hiragino on Apple, Yu Gothic on
Windows, Noto on Android, and tofu on a Linux box with no CJK fonts installed.
`about.html`'s ichie section already ships 一期一会 under exactly this exposure,
so this is an existing risk rather than a new one, and at whisper alpha a tofu
fallback is close to invisible. A `font-family` stack naming the common system
faces is specified; a webfont is not, because loading a CJK face for four
decorative glyphs is not a trade worth making.

**The mon is a reconstruction.** `brand_assets/README.md` and CLAUDE.md both
record that both mark files were traced from a photograph of printed material
and must be verified against real artwork before shipping. At this alpha the
risk is small, but it is not zero and it is noted here rather than discovered.

### Reduced motion

**Every property the armed state touches is put back BY NAME**, not by leaning
on a blanket duration rule and not by resetting `--drift`. Two halves, both
required:

- the loop refuses to start, so no inline `--drift` is ever written;
- the CSS resets `opacity`, `transform` and `transition` by name.

The second half is the load-bearing one. The script writes `--drift` as an
*inline style*, and an inline custom property beats a media query — the
experience section on `about.html` records the same finding, and the since-
removed `--enter` there parked four frames 648px below their row precisely
because it had no rest state of its own.

---

## `.details` — the contact details

The page's ending, so it has to close rather than merely stop.

**Two items stacked on one axis at every width**, split by a short fading
hairline — `.reserve__meta`'s divider, turned and made symmetrical.

Side by side was specified, built, and abandoned after two attempts, because
the email is 26 characters and the phone 15 and no column arrangement hides
that:

- **Cells sized to content.** The pair centres as a group, but the divider then
  lands **100px left of the page's axis** while the rule above it sits dead on
  it. Two marks that both read as "the middle", disagreeing by 100px.
- **Equal cells.** Puts the divider back on the axis (measured: `div-off -0.0`
  at every desktop width) and moves the problem inside it — **159px of gap on
  one flank and 45px on the other**.

Stacked, the disparity stops being a defect and becomes what it is: a short
line and a long one, centred. Measured `axis-off 0.0` at all seven viewports.
It also fills the block's height, which was the section's other problem.

| | |
|---|---|
| label | `PHONE` / `EMAIL` — Jost caps, 0.2em, `--menu-accent` |
| value | **Cormorant Garamond 300**, 2.7tu, `--menu-ink` |
| link | `tel:+254722511229` / `mailto:restaurantmisono@gmail.com` |
| states | the site's centre-out underline wipe on hover and focus; indigo focus ring |

**The value is set in the display face, not in body type.** That is the whole
difference between "a contact information block" and contact details that are
part of the design — the number and the address become typography.

`min-height: 48svh`, not 100 and not the 56 first specified. This is
`about.html`'s figures lesson, and it bound harder than predicted: at 56svh with
the values at 2.35tu the block stood **130px of ink inside 504px**. Both halves
of the fix were applied and the type did most of the work — the first fix for an
underfilled section is more ink, not a shorter section. The email binds the
size: 26 characters, `nowrap`, so it overflows silently rather than wrapping.
Measured clearance against the content box runs 776px at 1440 down to **61px at
390**, which is the tightest case and still clear.

It closes on the ending block's own settle:

```css
background: linear-gradient(180deg, var(--ground) 0%, #F5E5DB 100%);
```

That is not a new value. It is the exact gradient the peach adaptation block on
`menu.html` and `about.html` derived, described there as "far too small to read
as a band, just enough that the page settles". **It is what gives this page a
foot without giving it a footer** — which is the whole reason the ending block
could be declined without the page just stopping dead.

### The two facts

```
PHONE   +254 722 511229
EMAIL   restaurantmisono@gmail.com
```

Supplied by the client, sourced from public listings, and **unverified** — the
phone from the Nairobi listing, the email from the Mombasa one. They go in the
markup with a comment flagging them, in the same terms the opening hours and the
two cities are flagged in the reservation block.

**One consequence to confirm before launch:** the reservation block on the other
three pages claims "Nairobi & Mombasa, Kenya". This page presents **one number
and one address as covering both cities**, which is a claim the site has not
made before. It may well be correct. It has not been checked.

---

## The page still has no footer

The client declined the ending block. Two consequences, both intended:

- **The page remains a dead end.** The topbar is still the only way out, and it
  scrolls off the top. A guest who reaches the contact details has to scroll
  back up to leave.
- **`contact.html` is the only page on the site without the closing wordmark and
  footer nav.** The other three carry it byte-for-byte from `index.html`.

If this is ever reversed, the ending block needs `--cream` added to `:root` as
well — it is the hinge the peach adaptation turns, not a colour — plus its own
adaptation block, and CLAUDE.md's verification `diff` for this page would cover
the ending range only, never the reserve one.

---

## The hero's parallax stops being dormant

`contact.html` was one viewport tall, so the document never scrolled, `--par`
never left 0, and CLAUDE.md carries an explicit instruction not to "fix" a
reading of `--par 0.0000` on the shipped page.

**Adding these sections makes the page scroll, so that loop goes live for the
first time.** It is built correctly and `shoot-contact.mjs`'s self-test proves
0 → 108px at 1440x900 with a temporary spacer — but it has never been seen
running on the real page. It is to be verified as part of this work, and the
CLAUDE.md note updated rather than left to go stale.

The hero's own entrance is unaffected: those are plain load animations, not
observer-driven, which is why `screenshot.mjs` captures the hero finished.

---

## Verification

### `shoot-touch.mjs`, new

`.touch`'s entrance is observer-driven and below the fold, so `screenshot.mjs`
captures it **armed — that is, blank.** Full-page capture uses
`captureBeyondViewport`, which never moves the layout viewport, so the
`IntersectionObserver` does not fire. This is the same failure `about.html`'s
statement section and `menu.html`'s opening both have.

`node shoot-touch.mjs [width] [height] [ms,ms,ms...]`, modelled on
`shoot-flavors.mjs`: reload per timestamp with `IntersectionObserver` stubbed so
the section stays armed, add `is-in` by hand, pause every transition and seek to
the requested millisecond. Prints **opacity, apparent scale and offset from rest
per element**.

Two things it must encode, both learned the expensive way on `shoot-flavors.mjs`:

- **Do not replay by removing `is-in` and re-adding it.** Removing it starts a
  full set of reverse transitions; a paused animation never finishes and so is
  never dropped; each pass then seeks a growing pile of half-finished
  transitions. Printing the count makes it obvious — 15, 15, 14, 12, 9 across
  five passes of one section. Looking only at the PNGs does not.
- **Scope any `getAnimations()` sweep to the section.** This page happens to have
  no infinite animation for `finish()` to throw on, unlike `drift` and
  `reserve-drift` elsewhere — but the sweep is scoped anyway, because the reason
  it is safe here is an accident of this page and not a property of the tool.

### What must be measured, not asserted

All of the following were run. Full tables are at the foot of `contact.html`'s
`<style>`; the summary is:

| | result |
|---|---|
| every rest state | `transform: none` — all ten report scale 1.000, offset 0.0, 0.0 at t=2400 |
| apparent scale at t=0 | every element lands on its own `p/(p−z)`: 0.932, 0.842, 0.823, 0.948, 0.889, 0.876, 0.863, 0.851, 0.909. No 1.000, so the perspective is on the right parents |
| the overshoot | the two display lines peak at scale 1.012 around t=1100 and come back — the only thing on the page that passes its mark |
| the form block | FITS and one screen at all of 1440x900, 1280x800, 1512x820, 2560x1440, 1000x700, 820x1180, 390x844. No horizontal scroll at any |
| field rule contrast | 3.26:1 on the peach, and all four rules paint an identical `rgb(172, 118, 52)` |
| label contrast | 4.78:1 on the peach, 4.66:1 against the gradient foot |
| the email | clears its content box everywhere, tightest at 390 with 61px |
| decorative clearance | kanji +87px, mon +14px at 1440. Negative below 1000px on purpose — the marks lose their margins when the columns stack and move behind the composition at a lower alpha |
| reduced motion | nothing transformed or faded, no inline `--drift` or `--par`, `.hero__media` reports `transform: none`, `getAnimations()` empty |
| the hero's `--par` | runs 0 → 1 linearly on real scrolling; media translates 0 → 108px, exactly `--par-travel`'s 12svh; covers `.hero`'s rect at every position |

**One false positive worth recording.** The parallax check first tested the
media against the *viewport* and reported a gap at every scroll position past
the first. That is not a gap — it is `.touch` coming into view, i.e. the page
working. The media only ever has to cover **`.hero`'s own rect**. It read
exactly like a real bug and cost a round of chasing.

Clipping is tested by the **copy column's rect against the section's**, never by
`scrollHeight > clientHeight` — the reserve tooling records why that test lies.

Screenshots come from `localhost`, never `file:///`, and
`temporary screenshots/` is emptied at the end.

---

## CLAUDE.md changes this requires

1. `contact.html`'s entry: no longer "hero only".
2. The "**the parallax is correct and dormant**" note: it is now live.
3. The `:root` note: the token list has grown; the reserve/ending caveat stands.
4. The "dead end by design" note: still true, but the page now scrolls.
5. Pending content: the phone and email, and the one-number-two-cities claim.
6. Screenshot workflow: `shoot-touch.mjs` and what it is for.
7. Placeholder content: the form does not submit.
