# Contact — locations, FAQ, and the page's ending

**Date:** 2026-08-17
**Page:** `contact.html`
**Reference:** `assets/img/map inspo.png` (2048×1094, a crop — the section runs past the bottom of the capture)
**Status:** approved in conversation, not yet built

Adds four things to `contact.html`, in this order, after the existing `.details`
block:

```
hero → touch → details → Mombasa → Nairobi → FAQ → reserve → ending
```

The reserve and ending blocks are transplants, not new work. Everything above
them is new.

---

## 1. What the reference actually measures

Every number is a share of the frame's **width**. The comp is 2048 wide and the
site is designed at 1440; a pixel compared between the two means nothing. Shares
of width are scale-invariant, heights included — heights are quoted as a share of
width too, so one ratio governs.

Reprint with `node measure-map-ref.mjs`; magnify a boundary with
`node crop-map-ref.mjs`.

| item | measurement | note |
|---|---|---|
| ground | `#f4e8d6` | warmer and yellower than `--ground`; **not adopted** |
| content left margin | 8.85% | see the deviation below |
| photograph | 8.85% → 91.88%, width 83.03% | |
| photograph radius | 21px = **1.03%** | |
| photograph top | 21.48% below the section's ink start | |
| eyebrow | ink 8.59% wide, 13px tall, `#b4863b` | |
| heading | ink 29.79% wide, asc–desc 3.76%, cap height **2.70%**, `#24264a` | |
| body | column 41.46%, three lines, `#65656b` | |
| info card | 14.2% × 6.59%, radius ~0.68%, padding ~1.0% | |
| venue pill | 8.15% × 2.10%, fill `#262a74` | gold outlined icon, white bold label |
| dot | gold core 0.78% dia, white ring ~0.15%, faint outer ring 1.4% dia | |

### Two scans that lied

Both are the failure mode already recorded in `MEMORY.md` — a pixel scan of a
soft boundary looks right and is not. Both were settled by magnifying a crop.

- **The photograph's left edge scanned at 8.06%**, 0.79% outside the text
  margin, which reads as a deliberate optical overhang. It is the frame's drop
  shadow. The real edge is **8.85%, flush with the text.** Do not build an
  overhang.
- **The card and pill heights scanned at roughly half their real size** (card
  3.37% against a real 6.59%). The white-pixel walk runs down the element's
  centre line and stops the moment it reaches the *text inside the card*. Any
  future walk over a filled element containing type has this bug; walk an edge
  column instead, or measure the crop.

`measure-map-ref.mjs` returns `null` for the corner radius outright — its
corner walk never terminates on a soft arc. That one at least fails loudly.

### The one deliberate deviation from the reference

**The section is inset 7.18%, not the comp's 8.85%.**

7.18% is the site's own inset — `.carte`, `.ending__nav`, `.details` and
`.touch__inner` all use it, and two of those are on this page directly above
this section. A location band at 8.85% would misalign against the block
immediately above it, and a misalignment against a neighbour on the same screen
is more visible than a 1.67% difference from a comp nobody else will see.

Consequence: the photograph is **85.64%** of the viewport wide, against the
comp's 83.03%.

---

## 2. Type: hold cap height, not ink width

This is the invariant `2026-08-17-contact-hero-design.md` established, and it
binds harder here than it did there.

The reference heading is "Along Kiambu Road" — 17 characters, 29.79% ink width.
The headings here are **"Mombasa" and "Nairobi", seven characters each.** Sizing
to the reference's ink width would set a seven-letter word across 30% of the
viewport, which is not a heading, it is a banner. Cap height is the invariant
that survives a change of character count; ink width is not.

**Target: cap height 2.70% of viewport width.**

Cormorant Garamond's cap height is roughly 0.66 em against the comp serif's
~0.70, so Cormorant must be set *larger* than the comp's font-size to land on
the same cap height. Starting estimate: 2.70 ÷ 0.66 ≈ **`4.1 × --lu`**.

That arithmetic is an estimate of a ratio taken from a specification sheet, and
it is to be **solved against a pixel scan of the rendered cap, not accepted as
correct.** The scan is the deliverable; 4.1 is where the search starts. The same
approach found `about.html`'s experience section sized 2.4u short because a
predicted block height omitted half-leading no screenshot contains.

