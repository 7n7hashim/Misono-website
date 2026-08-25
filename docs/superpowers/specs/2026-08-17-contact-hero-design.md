# Contact page — opening hero

**Date:** 2026-08-17
**File:** `contact.html`
**Tooling:** `bake-contact-hero.py`, `shoot-contact.mjs`
**Status:** built and verified. Hero only — the page is one viewport and stops.

---

## What this is

The opening hero of a new Contact page: a full-viewport photograph with a
centred eyebrow, a gold hairline and a display heading, arriving on load and
parallaxing on scroll. It continues `about.html`'s opening layer-for-layer
rather than inventing a treatment.

Scope was set explicitly to **hero only**. The reserve and ending blocks were
*not* transplanted, so there is no footer, no navigation out of the page's
bottom, and nothing below the fold.

Copy is fixed by the brief:

- eyebrow — `CONTACT US`
- heading — `WE’RE AT YOUR SERVICE` (curly apostrophe, U+2019)

---

## The photograph

`assets/img/contact-hero.jpg`, from Pexels 19300593 by Feyza Yıldırım, baked
by `bake-contact-hero.py` to 2000x1333 at a mean of 60/255.

**It is a placeholder and is flagged as one in the markup.** Two reasons, both
recorded here so they are not rediscovered:

1. **No model release.** Pexels' licence permits commercial use but supplies
   no release, and an identifiable person on a restaurant's contact page reads
   as that restaurant's staff — a claim the photograph cannot support.
2. **It is not distinctly Japanese.** A rattan pendant, a painted mural and a
   dark-uniformed waiter. It reads Pan-Asian. It was chosen over frames that
   *were* unambiguously Japanese because those failed the composition test
   below, and a hero that cannot carry its heading is not a hero.

The composition depends on exactly one property of whatever replaces it: **a
lit subject that is OFF centre, leaving the middle of the frame calm.** Nothing
else about the file is load-bearing.

### Why the obvious alternatives were rejected

Six candidates were rendered at full hero size with the real heading over them
rather than judged as thumbnails, which is the only test that answers "is there
enough calm in the centre".

| Frame | Verdict |
|---|---|
| 9604677 — washi lantern, timber, shoji | Unambiguously Japanese and genuinely beautiful, but the lantern is a ~240/255 near-white object sitting exactly where the heading goes. Lifting the crop to 22% did not clear it — the lantern is too large — and the only remedy is a scrim heavy enough to destroy the photograph. |
| 39039988 — lit restaurant entrance at night | Thematically apt for a contact page, but cold teal against a warm site, and it carries another business's 「とうふ」 signage. |
| 30682751 — teppanyaki flame | On-brand and cinematic, but the flame is dead centre and the site already speaks in food macros. |
| 8793009 — chef with a cloche | Editorial, but a bright white chef's jacket sits directly behind the eyebrow. |
| 34357746 — lantern row | Asahi branding across the frame. |

Earlier sweeps for "omakase sushi counter", "sushi counter chef", "teppanyaki
restaurant" and "elegant restaurant interior wood counter" returned food
macros or daylight-flat rooms almost exclusively. **Pexels is thin on dark,
cinematic Japanese counters with calm centres** — worth knowing before
spending another hour there.

### The grade, and why it is so light

The decisive measurement, taken on the delivered files:

