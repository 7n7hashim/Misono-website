# Misono → Li's Chinese Restaurant — rebrand design

**Date:** 2026-08-26
**Scope:** all four pages, every token, every photograph, the logo.
**Architecture:** unchanged. Every pin, rAF loop, 3D entrance, clip path and
measured layout survives. This is a re-skin and a re-content, not a rebuild.

---

## 1. The subject, and what is actually known

**Li's Chinese Restaurant**, Kenya. Two branches. Official site
`lischineserestaurantnairobi.co.ke`. Researched 2026-08-26; every fact below has
a source, and anything without one is not asserted anywhere on the site.

| fact | value | source |
|---|---|---|
| Mombasa (the original) | Petrocity Plaza, 1st Floor, Links Road, Nyali, Mombasa 80112 | TripAdvisor listing |
| Mombasa phone | +254 799 402101 | TripAdvisor listing |
| Nairobi (second) | Petrocity, Limuru Road, Gigiri (QR74+JR2) | official site |
| Nairobi phone | +254 746 815 106 | official site |
| Email | reservations@ / info@ / orders@ / careers@lischineserestaurantnairobi.co.ke | official contact page |
| Hours, Nairobi | Tue–Sun 11:00–22:30, closed Mondays | official site |
| Hours, Mombasa | Tue–Sun 11:00–21:00, closed Mondays | TripAdvisor listing |
| Executive Chef | Hari Khasu | official about page |
| Manager | Morris Mativo | official about page |
| Private dining | 2 VIP rooms, 12–15 people (Mombasa) | TripAdvisor listing |
| Services | reservations, takeaway, Uber Eats, full bar, free parking | official site + listing |
| Socials | IG @lischineserestaurant, IG @lischinese (Msa), X @LisChinese, TikTok @lischineserestaurantnrb | official site |
| Cuisine | Chinese / Indo-Chinese, Cantonese specialism, seafood strength from the coast | listings |

**The full carte is real.** ~200 dishes with real KSh prices were taken from the
official menu page and are reproduced on `menu.html`. Nothing on that page is
invented — which reverses the previous state, where every dish and price was.

### Deliberately NOT asserted
- **No founding years.** The old site claimed 1995 Nairobi / 2006 Mombasa for
  Misono. Nothing comparable is published for Li's. The copy says Mombasa came
  first — which the official site does say — and stops there.
- **No drive times or distances** on the location cards, unchanged from the
  standing rule.
- **No single number reaching both branches.** Each branch carries its own phone
  in its own location band. `.details` carries the Nairobi reservations line and
  the email, because that is what the official site presents as the booking route.
- **The shared reserve block states "Tuesday – Sunday / Closed Mondays".** The two
  branches genuinely close at different times (22:30 / 21:00), and that block is
  byte-copied to four pages, so it cannot carry a time without asserting one
  branch's hours as the house's. Closed-Mondays is true of both, is two lines,
  and does not wrap — the two shape constraints that block has always had.

---

## 2. The logo

The only artwork obtainable is `logo.jpg` from the official site: **150×150,
JPEG, opaque white square.** Measured brand colours: red **#CD393E**, black
**#1B191A**.

At 150px it cannot be a hero wordmark and it cannot sit on a photograph. It was
**redrawn as SVG**, and the method matters because a pixel trace was tried first
and rejected.

- **Ring.** Red pixels form an annulus at r 65–75.7 px about (75,75). In a
  100-unit box: `cx=50 cy=50 r=46.2 stroke-width=7.1`.
- **Chopsticks.** Two tapered black bars, handles at top, tips at bottom.
  A runs `x=2.25` at the top to `x≈26.6` at the bottom (slope 0.217), width
  5.3→2.4. B is near-vertical at `x≈22.7`, width 6→1.8. They cross at **y≈88** —
  low in the ring, which is what the source does.
- **`Li's` lettering — fitted, not traced.** A Moore-boundary trace of the
  150px glyphs produced visible staircase artefacts and shipped worse than
  either alternative. The letterforms are straight-edged wedges, so the edges
  were **least-squares fitted** instead: the L stem's left edge is
  `x = 0.0836y + 34.47` and its right `x = -0.0813y + 43.54`, residual **0.17
  units** — the edges really are straight, which is why fitting beats tracing.
  The `s` is the one genuinely curved glyph and is a blurred trace with two
  Chaikin passes.

**The mark is a reconstruction and is flagged as one.** Verify against official
artwork before launch. `brand_assets/misono-mark*.svg` and the old logo photo
are superseded.

The hero keeps Misono's arrangement: the circular device top-left, the wordmark
set as type. `LI'S` is Cormorant, not the logo's own lettering — a 150px raster
cannot supply a 120px wordmark, and a typographic lockup is the honest answer.

---

## 3. Palette — re-derived, never carried across

Ground moves peach → **warm ivory**. Every token re-solved against it.

