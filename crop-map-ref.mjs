/* Crop and magnify regions of `assets/img/map inspo.png` so a boundary can be
   settled BY EYE rather than by a pixel scan. The scan in measure-map-ref.mjs
   reports the photograph's left edge 0.83% of the width outside the text
   margin and returns null for the corner radius — both are the failure mode
   recorded in MEMORY.md: a scan of a soft boundary looks right and is not.

   node crop-map-ref.mjs
   -> writes into `temporary screenshots/`
*/
import puppeteer from 'puppeteer';
import { readFileSync, writeFileSync } from 'node:fs';

const b64 = readFileSync('assets/img/map inspo.png').toString('base64');

const regions = [
  { name: 'corner-tl', x: 140, y: 420, w: 130, h: 130, zoom: 6 },
  { name: 'corner-tr', x: 1830, y: 420, w: 130, h: 130, zoom: 6 },
  { name: 'card-retail', x: 1160, y: 500, w: 320, h: 175, zoom: 3 },
  { name: 'pill', x: 860, y: 800, w: 200, h: 80, zoom: 5 },
  { name: 'dot', x: 1280, y: 630, w: 90, h: 80, zoom: 8 },
  { name: 'eyebrow', x: 170, y: 70, w: 220, h: 40, zoom: 5 },
];

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setContent('<canvas id="c"></canvas>');

for (const r of regions) {
  const data = await page.evaluate(async (b64, r) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = document.getElementById('c');
    c.width = r.w * r.zoom; c.height = r.h * r.zoom;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;          // nearest-neighbour: show the pixels
    g.drawImage(img, r.x, r.y, r.w, r.h, 0, 0, c.width, c.height);
    return c.toDataURL('image/png');
  }, b64, r);

  writeFileSync(`temporary screenshots/ref-${r.name}.png`,
    Buffer.from(data.split(',')[1], 'base64'));
  console.log(`ref-${r.name}.png  ${r.w}x${r.h} at ${r.zoom}x  (source origin ${r.x},${r.y})`);
}

await browser.close();
