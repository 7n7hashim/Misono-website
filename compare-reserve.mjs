/* Compare the rendered reservation column against the comp, band by band.

   The comp is 3:2 and a laptop is not, and the column is scaled and re-centred
   rather than pinned, so comparing y-positions directly is meaningless. What
   IS comparable is the GAP between one band of ink and the next, expressed in
   the block's own scale unit --u. Those are the comp's measured ratios, and
   they should hold at every viewport.

   Ink is measured from the rendered pixels, the same way it was measured in the
   comp — not from layout boxes. Half-leading and side bearing both sit between
   a box edge and the mark a reader actually sees, and mixing the two is what
   walked the old section's column 60px long. Each band is scanned inside its
   own element's box, because auto-detecting bands splits every multi-line block
   into one band per line.

   Usage, from the project root:
     node compare-reserve.mjs [width] [height] [page]
*/
import puppeteer from 'puppeteer';

const W = +(process.argv[2] || 1440);
const H = +(process.argv[3] || 900);
const PAGE = process.argv[4] || 'index';

/* The comp's own bands, from measure-reserve-ref.mjs, as % of its height.
   1u is 1% of the comp's width (15.36px); it is 1024 tall, so 1%H = 0.6667u. */
const H2U = 10.24 / 15.36;
const COMP = [
  ['eyebrow',     '.reserve__eyebrow',  7.62, 10.35],
  ['heading',     '.reserve__title',   18.46, 31.64],
  ['rule',        '.reserve__rule',    35.55, 35.64],
  ['body',        '.reserve__body',    39.75, 47.17],
  ['button',      '.reserve__cta',     52.73, 58.89],
  /* .reserve__ctasub has no counterpart in the comp — it is this build's
     addition. Its span is reported but never compared. */
  ['meta icon',   '.reserve__icon',    66.21, 68.85],
  ['meta label',  '.reserve__metalbl', 70.70, 71.68],
  ['meta value',  '.reserve__metaval', 73.63, 77.34],
];

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
await page.goto(`http://localhost:3001/${PAGE}.html`, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts && document.fonts.ready);
await page.evaluate(() => {
  const s = document.querySelector('.reserve');
  window.scrollTo({ top: s.getBoundingClientRect().top + window.scrollY, behavior: 'instant' });
});
await page.evaluate(() => new Promise(r =>
  requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 150)))));

const png = (await page.screenshot({ encoding: 'base64' }));

const out = await page.evaluate(async (png, sels) => {
  const img = new Image(); img.src = 'data:image/png;base64,' + png; await img.decode();
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data;
  const inked = (x0, x1, y) => {
    for (let x = x0; x < x1; x++) {
      const i = (y * c.width + x) * 4;
      if (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2] < 190) return true;
    }
    return false;
  };
  /* Ink extent inside the element's own box, padded a little vertically so a
     descender or an outline that overflows its box is still caught. */
  const span = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const b = el.getBoundingClientRect();
    const x0 = Math.max(0, Math.floor(b.left)), x1 = Math.min(c.width, Math.ceil(b.right));
    const y0 = Math.max(0, Math.floor(b.top) - 4), y1 = Math.min(c.height, Math.ceil(b.bottom) + 4);
    let top = null, bot = null;
    for (let y = y0; y < y1; y++) if (inked(x0, x1, y)) { if (top === null) top = y; bot = y; }
    return top === null ? null : [top, bot];
  };
  const probe = document.createElement('div');
  probe.style.cssText = 'position:absolute;width:calc(10 * var(--u));';
  document.querySelector('.reserve').appendChild(probe);
  const u = probe.getBoundingClientRect().width / 10;
  probe.remove();
  return { u, spans: sels.map(span), sub: span('.reserve__ctasub') };
}, png, COMP.map(r => r[1]));

const u = out.u;
console.log(`\n${PAGE}.html  ${W}x${H}   --u = ${u.toFixed(2)}px`);
if (!u) { console.log('  --u is 0 — this viewport is on the stacked branch, gaps are not comparable.'); await browser.close(); process.exit(0); }

