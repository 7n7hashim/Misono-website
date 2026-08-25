// Encode a PNG to JPEG through the Chrome that puppeteer already ships.
// `sips -s format jpeg` also works, but a canvas re-encode at the same
// nominal quality ran about half the file size on about-plate.jpg — the
// difference is the encoder, not the setting. Sibling of bake-png-to-webp.mjs;
// must be run from the project root, since it resolves puppeteer from
// node_modules/.
import fs from 'node:fs';
import puppeteer from 'puppeteer';

const [src, dst, qArg] = process.argv.slice(2);
const q = Number(qArg ?? 0.86);
const b64 = fs.readFileSync(src).toString('base64');

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
const out = await page.evaluate(async (b64, q) => {
  const img = new Image();
  img.src = 'data:image/png;base64,' + b64;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return { url: c.toDataURL('image/jpeg', q), w: c.width, h: c.height };
}, b64, q);
await browser.close();

if (!out.url.startsWith('data:image/jpeg')) {
  console.error('Chrome did not produce jpeg:', out.url.slice(0, 30));
  process.exit(1);
}
fs.writeFileSync(dst, Buffer.from(out.url.split(',')[1], 'base64'));
console.log(`wrote ${dst}  ${out.w}x${out.h}  ${fs.statSync(dst).size} bytes  q=${q}`);
