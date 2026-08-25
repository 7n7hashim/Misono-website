/* Shoot and MEASURE contact.html's hero.

   `node screenshot.mjs` cannot answer the two questions this section is
   actually judged on:

     · the numbers that matter are luminances UNDER the type — the bed has to
       be read with the heading hidden, or the letters are what you measure;
     · the parallax is a function of scroll position, and a full-page capture
       never moves the layout viewport, so it only ever shows --par 0.

   Usage, from the project root (it resolves puppeteer from node_modules/):

     node shoot-contact.mjs [width] [height] [p,p,p...]

   where each p is a scroll position through the hero — 0 is the top, 1 the
   moment the section has fully left. Defaults to 1440x900 and just 0.

   Pixels are read through the Chrome puppeteer ships, by base64-ing the shot
   back into the page and drawing it to a canvas: there is no ImageMagick and
   no canvas module on this machine, which is why every other measuring tool
   here does the same. Run it from the project root.

   LUMA IS REC.601 (0.299/0.587/0.114), matching PIL's `L` and therefore the
   bake scripts, so the file's mean and the painted mean are the same
   instrument. shoot-reserve.mjs uses relative luminance instead; on a warm
   brown frame the two differ by a few points, so do not mix the readings.

   Targets, carried from about.html's opening: it measured its reference at
   whole 39, band 47, top 21, bottom 15, and landed at 34 / 43 / 12 / 15.
*/
import puppeteer from 'puppeteer';
import { readFileSync, mkdirSync } from 'fs';

const W   = parseInt(process.argv[2] || '1440', 10);
const H   = parseInt(process.argv[3] || '900', 10);
const POS = (process.argv[4] || '0').split(',').map(Number);
const URL = 'http://localhost:3001/contact.html';
const OUT = 'temporary screenshots';

mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
await page.goto(URL, { waitUntil: 'networkidle0' });

/* Let the entrance finish. The type is over by 1.6s and the push-in by 2.2s;
   measuring earlier reads the lift plate, not the photograph. */
await new Promise(r => setTimeout(r, 2600));

/* Load a shot into the page and hand back a sampler. Every reading below goes
   through this, so every reading is of the PAINTED result — filters, blend
   modes, wash and bed composited — never of the file on disk. */
async function sampler(buf) {
  await page.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0);
    window.__s = { c, g };
  }, buf.toString('base64'));
}

const meanLuma = (x0, y0, x1, y1) => page.evaluate((a) => {
  const { c, g } = window.__s;
  const X0 = Math.max(0, Math.round(a[0])), Y0 = Math.max(0, Math.round(a[1]));
  const X1 = Math.min(c.width, Math.round(a[2])), Y1 = Math.min(c.height, Math.round(a[3]));
  if (X1 <= X0 || Y1 <= Y0) return 0;
  const d = g.getImageData(X0, Y0, X1 - X0, Y1 - Y0).data;
  let s = 0;
  for (let i = 0; i < d.length; i += 4) s += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
  return +(s / (d.length / 4)).toFixed(1);
}, [x0, y0, x1, y1]);

console.log(`\n  contact.html hero — ${W}x${H}   (luma = Rec.601, as in the bakes)\n`);