| token | value | ratio on ground | role |
|---|---|---|---|
| `--ground` | `#F6EEE1` | — | warm ivory, every section on every page |
| `--ink` | `#0B0806` | — | behind photographs only, unchanged |
| `--li-ink` | `#241A14` | **14.79:1** | display type |
| `--li-body` | `#6A574A` | **5.93:1** | body |
| `--li-red` | `#A3221C` | **6.51:1** | accent — eyebrows, rules, links |
| `--li-gold` | `#9C7230` | **3.75:1** | non-text boundary (old gold was a tight 3.26) |
| `--li-hair` | `#D9B98A` | — | decorative only, no minimum applies |
| `--brand-red` | `#CD393E` | 3.91:1 | the measured logo red — **device only, never text** |

**The one rule the re-skin turns on:** `--li-red` is 6.51:1 on the ivory but
**2.67:1 on `--ink`**. Red is a light-ground colour here. Dark sections take
gold or ivory, never red, for anything that has to be read.

`--brand-red` #CD393E is the logo's own value and measures 3.91:1 — it clears
the 3:1 non-text floor and fails AA for text. It colours the mark and nothing
else.

The old token names (`--menu-ink`, `--menu-body`, `--menu-accent`, `--res-gold`,
`--res-hair`) are **kept as aliases** pointing at the new values, so the ~1,400
`var()` call sites across four pages do not all have to be rewritten to move the
palette. `--cream` keeps its role as the hinge the adaptation blocks turn.

---

## 4. Section map

Every section keeps its geometry, its motion and its tooling. Only content moves.

### `index.html`
| section | was | becomes |
|---|---|---|
| `.hero` | MISONO / The Art of Japanese Dining | **LI'S / The Art of the Chinese Table**, new photograph, real socials |
| `.menu` | The Art of Teppanyaki · Lobster/Scallops/Garlic Rice/Wagyu | **From the Wok** · Peking Duck / Chilli Garlic Prawns / Sizzling Beef / Dim Sum |
| `.beyond` | A unique experience (counter) | **A Table Worth Sharing** — the round table, dishes to the centre |
| `.dish` | Chirashi Sushi · Neta/Shari/Yakumi/Tsuma | **Peking Duck** · the skin / the pancake / scallion & cucumber / the sauce |
| `.reserve` | hours 12:00–23:00 daily | **Tuesday – Sunday / Closed Mondays** |
| `.ending` | Menu/About/Contact | adds **Locations** and **Reservations** |

### `menu.html`
3D entrance untouched. Frames: The Counter/Teppanyaki/Chirashi/Sashimi →
**The Wok / Peking Duck / Dim Sum / Seafood**. Display lines stay two words for
the measured layout. The carte becomes Li's real menu.

### `about.html`
- Statement rebuilt from Li's own published words — *"the finest ingredients,
  masterful technique, genuine hospitality"* — in the same five-line shape.
  Line lengths are re-measured, not assumed.
- **Figures stop being invented.** 14 years / 50+ preparations / 12 seats /
  9 courses become **2 restaurants · 200+ dishes · 2 private rooms · 6 nights a
  week** — all four sourced above.
- Chapters I–IV → **The Wok / The Hand / The Coast / The Round Table**.
- Experience 01–03 → **Wok & Fire / Dim Sum by Hand / The Li's Table**.
- `一期一会` → **团圆** *tuányuán*, the table coming together. A Chinese idea
  that carries the same closing beat without becoming a lantern.

### `contact.html`
Real addresses, per-branch phones, `お問い合わせ` → **联系我们** (4 glyphs, so the
`white-space: nowrap` trap is easier than the 6-glyph original but the rule
stays). FAQ rewritten against researched fact: two Petrocity addresses, Uber
Eats, the 2 VIP rooms, vegetarian confirmed from the real menu's tofu/paneer/
vegetable sections.

---

## 5. Photography

~26 photographs. Li's own imagery is not available at usable resolution or
licence, so frames are sourced from Pexels, matched dish-by-dish to Li's **real**
menu, and graded through the existing `bake-*.py` arrangement so the site still
reads as one house. **Every replacement is flagged as a placeholder in markup**,
as the contact hero and location bands already are.

The existing grading bands are kept and a frame is levelled against the section
it shares a composition with before the band its subject belongs to.

`assets/img/food2-9.jpeg` and `foodinspo1.jpeg` are **Misono's own dish
photographs** — real material belonging to a different restaurant. They leave
the site entirely rather than being re-captioned.

---

## 6. What must be re-solved, not carried

- **The mobile hero crop.** `54.5%` and `top: 68%` were solved against one
  specific 1.874:1 photograph. A new hero image invalidates both. Re-run
  `shoot-hero-mobile.mjs` and re-solve the worst-tile contrast floors.
- **Every contrast pair**, per ground, per the standing rule.
- **The three peach adaptation blocks** stay in step with each other.
- **The four reserve/ending copies** stay byte-identical; edit `index.html`
  and re-copy.

## 7. Verification

`compare-layout.mjs` will report differences — the layout is *intended* to move
in the sections whose copy changed. `layout-snapshot.json` is re-saved at the
end, and that re-save is stated explicitly rather than done quietly.

Then: `verify-touch.mjs`, `verify-locale.mjs`, `compare-photos.mjs`,
`verify-dist.mjs`, `perf.mjs`, `perf-scroll.mjs`.
