/* Capture the reservation section and print what it actually measures.

   screenshot.mjs shoots full-page, so the section lands three viewports down a
   tall PNG and the one thing that matters — whether the block fits a screen —
   cannot be read off it at all. This scrolls the section to the top of the
   viewport, shoots the viewport, and prints the measurements the comp is
   matched against, so a type-size miss can be told from a layout one without
   opening the image.

   Usage, from the project root:
     node shoot-reserve.mjs [page] [width] [height]
     node shoot-reserve.mjs index 1440 900
     node shoot-reserve.mjs about 1512 820
     node shoot-reserve.mjs menu mobile

   `mobile` and `tablet` are accepted in place of width/height. */
import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';

const PRESET = { mobile: [390, 844], tablet: [820, 1180], desktop: [1440, 900] };
const PAGE = process.argv[2] || 'index';
const a3 = process.argv[3];
const [W, H] = PRESET[a3] ?? [+(a3 || 1440), +(process.argv[4] || 900)];

const OUT = 'temporary screenshots';
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
await page.goto(`http://localhost:3001/${PAGE}.html`, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts && document.fonts.ready);

/* Not offsetTop: `.reserve` is `position: relative`, so its offsetParent is
   whatever positioned ancestor it sits in and the value is not a document
   coordinate. That lands the capture on whichever section happens to be that
   far down the page instead. */
/* `behavior: 'instant'` is not optional: the page sets `scroll-behavior: smooth`
   on <html>, so a plain scrollTo animates and the capture lands wherever the
   easing has got to. */
await page.evaluate(() => {
  const s = document.querySelector('.reserve');
  window.scrollTo({ top: s.getBoundingClientRect().top + window.scrollY, behavior: 'instant' });
});
await page.evaluate(() => new Promise(r =>
  requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 150)))));

const file = `${OUT}/res-${PAGE}-${W}x${H}.png`;
await page.screenshot({ path: file });

const m = await page.evaluate(() => {
  const s = document.querySelector('.reserve');
  const sw = s.getBoundingClientRect().width;
  const pc = n => +(n / sw * 100).toFixed(2);

  /* Ink width of a text node, not its box: the box is the column, and the comp
     is matched on the letters. A Range gives the drawn extent. */
  const ink = (el, which = 0) => {
    const r = document.createRange();
    const node = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim())[which];
    if (!node) return null;
    r.selectNodeContents(node);
    const b = r.getBoundingClientRect();
    return { w: pc(b.width), left: pc(b.left - s.getBoundingClientRect().left) };
  };

  const title = document.querySelector('.reserve__title');
  const copy = document.querySelector('.reserve__copy');
  const cr = copy.getBoundingClientRect(), sr = s.getBoundingClientRect();

  /* Rightmost ink in the left column — nothing may cross the photograph's
     leftmost bulge at 43.88% of the section. */
  let right = 0;
  for (const el of copy.querySelectorAll('*')) {
    const b = el.getBoundingClientRect();
    if (b.width && b.right > right) right = b.right;
  }

  /* Whether anything is silently clipped by the section's `overflow: hidden`.
     Measured on the copy column only: the photograph is *supposed* to overrun
     its box — it drifts inside a mask that is holding still, so `scrollHeight`
     always reads a few pixels over and says nothing about whether type is
     being lost. */
  const copyClipped = cr.top < sr.top - 0.5 || cr.bottom > sr.bottom + 0.5;

  return {
    section: { w: Math.round(sr.width), h: Math.round(sr.height), vh: innerHeight,
               fits: sr.height <= innerHeight + 1 },
    clipped: copyClipped,
    u: getComputedStyle(s).getPropertyValue('--u').trim() || '(mobile branch)',
    titleLine1: ink(title, 0),
    titleLine2: ink(title, 1),
    columnLeft: pc(cr.left - sr.left),
    columnInkRight: pc(right - sr.left),
    columnTop: pc(cr.top - sr.top) + '% of width',
    columnHeightPctOfVh: +(cr.height / innerHeight * 100).toFixed(1),
    titlePx: getComputedStyle(title).fontSize,
  };
});

/* Mean luminance of the photograph as painted, filter and all — not of the
   file on disk. The section is graded in CSS rather than re-baked, so the file's
   own level says nothing about what lands on the peach. The sample box sits
   inside the clip at every height: the curve never reaches right of 63.61%. */
const level = await page.evaluate(async (png) => {
  const img = new Image(); img.src = 'data:image/png;base64,' + png; await img.decode();
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0);
  const x0 = Math.round(c.width * 0.70), x1 = Math.round(c.width * 0.98);
  const y0 = Math.round(c.height * 0.15), y1 = Math.round(c.height * 0.85);
  const d = g.getImageData(x0, y0, x1 - x0, y1 - y0).data;
  let s = 0;
  for (let i = 0; i < d.length; i += 4) s += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
  return +(s / (d.length / 4)).toFixed(1);
}, (await import('node:fs')).readFileSync(file).toString('base64'));

console.log(`\n${PAGE}.html  ${W}x${H}   -> ${file}`);
console.log(`  --u                 ${m.u}`);
console.log(`  section             ${m.section.w}x${m.section.h}  viewport ${m.section.vh}` +
            `   fits: ${m.section.fits ? 'yes' : 'NO'}   clipped: ${m.clipped ? 'YES' : 'no'}`);
console.log(`  column              left ${m.columnLeft}%   box ends ${m.columnInkRight}%` +
            `   (photo bulge is 43.88%)   height ${m.columnHeightPctOfVh}% of vh`);
console.log(`  RESERVE             ${m.titleLine1?.w}% of width   (comp 20.51%)`);
console.log(`  YOUR TABLE          ${m.titleLine2?.w}% of width   (comp 29.56%)   font ${m.titlePx}`);
console.log(`  photograph level    ${level} of 255   (file is 62; the site's bands are 62-84, 90-108, 64-80)`);

await browser.close();