for (const p of POS) {
  /* Scroll by rect and instantly — the two traps the reserve tooling records.
     .hero is position: relative, so offsetTop is not a document coordinate;
     and a page with scroll-behavior set is still easing when the shutter
     fires. With nothing below the hero the document may not scroll at all,
     which is exactly why --par is printed rather than assumed. */
  await page.evaluate(pp => {
    const hero = document.querySelector('.hero');
    const y = hero.getBoundingClientRect().top + window.scrollY + hero.offsetHeight * pp;
    window.scrollTo({ top: y, behavior: 'instant' });
  }, p);
  await new Promise(r => setTimeout(r, 120));

  const par = await page.evaluate(() =>
    getComputedStyle(document.querySelector('.hero')).getPropertyValue('--par').trim() || '(unset)');

  const file = `${OUT}/contact-${W}x${H}-p${p}.png`;
  await page.screenshot({ path: file });

  /* Now again with the type hidden — this is the one that gets measured. */
  await page.evaluate(() => { document.querySelector('.hero__type').style.visibility = 'hidden'; });
  const bareBuf = await page.screenshot();
  await page.evaluate(() => { document.querySelector('.hero__type').style.visibility = ''; });

  await sampler(bareBuf);
  const whole  = await meanLuma(0, 0, W, H);
  const band   = await meanLuma(W * 0.25, H * 0.38, W * 0.75, H * 0.64);
  const top    = await meanLuma(0, 0, W, 60);
  const bottom = await meanLuma(0, H - 60, W, H);
  const tl     = await meanLuma(0, 0, W * 0.10, H * 0.15);   // the pendant

  console.log(`  p ${String(p).padEnd(4)} --par ${String(par).padEnd(8)}` +
    `whole ${String(whole).padStart(5)}  band ${String(band).padStart(5)}  ` +
    `top ${String(top).padStart(5)}  bottom ${String(bottom).padStart(5)}  ` +
    `pendant ${String(tl).padStart(5)}`);

  if (p !== POS[0]) continue;

  /* Ink extents of the heading, by scanning pixels rather than trusting a
     font metric: about.html's opening records that Cormorant's metric ascent
     reads 1.769% for type that measures 1.875% on screen. */
  await sampler(readFileSync(file));
  const ink = await page.evaluate(() => {
    const { c, g } = window.__s;
    const r = document.querySelector('.hero__title').getBoundingClientRect();
    const X0 = Math.max(0, Math.floor(r.x)), Y0 = Math.max(0, Math.floor(r.y));
    const X1 = Math.min(c.width, Math.ceil(r.right)), Y1 = Math.min(c.height, Math.ceil(r.bottom));
    const d = g.getImageData(X0, Y0, X1 - X0, Y1 - Y0).data;
    const w = X1 - X0;
    /* 150 sits well above the bed and well below the type's core, so it finds
       the letterform rather than its glow. */
    let minX = 1e9, maxX = -1, minY = 1e9, maxY = -1;
    for (let i = 0; i < d.length; i += 4) {
      if (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2] <= 150) continue;
      const px = (i / 4) % w, py = ((i / 4) / w) | 0;
      if (px < minX) minX = px; if (px > maxX) maxX = px;
      if (py < minY) minY = py; if (py > maxY) maxY = py;
    }
    return { w: maxX - minX, h: maxY - minY, lines: r.height };
  });
  console.log(`         ink ${(ink.w / W * 100).toFixed(1)}% of width  (about.html reference 49.5%)` +
              `   cap ${(ink.h / W * 100).toFixed(3)}%  (reference 1.877%, single line)`);

  /* The eyebrow's colour against what is actually behind it. --res-hair is
     documented decorative-only, so setting type in it is a new role and has
     to be measured rather than assumed. */
  await sampler(bareBuf);
  const eb = await page.evaluate(() => {
    const e = document.querySelector('.hero__eyebrow');
    const r = e.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height, color: getComputedStyle(e).color };
  });
  const bed = await meanLuma(eb.x, eb.y, eb.x + eb.w, eb.y + eb.h);
  const contrast = await page.evaluate((a) => {
    const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
    const rel = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const m = a[0].match(/\d+/g).map(Number);
    const L1 = rel(m[0], m[1], m[2]), L2 = rel(a[1], a[1], a[1]);
    return +(((Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)).toFixed(2));
  }, [eb.color, bed]);
  const px = await page.evaluate(() =>
    getComputedStyle(document.querySelector('.hero__eyebrow')).fontSize);
  console.log(`         eyebrow ${eb.color} at ${px} on bed ${bed}/255 = ${contrast}:1` +
              `   (AA small text needs 4.5:1)`);
}

/* ------------------------------------------------------- parallax self-test

   The page is one viewport tall, so the document does not scroll and --par is
   pinned at 0 — every position above reports the same frame, correctly. That
   means the parallax cannot be OBSERVED on the page as it currently stands,
   and an unobservable mechanism is an unverified one.

   So drive it directly: append a spacer, scroll for real, and read back both
   the number the loop wrote and the transform the CSS derived from it. The
   spacer is removed afterwards; it exists only inside this measurement. */
const par = await page.evaluate(async () => {
  const wait = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  const spacer = document.createElement('div');
  spacer.style.height = '200vh';
  document.body.appendChild(spacer);

  const hero = document.querySelector('.hero');
  const media = document.querySelector('.hero__media');
  const rows = [];
  for (const p of [0, 0.25, 0.5, 0.75, 1]) {
    window.scrollTo({ top: hero.offsetHeight * p, behavior: 'instant' });
    await wait();
    const t = getComputedStyle(media).transform;
    /* matrix(a,b,c,d,tx,ty) — ty is the only thing this should ever move. */
    const ty = t === 'none' ? 0 : parseFloat(t.split(',')[5]);
    rows.push({
      p,
      par: getComputedStyle(hero).getPropertyValue('--par').trim(),
      ty: +ty.toFixed(1),
    });
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
  spacer.remove();
  await wait();
  return rows;
});

console.log('\n  parallax self-test (spacer appended, then removed — not the shipped page)');
for (const r of par) {
  console.log(`    scrolled ${String(r.p).padEnd(5)} --par ${r.par.padEnd(8)} media translateY ${String(r.ty).padStart(7)}px`);
}
const travel = Math.abs(par[par.length - 1].ty - par[0].ty);
console.log(`    total travel ${travel.toFixed(1)}px over one viewport ` +
            `(--par-travel is 12svh = ${(H * 0.12).toFixed(1)}px)`);

await browser.close();
console.log('');
