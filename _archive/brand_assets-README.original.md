# brand_assets

## What's here

`misono logo.jpeg` — a **photograph of the printed logo** (831×702), shot at an angle,
soft focus, on paper. It is a usable colour and shape reference. It is **not** a usable
web asset: the paper background is opaque, so dropping it into the dark hero would put a
cream rectangle in the middle of the composition.

`misono-mark.svg` / `misono-mark-mono.svg` — the four-petal mon, **traced by hand from
that photo**. The first is on the brand navy (used as the favicon); the second is a
single-colour version on a transparent ground, drawn in the hero through a CSS `mask` so
its colour still comes from the palette tokens.

> **These are reconstructions, not the original artwork.** They were matched against the
> photo across several passes and are close, but the source was blurry and skewed. Check
> them against real artwork before anything ships publicly.

## Still needed

| File | Why it's needed |
|---|---|
| `logo.svg` (or a transparent PNG) | The full lockup, including the wordmark's actual typeface — the hero currently sets "MISONO" in Marcellus, which is a stand-in, not the real letterforms. Swap point is commented on `.wordmark` in `index.html`. **Do not recolour, distort or redraw the supplied logo.** |
| Real artwork for the mon | To replace the trace above. |
| `palette.txt` / style guide | Exact brand hex values — the navy below was read off a photograph and is approximate. |
| Real Misono footage | The three hero clips are Pexels standins — see below. |
| Food photography | Any section added below the hero. |

## Current palette — indigo (ai / aizome)

Derived from the logo's navy, **not invented** — but read off a photograph, so treat the
values as approximate until a real spec arrives. The photo was underexposed (its paper
read `#B4BBB1`); white-balancing that to `#FEFEFE` puts the printed navy at `#3A5280`.

| Token | Hex | Role |
|---|---|---|
| ai | `#080D17` | base — near-black indigo |
| kon | `#101827` | elevated panel surface |
| gunjō | `#3A5280` | **the logo's navy** — the bloom at each seam |
| washi | `#EDE7DC` | primary type — warm off-white, never `#FFF` |
| shirogane | `#A9A093` | type that sits over moving footage (tagline) |
| hai | `#8A8177` | ash — micro-labels |

The stage is cool and the footage grade is warm. That tension is deliberate.

## The hero video is placeholder footage

`assets/video/hero-*.mp4` and the `assets/img/hero-1-slice*.jpg` stills are stock clips
from Pexels, used under the [Pexels License](https://www.pexels.com/license/)
(commercial use permitted, no attribution required).

| Scene | Beat | Source |
|---|---|---|
| 1 | Slicing | pexels.com/video/8901916 — knife on a premium salmon slab |
| 2 | Garnishing | pexels.com/video/8902312 — chopsticks placing a shoot on a seared roll |
| 3 | Serving | pexels.com/video/8902005 — presenting the finished plate |

All three come from the **same studio shoot** — same set, same chef, same lighting —
and carry an identical ffmpeg grade. That is what makes them read as one film rather
than three clips; keep that constraint if you swap any of them.

**Known limitation:** all three show clear food-service gloves. Every free-licence
sushi clip found across repeated searches has either gloves or a bright white board —
it is a property of the genre, not of these particular picks. Scene 1 is framed and
graded so the salmon leads and the glove recedes; real Misono footage of bare-handed
itamae work would fix it outright.

Each ships twice: a 16:9 crop for ≥768px and a 9:16 `-tall` crop below that. Replace them
with real Misono footage when you have it — keep the same filenames and nothing else needs
to change. Re-encode to match: ~6.5s, H.264 MP4 only (VP9 measured larger on this kind of
dark grainy footage), and **graded down at encode time** with ffmpeg `eq` + `curves`, since
the CSS veil is deliberately light and will not rescue an unbaked clip.

**Mixkit is not an option for this site.** Its free 720p downloads are Restricted
License — personal use only. Commercial use needs a paid Envato subscription.

## After adding real logo artwork

1. Sample the actual hex values from it and replace the approximate navy above.
2. Update the **Brand** line in `CLAUDE.md` — drop the "provisional" note.
3. Update the token block in `index.html` (`:root`). The veil is a bare triplet
   (`--veil:8 13 23`) consumed as `rgb(var(--veil) / .58)`, so the whole scrim system
   retunes from that one line.
4. Replace `misono-mark.svg` and `misono-mark-mono.svg` with the real artwork and delete
   the provenance warnings.
5. Update this table so it stops describing colors nobody uses.

Filenames with spaces must be URL-encoded when referenced from HTML (`my%20logo.svg`).
