/* Capture the pinned chapter section at a set of scroll positions.

   screenshot.mjs cannot do this. It captures full-page with
   captureBeyondViewport, which never moves the layout viewport, so the
   section's observer never fires, --d is never written past its initial
   value, and the frame shoots empty. This scrolls for real, waits for the
   rAF loop to settle, and shoots the viewport.

   Usage, from the project root:
     node shoot-chapters.mjs [width] [height] [p,p,p...]

   Each p is a position through the pin: 0 is the moment it sticks, 1 the
   moment it lets go. Files land in `temporary screenshots/`. */
import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';

const W = +(process.argv[2] || 1440);
const H = +(process.argv[3] || 900);
const PS = (process.argv[4] || '0,0.14,0.30,0.52,0.75,0.95')
  .split(',').map(Number);

const OUT = 'temporary screenshots';
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
await page.goto('http://localhost:3001/about.html', { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts && document.fonts.ready);

for (const p of PS) {
  await page.evaluate((p) => {
    const s = document.querySelector('.chapters');
    const travel = s.offsetHeight - innerHeight;
    window.scrollTo(0, s.offsetTop + travel * p);
  }, p);
  // Two rAFs for the loop to read the new rect and write --d, then a beat
  // for the compositor.
  await page.evaluate(() => new Promise(r =>
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 120)))));

  const tag = String(p).replace('.', 'p');
  const file = `${OUT}/chapters-${W}x${H}-p${tag}.png`;
  await page.screenshot({ path: file });

  const state = await page.evaluate(() => ({
    d: [...document.querySelectorAll('.ch-panel')]
         .map(e => +e.style.getPropertyValue('--d')),
    op: [...document.querySelectorAll('.ch-panel')]
         .map(e => +getComputedStyle(e).opacity.slice(0, 4))
  }));
  console.log(`p=${p}  d=[${state.d}]  opacity=[${state.op}]  -> ${file}`);
}

await browser.close();
