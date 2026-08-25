/* What size is each photograph actually PAINTED at, and what `sizes`
   attribute does that imply?

   The only input a correct srcset needs is how many device pixels the
   layout asks for. Guessing it is how a 2000px file ends up feeding a
   390px phone. This measures it at five viewports, walks the whole
   document so the pinned sections report too, and prints a ready-made
   `sizes` expression per image — as vw, so it stays true at any width.

   Run from the project root (puppeteer resolves from node_modules/).
     node measure-img-sizes.mjs            → table
     node measure-img-sizes.mjs --json     → machine-readable, for the bake

   Note the mobile column is often LARGER than the desktop one: the
   chapters and experience sections stack on a phone, so a frame that is
   420px wide on a laptop is a full-width 1050 device px on a handset.
   A ladder built from the desktop numbers alone ships a blurry phone. */
import puppeteer from 'puppeteer';
import { writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const BASE = process.env.BASE ?? 'http://localhost:3001';
const PAGES = ['/', '/menu.html', '/about.html', '/contact.html'];
/* dpr is what a real device of that width is likely to have — the ladder
   has to serve the device pixels, not the CSS pixels. */
/* Sampled densely on purpose. A clause in `sizes` governs the whole range
   between it and the previous clause, so sparse samples force a choice
   between under-serving (a soft photograph) and over-serving (the top rung
   everywhere, which is the responsive ladder not working at all). These
   sections change layout at 700, 900, 1000 and 1080, and the chapters and
   experience frames are WIDER in vw on a phone than on a laptop — so the
   curve is not monotonic and cannot be interpolated from its ends. */
const VIEWS = [
  { w: 360, h: 780, dpr: 3 },
  { w: 390, h: 844, dpr: 3 },
  { w: 480, h: 900, dpr: 2 },
  { w: 600, h: 900, dpr: 2 },
  { w: 700, h: 900, dpr: 2 },
  { w: 820, h: 1180, dpr: 2 },
  { w: 900, h: 900, dpr: 2 },
  { w: 1000, h: 800, dpr: 2 },
  { w: 1200, h: 800, dpr: 2 },
  { w: 1440, h: 900, dpr: 2 },
  { w: 1800, h: 1000, dpr: 1 },
  { w: 2560, h: 1440, dpr: 1 },
];

/* Natural dimensions come from the FILE, never from the DOM.
   `naturalWidth` is density-corrected once an <img> has a srcset — it
   reports the painted intrinsic size of whichever rung was chosen, not the
   size of the file. Read off the DOM after the responsive pass, the hero
   measured 371px and the plate measured 0, which silently collapsed every
   ladder to nothing. */
const dims = (f) => {
  if (!existsSync(f)) return null;
  const [w, h] = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height', '-of', 'csv=p=0:s=x', f]).toString().trim().split('x').map(Number);
  return { w, h };
};

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const rec = new Map();

for (const v of VIEWS) {
  const page = await browser.newPage();
  await page.setViewport({ width: v.w, height: v.h, deviceScaleFactor: v.dpr });
  for (const path of PAGES) {
    await page.goto(BASE + path, { waitUntil: 'networkidle0', timeout: 90000 });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
        window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 25));
      }
      window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, 60));
    });
    const rows = await page.evaluate(() => [...document.images].map((i) => ({
      src: (i.getAttribute('src') || i.currentSrc).replace(location.origin + '/', ''),
      w: i.getBoundingClientRect().width,
    })).filter((r) => r.w > 0));
    for (const r of rows) {
      let c = rec.get(r.src);
      if (!c) {
        const d = dims(r.src);
        if (!d) continue;
        c = { src: r.src, nw: d.w, nh: d.h, pages: new Set(), vw: {}, dev: {}, byPage: {} };
      }
      c.pages.add(path);
      /* Widest instance wins for the LADDER: one set of files serves every
         page, so the rungs must satisfy the largest use. */
      c.vw[v.w] = Math.max(c.vw[v.w] ?? 0, (r.w / v.w) * 100);
      c.dev[v.w] = Math.max(c.dev[v.w] ?? 0, Math.round(r.w * v.dpr));
      /* But `sizes` is recorded PER PAGE, because three of these files are
         used at very different sizes on different pages. hero-omakase is a
         full-viewport hero on index.html and a small framed photograph on
         menu.html: one merged `sizes` of 103.9vw made menu.html fetch — and
         preload — the 1717px rung to paint a frame a fifth that wide. */
      (c.byPage[path] ??= {})[v.w] = Math.max(c.byPage[path][v.w] ?? 0, (r.w / v.w) * 100);
      /* The LADDER needs every page's demand, not the merged maximum. The
         merged figure is what `sizes` is derived from per page, but a rung
         only exists if some page asked for roughly that width: the plate is
         1271 device px on index.html and 295 on menu.html, and a ladder
         built from merged maxima has no rung below 810, so menu.html
         fetched 178KB to paint a 295px frame. */
      (c.devAll ??= []).push(Math.round(r.w * v.dpr));
      rec.set(r.src, c);
    }
  }
  await page.close();
}
await browser.close();

