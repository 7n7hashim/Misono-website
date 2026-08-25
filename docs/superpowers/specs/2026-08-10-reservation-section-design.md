# Misono — Reservation section

> **SUPERSEDED 2026-08-15 by `2026-08-15-reservation-redesign-design.md`.** The client
> supplied a new comp and the section was rebuilt against it on all three pages. What
> below is still true: the *purpose*, and the WhatsApp mechanism — the `wa.me` href and
> its pre-written message are unchanged. What is gone: the two-column composition, the
> contained blob photograph and its gold ring, the four supporting items, the drawn
> WhatsApp glyph, and the sentence-case heading (§ "Design direction" records why
> sentence case was chosen; the client has since asked for caps, and the new spec records
> that reversal). Read this one only for the reasoning behind the CTA. Do not build from
> it.

**Date:** 2026-08-10
**Scope:** One new section appended to `index.html`. No existing section is modified.
**Reference:** `assets/img/reserve table.png` (1536×1024 comp, supplied by the user).

> **Amended 2026-08-11 — the ground changed after this was written.** Everything
> below measures against `--cream #FCF8F5`; the site now sits on `--ground #F7E8DF`
> and the cream is gone. The measurements stand as the record of how the section was
> derived — do not read the hex values as current. What actually changed on the peach:
> `--menu-body` → `#63504A`, `--menu-accent` → `#99551C`, and `--res-gold` → `#AC7634`
> (at `#B8813F` it falls to 2.81:1 and fails the 3:1 it was chosen for). `--res-hair`
> is unchanged — decorative only. See the peach adaptation blocks at the foot of
> `index.html` and `menu.html`, and CLAUDE.md.

## Purpose

Make it effortless for a guest to reserve a table. The single job of the section is to
get someone into a WhatsApp conversation with the restaurant, with the message already
written for them.

## Placement

`<section class="reserve">` inside `</main>`, after the existing `.dish` (Chirashi)
section. It is the last thing on the page.

## Design direction

Reinterpret the reference — do not copy it. The reference supplies the vibe (cream
ground, serif display, gold/brown accents, generous whitespace, editorial two-column
composition) and the compositional rhythm. Everything else comes from Misono's existing
system so the section reads as the same site rather than a transplant.

### Inherited from the existing page

Nothing new is invented where the file already has an answer:

| Token | Value | Already used by |
|---|---|---|
| `--cream` | `#FCF8F5` | `.menu`, `.dish` |
| `--menu-ink` | `#2F1B19` | `.menu`, `.dish` |
| `--menu-body` | `#6B5750` | body copy, 6.5:1 on cream |
| `--menu-accent` | `#9A5C26` | eyebrows, 4.5:1 on cream |
| `--ease-quiet` | `cubic-bezier(0.22, 0.61, 0.36, 1)` | every transition on the page |

Type pairing is the site's existing rule: **Cormorant Garamond for anything named,
Jost for anything explained.**

### Composition

Two columns from 1000px, stacked below. Left column carries all the type; right column
carries the image.

Left column, top to bottom:

1. The Misono mon, in `--menu-accent`, hairline stroke — same geometry as the hero's.
2. Display heading — **"Reserve your table"**, Cormorant Garamond, sentence case.
   *Note:* the reference sets this in all-caps. Sentence case was chosen instead to hold
   the convention `.dish__title` and `.menu` already establish. Deliberate departure.
3. A short hairline rule.
4. Eyebrow — uppercase, tracked `0.28em`, `--menu-accent`. Matches `.menu__eyebrow` and
   `.dish__eyebrow` exactly.
5. Body paragraph — Jost 300, `--menu-body`.
6. The CTA.
7. A four-item row with hairline dividers.

### The WhatsApp CTA

The brief: it must not look like a generic green WhatsApp button.

- **No green anywhere.** The brand colour is dropped entirely.
- Sharp-cornered box, 1px `--menu-accent` border. Sharp rather than the pill
  `.menu__cta` uses, because the reference's CTA is a rectangle and the contrast against
  the round mon and the curved image is worth having.
- The WhatsApp glyph is redrawn as a **hairline stroke** at the mon's stroke weight,
  not a filled disc — so it sits in the same drawn-line family as the mon and the four
  icons rather than reading as a pasted-in third-party logo.
