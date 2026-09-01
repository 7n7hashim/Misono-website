/* Shoot and MEASURE index.html's hero as a PORTRAIT crop.

   `node screenshot.mjs` cannot answer what this crop is judged on. Two
   reasons, and the second is the one that matters:

     · the numbers are luminances UNDER the type, so the wordmark, the
       tagline and the mon have to be hidden before the bed is sampled, or
       the letters are what gets measured;
     · on a portrait phone `object-fit: cover` scales this 1.874:1 frame to
       the viewport's HEIGHT, so the vertical half of object-position does
       NOTHING and the visible slice is about a quarter of the source's
       width. Which quarter is the whole design decision, and it cannot be
       read off a full-page PNG.

   Usage, from the project root (it resolves puppeteer from node_modules/):

     node shoot-hero-mobile.mjs [width] [height] [pos,pos,...]

   where each pos is an object-position, either `44%` (x only) or `44% 56%`.
   Defaults to 390x844 and whatever the stylesheet already says.

   SCALE=1.065 pins the drift at its far end instead of its near one. The
   drift is a 3.4% zoom over 42s, so the crop MOVES while the page sits
   there: a bed solved at 1.03 alone is solved for half the animation.

   Prints, per candidate: the visible window as a share of the SOURCE width
   (transform zoom included), the painted mean luma of each type element's
   bed, and the WCAG contrast of that bed against the ink actually set on it.

   Pixels are read through the Chrome puppeteer ships, by base64-ing the shot
   back into the page and drawing it to a canvas — there is no ImageMagick
   and no canvas module here, which is why every measuring tool in this
   project does the same. Run it from the project root.

   LUMA IS REC.601 (0.299/0.587/0.114), matching the bake scripts, so a
   painted mean and a file mean are the same instrument. CONTRAST is WCAG
   relative luminance, which is a different instrument — do not mix them.
*/
import puppeteer from 'puppeteer';
import { mkdirSync, writeFileSync } from 'fs';

const W    = parseInt(process.argv[2] || '390', 10);
const H    = parseInt(process.argv[3] || '844', 10);
const CAND = (process.argv[4] || '').split(',').map(s => s.trim()).filter(Boolean);
const PORT = process.env.PORT || '3000';
const URL  = `http://localhost:${PORT}/index.html`;
const OUT  = 'temporary screenshots';

mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 });
await page.goto(URL, { waitUntil: 'networkidle0' });

/* Pin the drift. It runs 42s alternate, so an unpinned capture measures a
   different zoom every time and two candidates are not comparable. */
await page.addStyleTag({ content: `
  .hero__img { animation: none !important; transform: scale(${process.env.SCALE || '1.03'}) !important; }
  .hero__mark, .hero__brand > * { animation: none !important; opacity: 1 !important; transform: none !important; }
` });
/* EXTRA_CSS lets a bed or a wash be tried without editing the page, so a
   candidate position and the bed solved for it can be measured in one run. */
if (process.env.EXTRA_CSS) await page.addStyleTag({ content: process.env.EXTRA_CSS });
await new Promise(r => setTimeout(r, 400));

async function sampler(buf) {
  await page.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0);
    window.__s = { c, g, dpr: img.naturalWidth / window.innerWidth };
  }, Buffer.from(buf).toString('base64'));
}

/* Both instruments in one pass, over CSS-pixel coordinates. */
const read = (x0, y0, x1, y1) => page.evaluate((a) => {
  const { c, g, dpr } = window.__s;
  const X0 = Math.max(0, Math.round(a[0] * dpr)), Y0 = Math.max(0, Math.round(a[1] * dpr));
  const X1 = Math.min(c.width, Math.round(a[2] * dpr)), Y1 = Math.min(c.height, Math.round(a[3] * dpr));
  if (X1 <= X0 || Y1 <= Y0) return null;
  const d = g.getImageData(X0, Y0, X1 - X0, Y1 - Y0).data;
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  let luma = 0, r = 0, gg = 0, b = 0, n = d.length / 4, peak = 0;
  for (let i = 0; i < d.length; i += 4) {
    const L = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    luma += L; if (L > peak) peak = L;
    r += lin(d[i]); gg += lin(d[i + 1]); b += lin(d[i + 2]);
  }
  const rl  = 0.2126 * (r / n) + 0.7152 * (gg / n) + 0.0722 * (b / n);
  /* Worst case matters more than the mean on a photograph: a wordmark can
     average 6:1 and still cross a spotlit stone at 2.5:1. */
  /* The mean hides a hot end. Tile the rect and keep the brightest tile's
     own relative luminance: a wordmark can average 8:1 and still cross a
     lit cup at 3:1, and that is the number a reader sees. */
  const T = Math.round(12 * dpr);
  let worst = 0, wx = 0, wy = 0;
  for (let ty = Y0; ty < Y1; ty += T) for (let tx = X0; tx < X1; tx += T) {
    const w = Math.min(T, X1 - tx), h = Math.min(T, Y1 - ty);
    if (w < 4 || h < 4) continue;
    const t = g.getImageData(tx, ty, w, h).data;
    let tr = 0, tg = 0, tb = 0, m = t.length / 4;
    for (let i = 0; i < t.length; i += 4) { tr += lin(t[i]); tg += lin(t[i + 1]); tb += lin(t[i + 2]); }
    const trl = 0.2126 * (tr / m) + 0.7152 * (tg / m) + 0.0722 * (tb / m);
    if (trl > worst) { worst = trl; wx = tx / dpr; wy = ty / dpr; }
  }
  return { luma: +(luma / n).toFixed(1), peak: +peak.toFixed(0), rl, worst, wx: +wx.toFixed(0), wy: +wy.toFixed(0) };
}, [x0, y0, x1, y1]);