/* Collapse the five measurements into the shortest honest `sizes`. Where
   consecutive viewports agree within 2vw they fold into one clause; the
   widest viewport becomes the bare default. */
function sizesFor(c) {
  const pts = VIEWS.map((v) => ({ w: v.w, vw: Math.round((c.vw[v.w] ?? 0) * 10) / 10 })).filter((p) => p.vw > 0);
  if (!pts.length) return '100vw';

  /* A clause `(max-width: W) V` governs viewports in (prev, W], so V is the
     larger of the two endpoints rather than the value measured at W. That
     is the difference between telling a 400px phone to fetch a 43.7vw file
     for a 62vw slot and telling it the truth — a soft photograph is not an
     obvious bug, it just looks like a cheap site.

     Taking a running maximum across ALL viewports would also be safe, and
     is wrong for the opposite reason: these frames are wider in vw on a
     phone than on a desktop, so the running max pins every viewport to the
     mobile share and the ladder stops doing anything. Dense sampling is
     what makes a per-range maximum tight enough to be worth having. */
  const spans = pts.map((p, i) => ({ w: p.w, vw: Math.max(p.vw, i ? pts[i - 1].vw : p.vw) }));

  const def = spans[spans.length - 1].vw;
  const out = [];
  for (let i = 0; i < spans.length - 1; i++) {
    const p = spans[i];
    if (Math.abs(p.vw - def) <= 2) continue;                                     // indistinguishable from the default
    if (out.length && Math.abs(out[out.length - 1].vw - p.vw) <= 2) { out[out.length - 1].w = p.w; continue; }
    out.push({ w: p.w, vw: p.vw });
  }
  return [...out.map((p) => `(max-width: ${p.w}px) ${p.vw}vw`), `${def}vw`].join(', ');
}

/* Two `sizes` strings are the same hint if every clause agrees within a
   vw. Below that they are measurement noise, not a difference — and noise
   is expensive here: the reserve block is transplanted BYTE-FOR-BYTE to
   three other pages, so a 62.1 on one page and a 62.2 on another turns a
   verified-identical block into drift on every future diff. */
function sameHint(a, b) {
  const nums = (t) => (t.match(/[\d.]+(?=vw|px)/g) || []).map(Number);
  const x = nums(a), y = nums(b);
  return x.length === y.length && x.every((n, i) => Math.abs(n - y[i]) <= 1);
}

const list = [...rec.values()].sort((a, b) => b.nw - a.nw).map((c) => {
  const merged = sizesFor(c);
  const sizesByPage = {};
  for (const [pg, vw] of Object.entries(c.byPage)) sizesByPage[pg] = sizesFor({ vw });
  /* Drop the per-page table entirely when every page agrees with the merged
     hint. Only the three images used at genuinely different sizes on two
     pages keep one. */
  if (Object.values(sizesByPage).every((v) => sameHint(v, merged))) {
    for (const k of Object.keys(sizesByPage)) delete sizesByPage[k];
  }
  return {
    src: c.src, nw: c.nw, nh: c.nh,
    pages: [...c.pages],
    maxDev: Math.max(...Object.values(c.dev)),
    dev: c.dev,
    devAll: [...new Set(c.devAll ?? [])].sort((a, b) => a - b),
    sizes: merged,
    sizesByPage,
  };
});

if (process.argv.includes('--json')) {
  writeFileSync('img-sizes.json', JSON.stringify(list, null, 2));
  console.log('wrote img-sizes.json');
} else {
  console.log('file'.padEnd(34), 'natural'.padEnd(10), '390'.padStart(5), '700'.padStart(5), '1000'.padStart(5), '1440'.padStart(5), '2560'.padStart(5), ' maxDev  sizes');
  console.log('-'.repeat(130));
  for (const c of list) {
    console.log(
      c.src.replace('assets/img/', '').padEnd(34),
      `${c.nw}x${c.nh}`.padEnd(10),
      ...VIEWS.map((v) => String(c.dev[v.w] ?? '-').padStart(5)),
      String(c.maxDev).padStart(6), ' ', c.sizes,
    );
  }
}