### The scale unit

```css
--lu: max(9px, 1vw);
```

**Deliberately without the `svh` clamp** that `--tu` and the reservation
column's `--u` carry. Those two exist to keep a block inside one screen, and
they earn the clamp. This section is an editorial band — heading, copy, and a
large photograph — that is *allowed* to exceed one viewport, exactly as the
reference does (the comp is a crop; its own section runs past the capture).
Clamping to `svh` here would shrink type on a short window to protect a fit that
was never required.

If a future change makes this section one-screen, the clamp comes back and every
multiple below is re-solved. Do not add the clamp without re-solving them.

---

## 3. The location sections

One component, `.locale`, two instances: `.locale--mombasa`, `.locale--nairobi`.

**Mombasa takes the reference composition exactly** — eyebrow, heading and copy
at the left, cards weighted to the right of the photograph.

**Nairobi mirrors it** — copy column at the right, cards weighted left. The
brief asked for this and it is load-bearing: two identical compositions stacked
read as one template run twice, which is the specific thing the reference's
polish is spent avoiding.

### Photograph frame

- **16:9. This is a choice, not a measurement** — the comp is a crop that ends
  inside the photograph, so its aspect is unknowable from the file. All that can
  be said is that it is wider than 2.6:1 is tall. 16:9 is picked because it
  seats two cards and a pill without crowding; if it reads too cinematic against
  the copy above it, 3:2 is the fallback and nothing else in this spec moves.
- Radius `clamp(12px, 1.03vw, 22px)` — the measured 1.03%.
- Layered warm-tinted shadow, low opacity, per the site's shadow rule. The comp
  has one and it is what lifts the frame off the peach.
- The frame is `overflow: hidden`; the image inside is oversized and translated,
  so the parallax never exposes an edge.

### Markers

Three kinds, all measured above:

1. **The venue pill** — `--misono-indigo` fill, gold outlined mark, white label
   ("Misono Mombasa" / "Misono Nairobi"). One per section. This is the
   restaurant itself and is the only marker that names it.
2. **Two info cards** — near-white, three lines: gold letterspaced eyebrow,
   Cormorant title, and a short relation line.
3. **Plain dots** — gold core, white ring, faint outer ring. Non-text, so
   `--res-gold` is in its documented role.

### Card content — no invented figures

The reference's cards read "12 min drive · 8 km". **Not one drive time or
distance for either branch is verifiable**, and this is the page whose entire
job is telling people where the restaurant is. Fabricating four numbers here is
worse than anywhere else on the site.

The card keeps its three-line structure, weight and position; only what the
third line carries changes — from a fabricated figure to a stated relation that
traces to a listing:

| section | card | eyebrow | title | relation |
|---|---|---|---|---|
| Mombasa | A | OPPOSITE | Nairobi Java House | across Links Road |
| Mombasa | B | LANDMARK | Nyali City Mall | a short walk, on Links Road |
| Nairobi | A | THE BUILDING | The Green House | Ngong Road |
| Nairobi | B | NEARBY | Adams Arcade | at the Ngong Road junction |

Everything in that table comes from a public listing. Nothing is estimated.

### Copy

> **Mombasa** — Misono came to the coast in 2006. The room sits on Links Road in
> Nyali, opposite the Java House and a short walk from Nyali City Mall — a gong
> at the door, kabuki screens on the walls, and teppanyaki tables where the
> cooking happens an arm's length away.

> **Nairobi** — The first Misono opened in 1995. Today it sits at The Green
> House on Ngong Road, by Adams Arcade: three teppanyaki tables on the lower
> floor, à la carte upstairs, and a private room where the seating is low and
> the shoes come off.

**The Nairobi copy deliberately does not say "and has been there ever since."**
Foursquare places an earlier Misono in Woodley Estate, so the 1995 founding and
the current address cannot be asserted as one continuous fact. "The first
Misono opened in 1995. Today it sits at…" is two true statements; the fluent
version joining them is an unverified third.

---

## 4. Motion