const ratio = (rl, ink) => {
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const li = 0.2126 * lin(ink[0]) + 0.7152 * lin(ink[1]) + 0.0722 * lin(ink[2]);
  const [a, b] = li > rl ? [li, rl] : [rl, li];
  return +((a + 0.05) / (b + 0.05)).toFixed(2);
};

/* The source window. Cover scales by the larger ratio; the transform then
   zooms about the box centre, so the slice narrows by 1/zoom. */
const geom = () => page.evaluate(() => {
  const el = document.querySelector('.hero__img');
  const cs = getComputedStyle(el);
  const r  = el.getBoundingClientRect();
  /* naturalWidth is density-corrected once an <img> has a srcset, so it is
     no use as a file identity — but the RATIO survives the correction, and
     the ratio is all the window needs. */
  const iw = el.naturalWidth, ih = el.naturalHeight;
  const s  = Math.max(r.width / iw, r.height / ih);
  const visW = Math.min(1, r.width  / (iw * s));
  const visH = Math.min(1, r.height / (ih * s));
  const m = cs.transform.match(/matrix\(([-\d.]+)/);
  const zoom = m ? parseFloat(m[1]) : 1;
  const px = parseFloat(cs.objectPosition) / 100;
  const parts = cs.objectPosition.split(' ');
  const py = parseFloat(parts[1] ?? parts[0]) / 100;
  const win = (vis, p) => {
    const l = p * (1 - vis), c = l + vis / 2, h = vis / 2 / zoom;
    return [c - h, c + h];
  };
  return { objectPosition: cs.objectPosition, zoom,
           x: win(visW, px), y: win(visH, py), box: [r.width, r.height] };
});

/* Where the type actually is, in CSS px. */
const rects = () => page.evaluate(() => {
  const g = (sel) => { const e = document.querySelector(sel); if (!e) return null;
    const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; };
  return { name: g('.hero__name'), tagline: g('.hero__tagline'),
           social: g('.hero__social'), mark: g('.hero__mark') };
});

const pct = (v) => (v * 100).toFixed(1) + '%';
const list = CAND.length ? CAND : [null];

console.log(`\n  index.html hero — PORTRAIT ${W}x${H}   (luma Rec.601 · contrast WCAG)\n`);

for (const pos of list) {
  /* A candidate is `object-position` or `object-position|brand-top`, so the
     crop and the type's place in it can be judged as one decision — they are
     one decision. */
  const [op, brandTop] = (pos || '').split('|').map(s => s && s.trim());
  if (op) await page.evaluate((p) => {
    document.querySelector('.hero__img').style.objectPosition = p;
  }, op);
  if (brandTop) await page.evaluate((t) => {
    document.querySelector('.hero__brand').style.top = t;
  }, brandTop);
  await new Promise(r => setTimeout(r, 120));

  const G = await geom();
  const R = await rects();

  /* Hide the type and shoot the bed. Sampling with the type in place
     measures the letters, which are white, and reports every crop as fine. */
  /* Hide the TYPE, not the block. `.hero__brand` carries the bed on its own
     ::before, and hiding the element takes the pseudo-element with it — so a
     run that hides the block measures the photograph and the wash alone and
     reports every bed as if it were not there. The numbers come out
     pessimistic, which is the direction that hides the mistake. */
  const HIDE = ['.hero__mark', '.hero__name', '.hero__tagline', '.hero__social'];
  await page.evaluate((sels) => {
    for (const s of sels) document.querySelector(s).style.visibility = 'hidden';
  }, HIDE);
  await new Promise(r => setTimeout(r, 80));
  await sampler(await page.screenshot({ type: 'png' }));
  await page.evaluate((sels) => {
    for (const s of sels) document.querySelector(s).style.visibility = '';
  }, HIDE);

  const tag = (pos || 'stylesheet').replace(/[^\w]/g, '');
  const file = `${OUT}/hero-m-${W}x${H}-${tag}.png`;
  await new Promise(r => setTimeout(r, 80));
  writeFileSync(file, await page.screenshot({ type: 'png' }));

  console.log(`  object-position ${G.objectPosition}  (zoom ${G.zoom})`);
  console.log(`    source window   x ${pct(G.x[0])} → ${pct(G.x[1])}   (${pct(G.x[1] - G.x[0])} of the frame)`);
  console.log(`                    y ${pct(G.y[0])} → ${pct(G.y[1])}   (${pct(G.y[1] - G.y[0])} of the frame)`);
  for (const [k, r] of Object.entries(R)) {
    if (!r) continue;
    const m = await read(r[0], r[1], r[2], r[3]);
    if (!m) continue;
    const ink = k === 'tagline' ? [204, 204, 204] : [255, 255, 255]; // tagline is white at .80
    console.log(`    ${k.padEnd(8)} bed luma ${String(m.luma).padStart(5)}  peak ${String(m.peak).padStart(3)}` +
                `   contrast ${String(ratio(m.rl, ink)).padStart(5)}:1` +
                `   worst 12px tile ${String(ratio(m.worst, ink)).padStart(5)}:1 at ${m.wx},${m.wy}`);
  }
  console.log(`    → ${file}\n`);
}

await browser.close();
