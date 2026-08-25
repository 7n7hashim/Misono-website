/* Pull full-res Pexels frames.
   Pexels blocks curl, and images.pexels.com blocks cross-origin fetch from
   pexels.com — the way that works is puppeteer navigating straight at the
   image URL and taking response.buffer(). Chrome sends an Accept header that
   the CDN honours, so what lands is AVIF whatever the .jpeg says; the caller
   runs `sips -s format jpeg` over the results. */
import puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';

const OUT = process.argv[2];
const IDS = process.argv.slice(3);

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();

for (const id of IDS) {
  const url = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&h=1800`;
  try {
    const res = await page.goto(url, { waitUntil: 'networkidle0', timeout: 45000 });
    const buf = await res.buffer();
    writeFileSync(`${OUT}/raw-${id}.bin`, buf);
    console.log(id, res.status(), buf.length, res.headers()['content-type']);
  } catch (e) {
    console.log(id, 'FAILED', e.message);
  }
}

await browser.close();