- Label `RESERVE ON WHATSAPP` in tracked Jost caps, `--menu-ink`.
- Gold sub-label beneath: `OPENS A MESSAGE, ALREADY WRITTEN`.
- **Hover:** the ink fill wipes across left-to-right and the label inverts to cream.
  This is the identical `::before { transform: scaleX(0) → scaleX(1) }` move
  `.menu__cta` already uses, so the button moves like the rest of the site.
- Focus-visible and active states required, per the project's interactive-state rule.

**Link target:** `https://wa.me/<number>?text=<url-encoded message>`

Pre-written message:

```
Hello Misono — I'd like to reserve a table.

Name:
Date:
Time:
Number of guests:

Thank you.
```

### Fitting one screen (added 2026-08-10, after the first build)

The section must sit entirely within one viewport on desktop — heading, body,
photograph, CTA and the four items all visible, nothing clipped, nothing cramped.

Built as **one aspect-locked block** rather than by trimming values until it fit.
Every desktop length is a multiple of a single unit:

```css
--u: max(8.6px, min(1vw, 1.38vh));
```

The composition measures 69.4 of those units tall, so capping `--u` against
viewport height is what clears a 100vh screen. It clears it by scaling and
re-centring the whole block with every measured ratio intact — on a wide screen
it sits centred with air either side, the way a print spread does — rather than
by compressing the vertical rhythm, which is the one move that would read as
cramped.

Two refinements make the arithmetic reliable rather than approximate:

- **Legibility floors.** The comp's own proportions put the body at 11px and the
  item labels at 9px on a 1280×720 laptop — faithful and unreadable. The four
  smallest sizes carry px floors (12 / 12 / 10 / 9.5). Below those the ratio
  gives way to the reader.
- **Leading set as a length in `--u`,** not a multiple of font-size, so the
  comp's measured line pitches hold even where a floor has overridden the
  font-size, and the block's height stays exactly proportional to `--u`.

Mobile is deliberately **not** held to one screen — it stacks and scrolls, with
the photograph leading.

Verified at 1000×700, 1100×640, 1280×720, 1366×700, 1366×768, 1440×900,
1512×982, 1600×900, 1920×1080 and 2560×1440: section height ≤ viewport height
and `scrollHeight == clientHeight` at every one, so nothing is silently clipped
by the section's `overflow: hidden`.

### Image treatment

The reference's signature is an organic blob mask with a gold hairline floating just
outside it. That idea is kept — it reads as a hand-thrown ceramic edge — but built in
CSS rather than baked into a file:

- Asymmetric 8-value `border-radius` on the frame.
- A second absolutely-positioned element, same curve, 1px `--menu-accent` border,
  offset a few percent outside.
- One slow ambient `transform` movement, in the manner of the hero's `drift` and the
  plate's turn. `transform`/`opacity` only. Disabled under `prefers-reduced-motion`.

No scrim or dark overlay on the photograph.

### The four supporting items

Counter & Table Seating · Parties Up To 8 · Dinner Tue–Sun · Reply Within The Hour

Hairline-stroke icons matching the mon's drawn-line weight, separated by hairline
vertical dividers.

> **These four claims are placeholder content.** `CLAUDE.md` lists service hours as
> pending real content, and party size, seating and response time are equally
> unconfirmed. They are marked in an HTML comment beside the placeholder phone number so
> both get swapped in the same pass.

## Placeholders to replace before launch

| Placeholder | Where |
|---|---|
| `+254 700 000 000` | the `wa.me` href |
| Seating / party size / opening days / response time | the four-item row |

## Out of scope

- Any change to the hero, menu, gallery or Chirashi sections.
- A reservation form, availability calendar, or booking integration. WhatsApp is the
  entire mechanism.
- Replacing the traced mon with real artwork.

## Verification

Served from `http://localhost:3001` (port 3000 belongs to another project on this
machine). Screenshot with `screenshot.mjs` at desktop, tablet and mobile, compared
against the reference over at least two rounds, measuring rather than eyeballing.
Contrast checked against the cream ground. `temporary screenshots/` emptied at the end.
