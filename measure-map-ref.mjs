/* Measure `assets/img/map inspo.png` — the location-section reference.

   Everything is printed as a share of the FRAME WIDTH, never in pixels: the
   comp is 2048 wide and the site is designed at 1440, so a pixel comparison
   between the two is meaningless. Shares of width are scale-invariant.

   No ImageMagick and no canvas module on this machine, so pixels are read
   through the Chrome puppeteer already ships — same arrangement as
   measure-reserve-ref.mjs and bake-png-to-webp.mjs. Run from the project root.

   node measure-map-ref.mjs
*/
import puppeteer from 'puppeteer';
import { readFileSync } from 'node:fs';

const b64 = readFileSync('assets/img/map inspo.png').toString('base64');

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
  const hex = ([r, gg, b]) => '#' + [r, gg, b].map(v => v.toString(16).padStart(2, '0')).join('');

  const ground = at(30, 30);
  const isGround = (x, y) => {
    const [r, gg, b] = at(x, y);
    return Math.abs(r - ground[0]) < 8 && Math.abs(gg - ground[1]) < 8 && Math.abs(b - ground[2]) < 8;
  };

  /* --- ink extents in a band, left half only so the photograph never
         contributes. Threshold is "not the ground" rather than a luminance
         cut, because the gold eyebrow is LIGHTER than the dark heading and a
         single luminance threshold catches one or the other, not both. --- */
  const band = (y0, y1, x0 = 0, x1 = Math.round(W * 0.55)) => {
    let minX = 1e9, maxX = -1, minY = 1e9, maxY = -1, n = 0;
    let rs = 0, gs = 0, bs = 0;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      if (!isGround(x, y)) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
        const [r, gg, b] = at(x, y);
        // darkest-third sample only, so antialiased edge pixels do not wash
        // the reported colour toward the ground
        if (lum(x, y) < 140) { rs += r; gs += gg; bs += b; n++; }
      }
    }
    if (maxX < 0) return null;
    return {
      xPct: +(minX / W * 100).toFixed(2),
      rPct: +(maxX / W * 100).toFixed(2),
      wPct: +((maxX - minX) / W * 100).toFixed(2),
      top: minY, bot: maxY,
      hPct: +((maxY - minY) / W * 100).toFixed(2),   // height as share of WIDTH too
      hPx: maxY - minY,
      ink: n ? hex([Math.round(rs / n), Math.round(gs / n), Math.round(bs / n)]) : null,
    };
  };

  /* --- the photograph's own rect: scan for the first row/col that stops
         being ground across a long run ---------------------------------- */
  let imgTop = null;
  for (let y = 0; y < H && imgTop === null; y++) {
    let run = 0;
    for (let x = Math.round(W * 0.3); x < Math.round(W * 0.7); x++) {
      if (!isGround(x, y)) { if (++run > 200) { imgTop = y; break; } } else run = 0;
    }
  }
  // left and right edges measured on a row well inside the photograph
  const probe = imgTop === null ? Math.round(H * 0.75) : imgTop + 120;
  let imgL = null, imgR = null;
  for (let x = 0; x < W; x++) if (!isGround(x, probe)) { imgL = x; break; }
  for (let x = W - 1; x >= 0; x--) if (!isGround(x, probe)) { imgR = x; break; }

  /* --- corner radius: on the photograph's top-left corner, walk down from
         imgTop and record the first non-ground x per row. The radius is the
         row at which that x stops moving. ------------------------------- */
  const corner = [];
  for (let y = imgTop; y < imgTop + 60; y++) {
    let x0 = null;
    for (let x = imgL - 10; x < imgL + 80; x++) if (!isGround(x, y)) { x0 = x; break; }
    corner.push({ dy: y - imgTop, dx: x0 === null ? null : x0 - imgL });
  }
  let radius = null;
  for (const p of corner) if (radius === null && p.dx !== null && p.dx <= 0) radius = p.dy;

  /* --- the white cards. Scan for near-white runs inside the photograph. -- */
  const isCard = (x, y) => { const [r, gg, b] = at(x, y); return r > 244 && gg > 242 && b > 238; };
  const cardRect = (sx, sy) => {
    if (!isCard(sx, sy)) return null;
    let l = sx, r = sx, t = sy, bt = sy;
    while (l > 0 && isCard(l - 1, sy)) l--;
    while (r < W - 1 && isCard(r + 1, sy)) r++;
    const mid = Math.round((l + r) / 2);
    while (t > 0 && isCard(mid, t - 1)) t--;
    while (bt < H - 1 && isCard(mid, bt + 1)) bt++;
    return {
      xPct: +(l / W * 100).toFixed(2), rPct: +(r / W * 100).toFixed(2),
      wPct: +((r - l) / W * 100).toFixed(2), hPct: +((bt - t) / W * 100).toFixed(2),
      top: t, bot: bt, left: l, right: r,
    };
  };

  return {
    W, H, ground: hex(ground),
    img: {
      top: imgTop, topPct: +(imgTop / W * 100).toFixed(2),
      lPct: +(imgL / W * 100).toFixed(2),
      rPct: +(imgR / W * 100).toFixed(2),
      wPct: +((imgR - imgL) / W * 100).toFixed(2),
      radiusPx: radius, radiusPct: radius === null ? null : +(radius / W * 100).toFixed(2),
    },
    bands: {
      eyebrow: band(70, 110),
      heading: band(120, 215),
      body:    band(240, 370),
    },
    cards: {
      retail:  cardRect(Math.round(W * 0.65), Math.round(H * 0.53)),
      leisure: cardRect(Math.round(W * 0.19), Math.round(H * 0.93)),
    },
    /* the indigo pill — sampled at its centre */
    pill: (() => {
      const y = Math.round(H * 0.769), x = Math.round(W * 0.48);
      const isPill = (x, y) => { const [r, gg, b] = at(x, y); return b > 90 && b - r > 40; };
      if (!isPill(x, y)) return { note: 'probe missed', sample: hex(at(x, y)) };
      let l = x, r = x, t = y, bt = y;
      while (l > 0 && isPill(l - 1, y)) l--;
      while (r < W - 1 && isPill(r + 1, y)) r++;
      const mid = Math.round((l + r) / 2);
      while (t > 0 && isPill(mid, t - 1)) t--;
      while (bt < H - 1 && isPill(mid, bt + 1)) bt++;
      return {
        fill: hex(at(mid, Math.round((t + bt) / 2))),
        xPct: +(l / W * 100).toFixed(2), wPct: +((r - l) / W * 100).toFixed(2),
        hPct: +((bt - t) / W * 100).toFixed(2), hPx: bt - t,
      };
    })(),
  };
}, b64);

