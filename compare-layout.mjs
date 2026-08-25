/* Did anything MOVE? Records the geometry of every classed element, and
   diffs it against a saved snapshot.

     node compare-layout.mjs --save     write layout-snapshot.json from the
                                        site as it is right now
     node compare-layout.mjs            diff the live site against it

   Take a snapshot BEFORE a change, make the change, then run it again. It
   is the cheapest way to prove a refactor moved nothing, and it is what
   caught the 4.6px marquee drift the responsive images introduced.

   It used to compare against `_baseline-*.html` copies of the pre-change
   pages, and that was a trap: once those copies were tidied away the tool
   happily compared the live page against a 404 body and reported eight
   confident geometry differences. A snapshot file cannot 404 quietly.

   This is separate from compare-visual.mjs on purpose. A painted diff mixes
   two very different failures — a photograph that compresses differently
   and a photograph that is one pixel wider — and only the second one is a
   bug. Geometry answers that question on its own.

   The specific trap it exists to catch: an <img> sized `width: auto` takes
   its width from the aspect ratio of the bitmap that actually loaded, NOT
   from the width/height attributes, which only supply a ratio until then. A
   srcset rung whose height was rounded to an even number is a fraction of a
   percent off the original ratio, and in a `width: max-content` flex row of
   27 tiles those fractions add up into a visible shift. */
import puppeteer from 'puppeteer';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:3001';
const SNAP = 'layout-snapshot.json';
const SAVE = process.argv.includes('--save');
const VIEWS = [{ name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 390, height: 844 }];
const PAGES = ['index', 'menu', 'about', 'contact'];

async function geometry(browser, url, view) {
  const p = await browser.newPage();
  await p.setViewport({ width: view.width, height: view.height, deviceScaleFactor: 1 });
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await p.goto(url, { waitUntil: 'networkidle0', timeout: 90000 });
  /* Walk the page so every deferred photograph has loaded and every element
     is at its rest state, then come back to the top and measure. */
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += Math.round(innerHeight * 0.6)) {
      scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 90));
    }
    scrollTo({ top: 0, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 700));
  });
  const g = await p.evaluate(() => {
    const out = {};
    const seen = {};
    for (const el of document.querySelectorAll('[class]')) {
      const cls = (el.getAttribute('class') || '').trim().split(/\s+/)[0];
      if (!cls) continue;
      seen[cls] = (seen[cls] ?? 0) + 1;
      const r = el.getBoundingClientRect();
      out[`${cls}#${seen[cls]}`] = [Math.round(r.x * 10) / 10, Math.round(r.y * 10) / 10,
                                    Math.round(r.width * 10) / 10, Math.round(r.height * 10) / 10];
    }
    out['__doc'] = [0, 0, document.documentElement.scrollWidth, document.body.scrollHeight];
    return out;
  });
  await p.close();
  return g;
}

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'], protocolTimeout: 180000 });

const current = {};
for (const page of PAGES) {
  for (const view of VIEWS) {
    current[`${page}|${view.name}`] = await geometry(browser, `${BASE}/${page === 'index' ? '' : page + '.html'}`, view);
  }
}
await browser.close();

if (SAVE) {
  writeFileSync(SNAP, JSON.stringify(current, null, 1));
  const n = Object.values(current).reduce((a, g) => a + Object.keys(g).length, 0);
  console.log(`snapshot written to ${SNAP} — ${n} element rects across ${Object.keys(current).length} page/viewport pairs`);
  process.exit(0);
}

if (!existsSync(SNAP)) {
  console.error(`No ${SNAP}. Run \`node compare-layout.mjs --save\` before the change you want to check.`);
  process.exit(2);
}
const saved = JSON.parse(readFileSync(SNAP, 'utf8'));

let bad = 0;
for (const key of Object.keys(current)) {
  const [page, view] = key.split('|');
  const a = saved[key];
  if (!a) { console.log(`${page.padEnd(8)} ${view.padEnd(8)} not in snapshot — skipped`); continue; }
  const b = current[key];
  const diffs = [];
  for (const k of Object.keys(a)) {
    if (!(k in b)) { diffs.push([k, 'MISSING', '', Infinity]); continue; }
    const d = a[k].map((v, i) => Math.abs(v - b[k][i]));
    if (Math.max(...d) > 0.5) diffs.push([k, a[k].join(','), b[k].join(','), Math.max(...d)]);
  }
  diffs.sort((x, y) => y[3] - x[3]);
  console.log(`${page.padEnd(8)} ${view.padEnd(8)} ${diffs.length ? diffs.length + ' element(s) moved' : 'identical geometry'}`);
  for (const d of diffs.slice(0, 8)) console.log(`    ${d[0].padEnd(28)} ${d[1]}  ->  ${d[2]}   (max Δ ${d[3]})`);
  bad += diffs.length;
}
console.log(bad ? `\n${bad} geometry differences total` : '\nno element moved anywhere');