The house contract, unchanged: **one rAF loop, one number per section, every
element derives its own state from it in CSS.** No GSAP. `perspective` is a
property on a parent, never a `perspective()` function inside a transform, so
every rest state is a true `transform: none`. No `will-change` — the headings
are hairline Cormorant at 300 and promoting them makes Chrome rasterise once and
stretch, which this typeface shows immediately.

### `--rise`, written per section

0 when the section's top reaches the bottom of the window, 1 when its foot
leaves the top. 0.5 is the rest value **and the CSS default**, which is what
makes a blocked script and a reduced-motion visit land in the same place. Same
arrangement as `--drift` on `.touch`.

Driven from it:

- the photograph's parallax inside its frame;
- a small offset on each marker, at a *different* rate from the photograph —
  that difference is the whole depth effect.

### Entrance, on `.js` / `.is-in` + IntersectionObserver

An arrival, not a scroll effect: the observer disconnects, so coming back up the
page does not replay it. `threshold: 0.3`, per `.touch`.

The frame arrives from `scale(1.06) translateZ(-90px)`; the eyebrow, heading and
copy stagger behind it on the existing `--ease-pop` / `--ease-settle` curves.

### One perspective box per marker, not one shared box

`.touch` already paid for this lesson. Given one shared box, the decorative
marks were dragged 135px toward the box's centre and landed over the content —
which reads as clumsy placement, not as a bug. A plane in **its own** box scales
about its own centre and never moves.

The photograph's own entrance is the opposite case and *wants* the shared box,
exactly as `.touch__form` does.

**Verify by measuring each marker's painted rect against its content's. Do not
look at it.**

### The shimmer trade-off, stated in advance

A marker that drifts continuously never sits at rest, and its text is resampled
every frame. The cards contain type; the photographs do not.

So: **the photograph drifts continuously; the cards get a one-shot arrival plus
a small `--rise`-derived offset capped at 10px, transform only, no scale.** The
dots, being non-text, are free.

This is a judgement, not a measurement, and it must be checked: if the card type
shimmers, the card's continuous component goes to zero and the depth is carried
by the photograph and the dots alone.

### Reduced motion

**Every custom property the script writes needs a rest state declared by name**,
not merely a reset of `--rise` — the script writes it as an inline style, which
beats a media query. `about.html`'s chapters section parked four frames 648px
below their row by getting this wrong.

---

## 5. FAQ

Minimal and open — thin separators, generous negative space, no boxes, no
chevron-in-a-circle.

`<details>` / `<summary>`, animated with `grid-template-rows: 0fr → 1fr`. Real
keyboard and screen-reader behaviour for free, and **it still opens with JS
off**, which matters on a site whose capture tool runs with the observer
stubbed.

Seven questions, per the brief. Every answer traces to a public listing; where
nothing is verifiable the answer says so rather than inventing a policy.

1. **Where is Misono located?** — Two restaurants. Nairobi at The Green House on
   Ngong Road, by Adams Arcade. Mombasa on Links Road in Nyali, opposite the
   Java House.
2. **Do I need a reservation?** — Both take reservations and they are worth
   making: the teppanyaki tables and the private room are limited in number.
   Call the branch you would like to visit.
3. **What type of Japanese cuisine do you serve?** — Sushi and sashimi,
   teppanyaki cooked at the table, and ramen.
4. **Do you offer Teppanyaki?** — Yes. Nairobi has three teppanyaki tables on
   the lower floor; Mombasa cooks at the table too.
5. **Do you accommodate private dining?** — Nairobi has a private room laid out
   in the traditional way: low seating, a well beneath the table, shoes left at
   the door. Ask for it when booking — it is a single room.
6. **Can you accommodate special dietary requests?** — There are vegetarian
   selections on the menu, including on the sushi and sashimi boats. For
   allergies or anything more specific, call ahead so the kitchen can say
   plainly what it can and cannot do.
7. **What are your opening hours?** — Nairobi daily 12:00–21:30; Mombasa daily
   12:00–21:00.

**Answer 6 is the one under pressure.** Vegetarian selections are confirmed;
halal, vegan and gluten-free are **not**, for either branch. The answer must not
drift into promising them. Sending allergies to a phone call is the honest
position, not a hedge.

