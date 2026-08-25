/* Capture the pinned experience section at a set of scroll positions.

   screenshot.mjs cannot do this, for the same two reasons shoot-chapters.mjs
   exists: it captures full-page with captureBeyondViewport, which never
   moves the layout viewport, so the observer never fires; and the section is
   2.4 viewports tall and its state is a function of where you are inside it.

   Usage, from the project root:
     node shoot-experience.mjs [width] [height] [p,p,p...]

   Each p is a position through the pin: 0 is the moment it sticks, 1 the
   moment it lets go. Files land in `temporary screenshots/`, and --draw is
   printed beside each so a timing bug can be told from a layout one. */
import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';

const W = +(process.argv[2] || 1440);
const H = +(process.argv[3] || 900);
const PS = (process.argv[4] || '0,0.2,0.4,0.6,0.8,1').split(',').map(Number);

const OUT = 'temporary screenshots';
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
await page.goto('http://localhost:3001/about.html', { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts && document.fonts.ready);

for (const p of PS) {
  await page.evaluate((p) => {
    const s = document.querySelector('.experience');
    const travel = s.offsetHeight - innerHeight;
    window.scrollTo(0, s.offsetTop + travel * p);
  }, p);
  await page.evaluate(() => new Promise(r =>
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 120)))));

  const tag = String(p).replace('.', 'p');
  const file = `${OUT}/exp-${W}x${H}-p${tag}.png`;
  await page.screenshot({ path: file });

  const state = await page.evaluate(() => {
    const s = document.querySelector('.experience');
    return {
      draw: s.style.getPropertyValue('--draw'),
      frames: [...document.querySelectorAll('.ex-card__frame')]
        .map(e => +getComputedStyle(e).opacity.slice(0, 4)),
      caps: [...document.querySelectorAll('.ex-card__cap')]
        .map(e => +getComputedStyle(e).opacity.slice(0, 4)),
    };
  });
  console.log(`p=${p}  draw=${state.draw}  frames=[${state.frames}]  caps=[${state.caps}]  -> ${file}`);
}

await browser.close();