console.log(`reference ${out.W}x${out.H}   ground ${out.ground}`);
console.log(`\n--- photograph ---`);
console.log(`  left ${out.img.lPct}%   right ${out.img.rPct}%   width ${out.img.wPct}%   top ${out.img.topPct}% of W`);
console.log(`  corner radius ${out.img.radiusPx}px = ${out.img.radiusPct}% of W`);

console.log(`\n--- left column ink (all as % of frame WIDTH) ---`);
for (const [k, v] of Object.entries(out.bands)) {
  if (!v) { console.log(k.padEnd(8), 'nothing'); continue; }
  console.log(k.padEnd(8),
    `x ${String(v.xPct).padStart(5)}%  right ${String(v.rPct).padStart(5)}%  ink width ${String(v.wPct).padStart(5)}%`,
    ` height ${String(v.hPct).padStart(5)}% (${v.hPx}px)  ink ${v.ink}`);
}

console.log(`\n--- cards ---`);
for (const [k, v] of Object.entries(out.cards)) {
  if (!v) { console.log(k.padEnd(8), 'probe missed'); continue; }
  console.log(k.padEnd(8), `x ${v.xPct}%  width ${v.wPct}%  height ${v.hPct}% of W`);
}
console.log(`\n--- pill ---`);
console.log(' ', JSON.stringify(out.pill));

await browser.close();