**Answer 5 says Nairobi and only Nairobi.** The private room is confirmed for
Nairobi. Mombasa's private dining is unverified; the answer does not mention it.

---

## 6. Opening hours: a site-wide correction

The reservation block on all pages currently reads **"Monday – Sunday, 12:00 PM
– 11:00 PM"**, supplied by the client on 2026-08-15. Public listings put both
branches at **21:30 (Nairobi) and 21:00 (Mombasa)**. Approved in conversation on
2026-08-17: use the listed hours, per branch.

The block becomes, in substance:

> Nairobi 12:00 – 21:30 · Mombasa 12:00 – 21:00, daily

Because the reservation block is copied **byte-for-byte to three other pages**,
this is not a one-file edit:

1. change `index.html`;
2. re-copy to `menu.html`, `about.html` and (newly) `contact.html`;
3. re-run the `diff` verifications in `CLAUDE.md`, re-deriving the line ranges
   first — every one of those numbers moves whenever anything above it changes.

**Still unverified and still to confirm with the client:** the hours now
contradict what the client said in conversation. The listings are more likely to
be current than a remembered phrase, but the client should be asked directly,
and the section comment must keep saying so.

---

## 7. The reserve and ending blocks

Transplanted from `index.html` byte-for-byte. **Do not edit the copies.**

This **reverses the 2026-08-17 decision** that `contact.html` would have no
reserve block and no footer. That decision is what made the page a deliberate
dead end; with the ending block present, the page is no longer one, and the
footer "Contact" link on every page now leads somewhere with a way out.

`CLAUDE.md` already records what a reversal costs, and all of it applies:

- **`:root` needs `--cream` and `--ember` added.** `--cream` is not a colour
  here — it is the hinge the peach adaptation turns. A token used but not
  defined **fails silently**; this has already happened twice on `about.html`.
- **`contact.html` needs its own peach adaptation block** at the foot of its
  `<style>`, kept in step with the two existing ones. Four things do not follow
  from re-pointing `--cream`: `--menu-body` and `--menu-accent` (below AA on
  peach at their cream values), `--res-gold` (fails 3:1), and the ending
  gradient's hardcoded tail.
- **The ending block's one intentional per-page delta** is `aria-current="page"`
  on that page's own footer link — here, Contact.
- **Diff the markup blocks, not only the CSS.** The 2026-08-17 re-copy surfaced
  a real drift nobody had caught precisely because the markup was diffed.

### `.details` stays exactly where it is

Approved in conversation. It keeps its position after `.touch` and it keeps its
closing gradient, even though it is no longer the page's foot.

**One consequence to measure rather than assume:** `.details` now ends on
`#F5E5DB` and `.locale` begins on `--ground` `#F7E8DF` — a step of 2/3/4 per
channel. That is very likely below the threshold of visibility, but "very
likely" is not a measurement. **Sample it from the render.** If it reads as a
band, report it; do not silently re-point either colour, because leaving the
block alone was the instruction.

`#F5E5DB` remains this page's binding contrast ground. `--res-gold` clears 3:1
against it by 0.17 and `--menu-accent` clears 4.5 by 0.16 — neither has room to
spend.

---

## 8. Photographs

Two needed: one for Nyali/Mombasa, one for Ngong Road/Nairobi. The brief is
explicit that they must be real and city-appropriate — the reference's own
aerial is a US suburb, and reusing that character would undo the point of the
section.

### Grading band — decided before grading, not after

`CLAUDE.md` requires the band be chosen up front. The three existing bands are
62–84 (chapters), 90–108 (experience) and 64–80 (ichie). **These two belong to
none of them and get a fourth: 108–118.**

The reason is not that they are outdoors; it is what is *lit*. Every existing
band grades a lit subject or a lit room inside a dark building. These are
open-air daylight frames of a whole district. Forced to 90 a daylight aerial
does not read as moody, it reads as overcast and drained — the opposite of the
immersive quality the section is for.

Same method as every other bake: **grade the character by eye, solve the level**
— contrast, saturation, warmth and vignette set by hand, then bisect a gamma per
frame until mean luminance lands in the band.

### Sourcing