console.log('\ngap between bands            comp     rendered    delta');
console.log('                              (u)        (u)        (u)');
let worst = 0;
for (let i = 1; i < COMP.length; i++) {
  const a = out.spans[i - 1], b = out.spans[i];
  if (!a || !b) { console.log(`${COMP[i][0].padEnd(28)} not found`); continue; }
  const compGap = (COMP[i][2] - COMP[i - 1][3]) * H2U;
  const gotGap = (b[0] - a[1]) / u;
  const delta = gotGap - compGap;
  worst = Math.max(worst, Math.abs(delta));
  console.log(`${(COMP[i - 1][0] + ' → ' + COMP[i][0]).padEnd(28)}` +
    `${compGap.toFixed(2).padStart(5)}${gotGap.toFixed(2).padStart(11)}` +
    `${((delta >= 0 ? '+' : '') + delta.toFixed(2)).padStart(11)}${Math.abs(delta) > 0.4 ? '   <<' : ''}`);
}

console.log('\nband heights                 comp     rendered    delta');
for (let i = 0; i < COMP.length; i++) {
  const s = out.spans[i];
  if (!s) { console.log(`${COMP[i][0].padEnd(28)} not found`); continue; }
  const compH = (COMP[i][3] - COMP[i][2]) * H2U;
  const gotH = (s[1] - s[0]) / u;
  const delta = gotH - compH;
  console.log(`${COMP[i][0].padEnd(28)}${compH.toFixed(2).padStart(5)}${gotH.toFixed(2).padStart(11)}` +
    `${((delta >= 0 ? '+' : '') + delta.toFixed(2)).padStart(11)}${Math.abs(delta) > 0.4 ? '   <<' : ''}`);
}

if (out.sub) console.log(`\nctasub (no comp counterpart)  —  spans ${((out.sub[1] - out.sub[0]) / u).toFixed(2)}u`);
console.log(`\nworst gap error: ${worst.toFixed(2)}u  (${(worst * u).toFixed(1)}px at this size)`);

/* ---- the S-curve ------------------------------------------------------- */
/* The clip is in objectBoundingBox units, so its x-fractions should hold at
   any aspect — this is the check that proves it, since the comp is 3:2 and
   almost no real screen is. Read the same way the comp was: walk in from the
   right edge and call ten consecutive ground pixels the boundary. */
const COMP_CURVE = [
  [0, 76.37], [6.25, 67.77], [12.5, 63.54], [23.44, 61.52], [35.94, 63.15],
  [39.26, 63.61], [45.31, 52.73], [50, 48.63], [56.25, 45.64], [62.5, 44.08],
  [67.19, 43.68], [75, 44.6], [82.81, 47.85], [89.06, 53.19], [93.75, 59.96],
  [96.88, 67.51],
];

const curve = await page.evaluate(async (png, ys) => {
  const img = new Image(); img.src = 'data:image/png;base64,' + png; await img.decode();
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data;
  const at = (x, y) => { const i = (y * c.width + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
  const G = at(30, 30);
  const isGround = (x, y) => { const q = at(x, y);
    return Math.abs(q[0] - G[0]) < 6 && Math.abs(q[1] - G[1]) < 6 && Math.abs(q[2] - G[2]) < 6; };
  return ys.map(y0 => {
    const y = Math.min(c.height - 1, Math.round(c.height * y0 / 100));
    let run = 0, edge = null;
    for (let x = c.width - 1; x >= 0; x--) {
      if (isGround(x, y)) { run++; if (run >= 10) { edge = x + 10; break; } } else run = 0;
    }
    return edge === null ? null : +(edge / c.width * 100).toFixed(2);
  });
}, png, COMP_CURVE.map(r => r[0]));

console.log('\nS-curve: photograph left edge, % of section width');
console.log('   y%      comp    rendered      delta');
let cw = 0;
COMP_CURVE.forEach(([y, x], i) => {
  const r = curve[i];
  if (r === null) { console.log(`${String(y).padStart(6)}${x.toFixed(2).padStart(10)}      not found`); return; }
  const dl = r - x;
  cw = Math.max(cw, Math.abs(dl));
  console.log(`${String(y).padStart(6)}${x.toFixed(2).padStart(10)}${r.toFixed(2).padStart(12)}` +
    `${((dl >= 0 ? '+' : '') + dl.toFixed(2)).padStart(11)}${Math.abs(dl) > 1.2 ? '   <<' : ''}`);
});
console.log(`\nworst curve error: ${cw.toFixed(2)}% of width (${(cw * W / 100).toFixed(1)}px at this size)`);

await browser.close();
