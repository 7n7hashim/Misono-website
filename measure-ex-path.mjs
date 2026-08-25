/* Measure the experience line's geometry against the real path.

   Every --at in about.html's experience section is a fraction of the drawn
   path's length, and the whole reveal sequence hangs off them being right:
   a card whose --at is guessed from its x coordinate arrives before or
   after the stroke reaches it, and the section stops reading as one
   gesture. Estimating them is not possible by hand — the path is 17 cubic
   segments and its arc length is nowhere near linear in x, because two of
   those segments are near-vertical plunges.

   This walks the actual <path> with getPointAtLength and prints, for each
   x of interest, the fraction of the path at that x and the y there — so
   the marks can be placed ON the line rather than beside it.

   Usage, from the project root, with the server up:
     node measure-ex-path.mjs */
import puppeteer from 'puppeteer';

/* Card left edges, and where the six marks want to sit. */
const XS = [
  ['card 1 left edge', 273],
  ['dot 1',            258],
  ['ring 1',           598],
  ['card 2 left edge', 890],
  ['dot 2',            876],
  ['ring 2',          1200],
  ['card 3 left edge',1500],
  ['dot 3',           1486],
  ['ring 3',          1824],
];

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3001/about.html', { waitUntil: 'domcontentloaded' });

const rows = await page.evaluate((XS) => {
  const path = document.querySelector('.ex-line__path');
  const L = path.getTotalLength();
  const N = 4000;
  /* Sample once, then for each target x take the FIRST sample at or past
     it. First, not nearest: the path doubles back over itself in x nowhere,
     but it flattens hard between 758 and 892, and "nearest" there picks a
     point a long way along from where the stroke visibly arrives. */
  const pts = [];
  for (let i = 0; i <= N; i++) {
    const p = path.getPointAtLength((i / N) * L);
    pts.push([p.x, p.y, i / N]);
  }
  return XS.map(([name, x]) => {
    const hit = pts.find(p => p[0] >= x) || pts[pts.length - 1];
    return { name, x, at: +hit[2].toFixed(4), y: +hit[1].toFixed(1) };
  }).concat([{ name: 'total length', x: '', at: +L.toFixed(1), y: '' }]);
}, XS);

for (const r of rows) {
  console.log(
    String(r.name).padEnd(18),
    'x', String(r.x).padStart(5),
    ' --at', String(r.at).padStart(7),
    ' y on path', String(r.y).padStart(6)
  );
}

await browser.close();