|  | whole | top-left 10% | centre 10% |
|---|---|---|---|
| `about-craft.jpg` (about.html's opening) | 71.1 | 26.7 | **117.5** |
| `contact-hero` source | 49.5 | **116.3** | 41.2 |

**This frame is the inverse of the one it continues.** about.html's is a lit
core in a dark room; this is a lit *corner* — the pendant — and a dark core.
So that file's numbers do not carry across, and the correction had to be spent
in two places rather than one:

- **the bake** lifts to a mean of 60 (solved gamma 0.82). Not further: the
  frame is 47% shadow by design and lifting is what spends that. Measured
  share of pixels below 40/255 — 59.8% ungraded, 47.1% at aim 60, 39.8% at 66,
  29.3% at 72, 20.6% at 78. By 72 half the original shadow is gone and the
  mural has come up into a flat brown haze.
- **the bed** comes down from about.html's 0.60/0.42 to 0.24/0.14. That file
  needs a heavy bed to subdue a hinoki counter at 117; dropped on a centre of
  41 it crushes the mural to featureless black.

Pushed all the way in the bake the frame goes hazy; all the way in the CSS it
goes black. Splitting it is the point.

**No vignette is baked in**, unlike every other bake on this site. This frame's
only light source sits in a corner, and a baked vignette puts out the lamp.

---

## Type

Cormorant Garamond 300 at `clamp(1.6rem, 2.83vw, 3.6rem)`, `0.20em` tracking,
indent-corrected, uppercase, with the site's three-layer text-shadow. Jost 300
at `0.34em` for the eyebrow.

**Cap height is the invariant across the site's two photographic openings, not
ink width**, and this is the one finding most likely to be re-litigated.

The tempting reasoning runs: about.html's reference set 21 characters; that
page's own heading is 26 and so had to abandon the reference's 49.5% ink width
and hold cap height instead; this heading is 21 again, so both numbers should
finally hold together. **They do not.** Measured, this line lands at 43.3% of
viewport width. Character count does not decide ink width — glyph widths do.

Chasing 49.5% would mean setting this page's type *larger* than about.html's —
a cap of roughly 2.05% against its 1.875% — so that a shorter sentence could
occupy a longer line. That is the inconsistency, not the cure. Two openings on
one site should share a type size and differ in length, which is what they now
do: cap 1.875% here against that file's measured 1.875%.

### Centring

The type block is centred with flex `align-items` / `justify-content`, **not
`top: 50%` with a translate**, following the reservation section's recorded
reasoning: a transform moves the paint but not the layout box, and the layout
box is what proves nothing is being clipped.

A second benefit falls out of it. about.html needed a separate `rise-centred`
keyframe purely because its heading was centred by transform and could not
share the plain `rise`. Here all three children share one keyframe.

### The accent

A 1px rule in `--res-gold` between eyebrow and heading, and the eyebrow itself
in `--res-hair`.

Both are existing tokens used in defensible roles rather than invented golds.
`--res-gold`'s documented role is precisely "non-text boundary". `--res-hair`
is documented decorative-only, so **setting type in it is a new role**, which
is why its contrast is measured per viewport rather than assumed.

---

## Motion

Four beats. Three of them are on **separate elements**, because two transforms
on one element is one transform.

| Beat | Element | Timing |
|---|---|---|
| Reveal — a black plate lifting | `.hero__lift` | 1200ms, opacity only |
| Push-in — scale 1.075 → 1.04 | `.hero__img` | 2200ms `--ease-push` |
| Type — opacity + `translateY(12px)` | eyebrow / heading | 820ms, 560 / 760ms delay |
| Rule — `scaleX(0)` → `scaleX(1)` | `.hero__rule` | 900ms, 680ms delay |
| Parallax — `translate3d` from `--par` | `.hero__media` | scroll-driven |

### The rule is the signature

The one flourish. It is the site's own link underline — a hairline wiping out
from a 50% origin, exactly `.topbar__link::after` — taken off a 10px link and
made the hinge of the composition. It is the only element with a gesture of
its own, which is what stops it reading as an ornament.

### `--ease-push` is new, and had to be

Both of the site's existing eases are **UI** eases: front-loaded, because a
control should answer immediately. A camera move is the one thing on this site
that must not be. Share of the scale travel completed against share of
duration:

| | 0.10 | 0.20 | 0.35 | 0.50 | 0.75 |
|---|---|---|---|---|---|
| `--ease-reveal` | 0.494 | 0.752 | 0.914 | 0.972 | 0.998 |
| `--ease-quiet` | 0.271 | 0.501 | 0.738 | 0.873 | 0.976 |
| linear | 0.100 | 0.200 | 0.350 | 0.500 | 0.750 |
| **`--ease-push`** | **0.037** | **0.145** | **0.475** | **0.757** | **0.956** |

The first build used `--ease-reveal` and the push was three-quarters over in
the first fifth of its duration, then crawled — a snap followed by nothing.
**A timeline capture caught it; looking at the finished page never would**,
because the rest state is identical either way. `linear` was the honest
alternative and was rejected only because it stops dead.

### Parallax

One rAF loop writing **one** number — `--par`, 0 at the top of the section and
1 when it has fully left — with `.hero__media` deriving its transform from it
in CSS. The same one-number-per-section contract as the statement, chapters
and experience sections.

`.hero__media` is hung `--par-travel` above its section and grown by the same
amount, so neither end of the travel can open a gap — which is what a parallax
built by translating a flush box always does.

Position comes from `getBoundingClientRect`, never `offsetTop`: `.hero` is
`position: relative`, so its `offsetTop` is not a document coordinate.

**It is dormant.** The page is one viewport tall, so the document does not
scroll and `--par` never leaves 0. That is correct, not broken, and it comes
alive the moment anything lands below the hero. Because it cannot be observed
on the page as it stands, `shoot-contact.mjs` drives it directly with a
temporary spacer and reports the result — verified 0 → 108px at 1440x900,
which is exactly 12svh.

Under reduced motion the loop **never starts**, and every property derived
from `--par` is additionally reset **by name** in the media query. The second
half is the load-bearing one: the loop writes `--par` as an inline style, and
an inline custom property beats a media query.

**No `will-change` anywhere**, per the finding recorded twice in CLAUDE.md.

---

## Verified

`node shoot-contact.mjs [w] [h] [p,...]`. All luminances painted, read with
`.hero__type` hidden, Rec.601.

| | whole | band | top | bottom | pendant | eyebrow |
|---|---|---|---|---|---|---|
| 1440x900 | 32.9 | 36.8 | 20.8 | 8.1 | 43.6 | 5.56:1 |
| 1280x800 | 32.9 | 36.8 | 21.3 | 8.2 | 43.6 | 5.61:1 |
| 1512x820 | 34.0 | 37.2 | 22.0 | 8.8 | 47.1 | 5.75:1 |
| 820x1180 | 28.1 | 41.2 | 16.0 | 9.6 | 33.0 | 6.23:1 |
| 390x844 | 36.6 | 45.0 | 25.3 | 11.4 | 43.6 | 7.17:1 |
| *about.html's opening* | *34* | *43* | *12* | *15* | — | — |

**The eyebrow is the binding constraint on this page**, worst case 5.56:1
against the 4.5:1 that 12.4px type is held to. The heading has ~16:1 where it
needs 3:1 and never binds — so it is the eyebrow, not the heading, that
decides how light the bed may go.

`band` sits under about.html's 43 for that reason. `bottom` sits at roughly
half its 15 because **the gap is the photograph, not the wash**: that file's
last 60px are a lit kitchen floor, this frame's are a black uniform and an
unlit counter. Measured both ways — a 0.56 bottom band gives 7.4 and a 0.40
band gives 8.1. Stacking black on black bought 0.7 of a point and cost the
lower edge its last readable detail, so the lighter band is the one in the
file. There is nothing down there to darken.

Also verified: every rest state is a true identity transform; **zero animations
run once the entrance is over** (nothing on this page loops forever, unlike
`drift` and `reserve-drift` elsewhere, so an unscoped `getAnimations().finish()`
sweep cannot be taken down by this section); and under reduced motion no inline
`--par` is ever written, `.hero__media` reports top 0 / height 100% /
transform none, and `getAnimations()` is empty.

---

## Linked up — 2026-08-17

Every "Contact" link on the site now points here: the footer nav on all three
pages, and `about.html`'s topbar. Done on explicit instruction after the
dead-end risk was raised.

The footer link lives inside the **transplanted** ending block, so it was
changed in `index.html` and re-copied to `menu.html` and `about.html` rather
than edited in place, preserving each page's one intentional delta
(`aria-current="page"` on its own footer link). `about.html`'s topbar is that
page's own markup and was edited directly. Verified: the CSS blocks still diff
to menu's single expected `scroll-behavior` delta and to nothing at all on
about; the reserve markup is identical on all three; the ending markup differs
only by the one `aria-current` line per page.

Two consequences, neither an oversight:

- **The page is a dead end by design** — no footer, no reserve block, so the
  topbar is the only way out.
- **Nothing links to `#reserve` any more.** The footer "Contact" link was the
  site's only link *into* the reservation block, so the booking CTA is now
  reached by scrolling rather than navigating. The fix, if it matters, is to
  give this page a lower half — not to point "Contact" back at another page's
  anchor.

Removing the block's stale `PLACEHOLDER` comment also fixed an unrelated drift:
`menu.html` had never carried that comment, so its ending markup had been five
lines short of the other two ever since it was transplanted. Re-copying
surfaced it.

## Deliberately not done

- **No reserve or ending transplant.** `contact.html`'s `:root` therefore
  carries only the tokens it uses. If those blocks are ever transplanted here
  they additionally need `--cream` (the hinge the peach adaptation turns, not
  a colour), `--ground`, `--menu-ink`, `--menu-body`, `--menu-accent` and
  `--ember` — added with the blocks, in one go. This is written into the
  `:root` comment as well, because a token that is used but not defined fails
  silently and has already done so twice on `about.html`.

## Still placeholder

- **The photograph**, for the two reasons above.
- Everything the rest of the site still lists: address, phone, email, socials,
  opening hours, the two cities, the `wa.me` number.
