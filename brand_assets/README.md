# brand_assets

## What's here

`misono logo.jpeg` — a **photograph of the printed logo** (831×702), shot at an angle,
soft focus, on paper. It is a usable colour and shape reference. It is **not** a usable
web asset: the paper background is opaque, so it cannot be placed straight onto a
coloured or dark ground without a cream rectangle coming with it.

`misono-mark.svg` / `misono-mark-mono.svg` — the four-petal mon, **traced by hand from
that photo**. The first sits on a navy ground; the second is a single-colour version on a
transparent ground, so its colour can be driven from CSS rather than baked in.

> **These are reconstructions, not the original artwork.** They were matched against the
> photo across several passes and are close, but the source was blurry and skewed. Check
> them against real artwork before anything ships publicly.

## One measured fact about the logo

The photo is underexposed — its paper reads `#B4BBB1`. White-balancing that to `#FEFEFE`
puts the printed navy at roughly **`#3A5280`**.

This is a measurement, not a brand spec, and not a recommendation to build on. It is
recorded only so nobody has to re-derive it. A real style guide overrides it outright.

## Still needed

| File | Why it's needed |
|---|---|
| `logo.svg` (or a transparent PNG) | The full lockup, including the wordmark's actual typeface. No typeface here is the real one. **Do not recolour, distort or redraw the supplied logo.** |
| Real artwork for the mon | To replace the trace above. |
| `palette.txt` / style guide | Exact brand hex values. Everything currently known is the single approximate reading above. |
| Real Misono footage and stills | There is none in the project. |

## Notes for whoever sources stock

- **Pexels** ([license](https://www.pexels.com/license/)) permits commercial use with no
  attribution. It was the source used previously and is a safe default.
- **Mixkit is not an option for this site.** Its free 720p downloads are Restricted
  License — personal use only. Commercial use needs a paid Envato subscription.
- Free-licence sushi footage almost universally shows food-service gloves or a bright
  white board; that is a property of the genre, not of any particular search. Real
  bare-handed itamae footage would have to be commissioned.

## After adding real logo artwork

1. Sample the actual hex values from it and replace the approximate navy above.
2. Replace `misono-mark.svg` and `misono-mark-mono.svg` with the real artwork and delete
   the provenance warnings.
3. Update this file so it stops describing an approximation nobody needs any more.

Filenames with spaces must be URL-encoded when referenced from HTML (`my%20logo.svg`).
