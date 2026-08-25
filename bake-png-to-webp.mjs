// Encode a PNG to WebP with alpha, using the Chrome that puppeteer already
// ships. There is no cwebp on this machine and sips reads webp but cannot
// write it, so the browser's own encoder is the tool on hand.
import fs from 'node:fs';
import puppeteer from 'puppeteer';

const [src, dst, qArg] = process.argv.slice(2);
const q = Number(qArg ?? 0.9);
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
  const url = c.toDataURL('image/webp', q);
  return { url, w: c.width, h: c.height };
}, b64, q);
await browser.close();

if (!out.url.startsWith('data:image/webp')) {
  console.error('Chrome did not produce webp:', out.url.slice(0, 30));
  process.exit(1);
}
fs.writeFileSync(dst, Buffer.from(out.url.split(',')[1], 'base64'));
console.log(`wrote ${dst}  ${out.w}x${out.h}  ${fs.statSync(dst).size} bytes  q=${q}`);
