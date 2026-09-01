/* Bakes the site icon set from the Li's mark.

   Reproduce:  node bake-favicons.mjs

   Two DIFFERENT drawings, which is the whole point of the script rather
   than a single file scaled down:

   - The SMALL mark (favicon.svg, favicon-16.png, favicon-32.png) is the full mark
     reduced to its two structural elements — the red ring and the crossed
     chopsticks. The lettering is dropped. Rendered at 16px the full mark
     collapses into a red blob with dark streaks through it: the ring's
     stroke lands at 1.1px, the `Li's` wedges at well under a pixel, and
     the three elements merge. So the small drawing thickens the ring to
     13/100 (2.1px at 16), moves the chopsticks fully inside the frame,
     and pulls the ring right so the two never overlap into mush.

     The chopsticks stay LEFT of the ring's centre, as they are in the real
     mark. Centring them reads as a prohibition sign — a circle with a line
     through it — which is the one thing this icon must not look like.

   - The LARGE mark (apple-touch-icon, 192, 512) is the full artwork,
     lettering and all, inset to 78% of the tile. iOS and Android both mask
     these to a rounded shape or a circle, and the mark's own ring spans
     92% of its viewBox, so uninset it loses its edges to the mask.

   Both sit on an OPAQUE ivory ground (--ground #F6EEE1). The mark's
   chopsticks are #1B191A: on a transparent icon they disappear against a
   dark browser tab, and the ivory is what keeps every element in the
   colour role the palette documents.

   PNG encoding goes through the Chrome puppeteer already ships, the same
   route bake-png-to-webp.mjs uses — there is no ImageMagick on this
   machine and `sips` cannot render SVG. */
import puppeteer from 'puppeteer';
import { writeFileSync, readFileSync, statSync } from 'node:fs';

const GROUND = '#F6EEE1';   /* --ground, the site's warm ivory */
const RED    = '#CD393E';   /* --brand-red, measured off the official logo */
const INK    = '#1B191A';   /* the logo's black */

/* ------------------------------------------------------------ the drawings */

const SMALL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100" role="img" aria-label="Li's Chinese Restaurant">
<title>Li's Chinese Restaurant</title>
<rect width="100" height="100" fill="${GROUND}"/>
<g fill="${INK}">
<path d="M17,10 L25,10 L40,90 L33,90 Z"/>
<path d="M32,10 L40,10 L38,90 L32,90 Z"/>
</g>
<circle cx="60" cy="50" r="29" fill="none" stroke="${RED}" stroke-width="13"/>
</svg>`;

/* The full mark, lifted from brand_assets/lis-mark.svg and inset. Its own
   <title>/<desc> are dropped — an icon carries no accessible name of its
   own — and the paths are untouched. */
const markBody = readFileSync('brand_assets/lis-mark.svg', 'utf8')
  .replace(/<\?xml[\s\S]*?\?>/, '')
  .replace(/<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '')
  .replace(/<title>[\s\S]*?<\/title>/, '')
  .replace(/<desc>[\s\S]*?<\/desc>/, '')
  .trim();

const INSET = 0.78;
const off = (100 - 100 * INSET) / 2;
const LARGE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
<rect width="100" height="100" fill="${GROUND}"/>
<g transform="translate(${off} ${off}) scale(${INSET})">
${markBody}
</g>
</svg>`;

/* ------------------------------------------------------------------ render */

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();

async function png(svg, size, out) {
  const enc = Buffer.from(svg, 'utf8').toString('base64');
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent(
    `<body style="margin:0"><img src="data:image/svg+xml;base64,${enc}" width="${size}" height="${size}"></body>`,
  );
  await page.evaluate(() => document.images[0].decode());
  /* page.screenshot returns a Uint8Array, and Uint8Array.toString('base64')
     ignores its argument — wrap it before anything treats it as bytes. */
  writeFileSync(out, Buffer.from(await page.screenshot({ omitBackground: false })));
  return statSync(out).size;
}

writeFileSync('assets/favicon.svg', SMALL + '\n');
console.log(`assets/favicon.svg           ${statSync('assets/favicon.svg').size}B  (small mark, scalable)`);

for (const [size, out, svg, note] of [
  [16,  'assets/favicon-16.png',       SMALL, 'small mark'],
  [32,  'assets/favicon-32.png',       SMALL, 'small mark'],
  [180, 'assets/apple-touch-icon.png', LARGE, 'full mark, 78% inset'],
  [192, 'assets/icon-192.png',         LARGE, 'full mark, 78% inset'],
  [512, 'assets/icon-512.png',         LARGE, 'full mark, 78% inset'],
]) {
  const bytes = await png(svg, size, out);
  console.log(`${out.padEnd(29)}${String(bytes).padStart(6)}B  ${size}x${size}  ${note}`);
}

await browser.close();
