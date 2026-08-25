/* Turn the measured S-curve into SVG path data for the reservation section.

   `measure-reserve-ref.mjs` prints where the photograph's left edge and the
   tan hairline sit at each height of `assets/img/inspooooo.png`. This turns
   those tables into cubic Béziers that pass exactly through every point kept
   below — Catmull-Rom converted to Bézier, rather than control handles placed
   by eye.

   Two things about the sampling are load-bearing:

   · The rows at y 40.6-43.8 need a tight ground threshold and a 10-pixel run
     to read at all. The lit plaster wall behind the counter is close enough
     to the ivory ground that a loose test returns a point 20% deep inside the
     photograph, and the resulting gap in the data makes Catmull-Rom overshoot
     into a control point right of both its endpoints — a visible kink exactly
     where the shape's one sharp feature belongs.
   · That feature is a CUSP, not a curve. The ground pushes a pointed tongue
     into the photograph with its tip at x 63.61% / y 39.26%, and its underside
     falls 3.3% of the width in 0.19% of the height. Sampling coarsely rounds
     it off into a single lazy ellipse, which is a different picture. The four
     points either side of it are kept at full resolution.

   Output is in objectBoundingBox units (0..1) for a figure box spanning
   FIG_LEFT..100% of the section width, so `clipPathUnits="objectBoundingBox"`
   stretches it with the section and the bleed to top, right and bottom stays
   exact at any aspect.

   node make-reserve-path.mjs
*/

const FIG_LEFT = 38;                 // figure box starts here, % of section width
const SPAN = 100 - FIG_LEFT;

/* Photograph's left edge: y%, x%, both of the comp. */
const PHOTO = [
  [0.00, 76.37], [3.13, 71.09], [6.25, 67.77], [9.38, 65.23], [12.50, 63.54],
  [17.19, 62.11], [23.44, 61.52], [29.69, 62.04], [35.94, 63.15],
  [39.26, 63.61],                                            // the tongue's tip
  [41.99, 62.50], [42.38, 58.27], [43.55, 55.34],            // its underside
  [45.31, 52.73], [48.44, 49.74], [53.13, 46.88], [59.38, 44.79],
  [67.19, 43.68],                                            // lower lobe extreme
  [75.00, 44.60], [82.81, 47.85], [89.06, 53.19], [93.75, 59.96],
  [96.88, 67.51], [100.0, 91.02],
];

/* The hairline. Measured where it escapes the photograph; from y≈60% to y≈87%
   it runs *inside* the silhouette and the opaque photograph hides it, which is
   the whole trick — the ring is drawn once, in full, and the occlusion is real
   rather than drawn. Those rows are held ~0.7% right of the photo edge so the
   ring genuinely passes behind it. Through the tongue the gap is the measured
   1.5% either side of it, since the scan cannot separate the two there. */
const HAIR = [
  [0.00, 75.50], [3.13, 70.10], [6.25, 66.86], [9.38, 64.13], [12.50, 62.37],
  [17.19, 60.94], [23.44, 60.35], [29.69, 60.94], [35.94, 61.98],
  [39.26, 62.04],
  [41.99, 61.00], [42.38, 56.77], [43.55, 53.64],
  [45.31, 50.98], [48.44, 48.31], [53.13, 45.96], [59.38, 44.53],
  [67.19, 44.38], [75.00, 45.30], [82.81, 48.55],
  [89.06, 52.21], [93.75, 58.01], [96.88, 65.56], [98.44, 75.60],
];

const r = n => +n.toFixed(4);

/* Uniform Catmull-Rom → cubic Bézier. The samples are unevenly spaced in y on
   purpose (dense through the cusp), so the tangents are scaled by the actual
   spacing rather than assumed equal — uniform CR on uneven samples is what
   produces the ringing this curve is prone to. */
function toBezier(pts) {
  const p = pts.map(([y, x]) => [r((x - FIG_LEFT) / SPAN), r(y / 100)]);
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const h = p2[1] - p1[1];                       // this segment's span in y
    const h0 = Math.max(p2[1] - p0[1], 1e-6);
    const h1 = Math.max(p3[1] - p1[1], 1e-6);
    const t1 = [(p2[0] - p0[0]) / h0, (p2[1] - p0[1]) / h0];
    const t2 = [(p3[0] - p1[0]) / h1, (p3[1] - p1[1]) / h1];
    const c1 = [r(p1[0] + t1[0] * h / 3), r(p1[1] + t1[1] * h / 3)];
    const c2 = [r(p2[0] - t2[0] * h / 3), r(p2[1] - t2[1] * h / 3)];
    d += `C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
    // flag any handle that leaves the segment's own x range — that is a kink
    const lo = Math.min(p1[0], p2[0]) - 0.02, hi = Math.max(p1[0], p2[0]) + 0.02;
    for (const c of [c1, c2]) if (c[0] < lo || c[0] > hi)
      console.error(`  ! overshoot at y=${(p1[1] * 100).toFixed(2)}%  handle x=${c[0]} outside [${r(lo)}, ${r(hi)}]`);
  }
  return d;
}

console.error('checking photograph path…');
const photo = toBezier(PHOTO) + 'L1 1L1 0Z';   // close along the right edge: the bleed
console.error('checking hairline path…');
const hair = toBezier(HAIR);

console.log('--- clip path (photograph), objectBoundingBox, figure box %d%%..100%% ---', FIG_LEFT);
console.log(photo);
console.log('  %d chars', photo.length);
console.log('\n--- hairline path, same box, stroked, no fill ---');
console.log(hair);
console.log('  %d chars', hair.length);
