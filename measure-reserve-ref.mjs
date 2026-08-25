/* Measure `assets/img/inspooooo.png`: the S-curve boundary between the ivory
   ground and the photograph, plus the ink extents of the left column.

   No ImageMagick and no canvas module on this machine, so pixels are read
   through the Chrome puppeteer already ships — same arrangement as
   bake-png-to-webp.mjs. Run from the project root.

   node measure-reserve-ref.mjs
*/
import puppeteer from 'puppeteer';
import { readFileSync } from 'node:fs';

const b64 = readFileSync('assets/img/inspooooo.png').toString('base64');

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setContent('<canvas id="c"></canvas>');

const out = await page.evaluate(async (b64) => {
  const img = new Image();
  img.src = 'data:image/png;base64,' + b64;
  await img.decode();
  const W = img.naturalWidth, H = img.naturalHeight;
  const c = document.getElementById('c');
  c.width = W; c.height = H;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, W, H).data;
  const at = (x, y) => { const i = (y * W + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
  const lum = (x, y) => { const [r, gg, b] = at(x, y); return 0.2126 * r + 0.7152 * gg + 0.0722 * b; };

  /* --- the ground's own colour, sampled well clear of any ink ---------- */
  const ground = at(30, 30);

  /* --- S-curve: scanning right-to-left, the first pixel that is not the
         ivory ground is the photograph's left edge on that row. The ground
         is near-uniform, so a small delta is a safe threshold; the hairline
         that floats just outside the curve is caught too, so record both
         the first non-ground pixel (the hairline) and the first pixel dark
         enough to be photograph. ------------------------------------------ */
  const isGround = (x, y) => {
    const [r, gg, b] = at(x, y);
    return Math.abs(r - ground[0]) < 8 && Math.abs(gg - ground[1]) < 8 && Math.abs(b - ground[2]) < 8;
  };

  const rows = [];
  for (let y = 0; y < H; y += Math.round(H / 64)) {
    let edge = null, photo = null;
    for (let x = W - 1; x >= 0; x--) {
      if (photo === null && lum(x, y) < 200 && !isGround(x, y)) photo = x;
      if (!isGround(x, y)) edge = x;          // keeps walking to the leftmost
      else if (edge !== null && x < edge - 40) break;   // past the curve, into clear ground
    }
    rows.push({ y, yPct: +(y / H * 100).toFixed(2), edge, edgePct: edge === null ? null : +(edge / W * 100).toFixed(2) });
  }

  /* --- ink extents of the left column, per band, measuring only the left
         half so the photograph never contributes ------------------------- */
  const band = (y0, y1, x1 = Math.round(W * 0.42)) => {
    let minX = 1e9, maxX = -1, minY = 1e9, maxY = -1;
    for (let y = y0; y < y1; y++) for (let x = 0; x < x1; x++) {
      if (lum(x, y) < 190) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
    if (maxX < 0) return null;
    return {
      x: minX, xPct: +(minX / W * 100).toFixed(2),
      r: maxX, rPct: +(maxX / W * 100).toFixed(2),
      wPct: +((maxX - minX) / W * 100).toFixed(2),
      top: minY, topPct: +(minY / H * 100).toFixed(2),
      bot: maxY, botPct: +(maxY / H * 100).toFixed(2),
      hPct: +((maxY - minY) / H * 100).toFixed(2),
    };
  };

  return { W, H, ground, rows, bands: {
    seal:     band(50, 120),
    line1:    band(170, 260),
    line2:    band(260, 340),
    rule:     band(345, 375),
    body:     band(395, 490),
    button:   band(535, 615),
    metaIcon: band(665, 710),
    metaLbl:  band(715, 745),
    metaVal:  band(745, 800),
  } };
}, b64);

console.log(`reference ${out.W}x${out.H}  ratio ${(out.W / out.H).toFixed(4)}`);
console.log(`ground rgb(${out.ground.join(', ')})  #${out.ground.map(v => v.toString(16).padStart(2, '0')).join('')}`);

console.log('\n--- left column ink (x / right / width / top / bottom, all % of the frame) ---');
for (const [k, v] of Object.entries(out.bands)) {
  if (!v) { console.log(k.padEnd(9), 'nothing'); continue; }
  console.log(k.padEnd(9),
    `x ${String(v.xPct).padStart(6)}%  r ${String(v.rPct).padStart(6)}%  w ${String(v.wPct).padStart(6)}%`,
    ` top ${String(v.topPct).padStart(6)}%  bot ${String(v.botPct).padStart(6)}%  h ${String(v.hPct).padStart(5)}%`);
}

console.log('\n--- S-curve: photograph left edge, per row ---');
for (const r of out.rows) {
  console.log(`y ${String(r.yPct).padStart(6)}%   edge ${r.edgePct === null ? '   —  ' : String(r.edgePct).padStart(6) + '%'}`);
}

await browser.close();