Pexels, through `fetch-pexels.mjs` (it blocks curl, and serves AVIF to Chrome
whatever the URL says, so `sips -s format jpeg` comes first). Budget for the
sweep being thin on the literal terms — the same problem the contact hero hit.

**Judge a candidate by rendering it at full size in the frame with the markers
over it, not from a contact sheet.** The contact hero's sweep produced a
strongest-looking thumbnail that was a 240/255 lantern sitting exactly where the
heading goes. The equivalent failure here is a frame whose busiest quarter is
where a card lands.

The composition depends on **one property** of whichever frame is chosen: legible
structure — roads, coastline, rooflines — with at least two calm areas large
enough to seat a card. Nothing else about the file is load-bearing.

**Both will be placeholders and must be flagged as such in the markup**, exactly
as `contact-hero.jpg` is. A stock aerial of a city is not a photograph of
Misono's surroundings, and a location section implies it is.

---

## 9. Tooling

`screenshot.mjs` cannot capture any of this: full-page capture uses
`captureBeyondViewport`, which never moves the layout viewport, so the
`IntersectionObserver` never fires and both sections shoot armed — that is,
blank. The FAQ additionally has state.

- **`node shoot-locale.mjs [width] [height] [p,p,...]`** — scrolls each location
  section to a position through its travel, prints `--rise`, each marker's
  painted rect against its content rect, and the photograph's painted mean
  luminance. Scroll via `getBoundingClientRect` with `behavior: 'instant'`,
  **never `offsetTop`** — `.locale` is `position: relative`, so the trap that
  cost an hour on the reserve tooling applies here unchanged.
- **`node verify-locale.mjs`** — what is not a single moment: cap height scanned
  from the render against the 2.70% target, fit across seven viewports, the
  `#F5E5DB` → `#F7E8DF` seam, reduced motion, FAQ open/closed geometry, and
  every `var()` in the file checked against `:root`.

`shoot-flavors.mjs`'s two encoded lessons carry over and must be re-encoded
here: **do not replay an entrance by removing `is-in` and re-adding it** (that
starts a full set of reverse transitions and each pass seeks a growing pile of
half-finished ones — print the count and it is obvious, look only at the PNGs
and it is not), and **scope any `getAnimations()` sweep to the section**, because
the reservation block's `reserve-drift` runs forever and `finish()` throws on an
infinite animation.

---

## 10. Verification

- [ ] Cap height scanned from the render lands on 2.70% of viewport width, both
      headings, at 1440×900, 1280×800 and 390×844.
- [ ] Every marker's rest state is a true `transform: none`; painted rect equals
      content rect.
- [ ] Card type does not shimmer under continuous drift — or the continuous
      component is zeroed and this is recorded.
- [ ] Reduced motion: every script-written property has a rest state by name.
- [ ] Section renders complete with JS disabled entirely.
- [ ] FAQ opens and closes by keyboard; opens with JS off.
- [ ] Photograph means land in 108–118.
- [ ] `#F5E5DB` → `#F7E8DF` seam sampled from the render and reported.
- [ ] Every `var()` in `contact.html` checked against its `:root` — by
      enumeration, not by reasoning about which tokens "must" be there.
- [ ] Both reserve/ending `diff`s pass on all three copy pages, CSS **and**
      markup, with the line ranges re-derived first.
- [ ] Contrast re-derived on `#F5E5DB`, not carried.

---

## 11. Still unverified, carried forward

Everything already flagged in `CLAUDE.md` for this page, plus:

- **The opening hours now contradict the client**, deliberately and with
  approval. Confirm directly.
- **Mombasa is Nyali, not Shanzu.** The brief said Shanzu; every listing found
  says Links Road, Nyali — a different suburb roughly 6 km south. Approved to
  use Nyali. Confirm.
- **Both branch phone numbers**: `+254 722 511229` (Nairobi) and
  `+254 722 530204` (Mombasa), alongside the invented `wa.me` number.
- **The founding dates**, 1995 Nairobi and 2006 Mombasa, and whether the Nairobi
  restaurant has occupied The Green House throughout.
- **Both location photographs**, which are stock and are not Misono's actual
  surroundings.
