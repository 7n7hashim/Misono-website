/* Per-photograph acceptance test, and the one that actually answers the
   question "did the picture get worse".

   For every image on every page, at the device pixel counts real phones and
   laptops ask for, this renders TWO things at the exact painted size — the
   original file, and the rung the browser would pick from the new srcset —
   and compares them.

   Why not just diff the two pages? Because a full-viewport diff mixes three
   unrelated things: the codec, the resampler, and the CSS filters layered
   over these photographs. Downscaling 1717px to 402px in the browser and
   downscaling it to 410px with lanczos and then to 402px in the browser
   give different pixels no matter how good the codec is — that difference
   is not quality loss, and it swamped the measurement when tried that way
   (index/mobile read 29.9dB and looked, wrongly, like a regression).

   Rendering both through the same browser downscale at the same final size
   removes the resampler from the comparison and leaves the codec. */
import puppeteer from 'puppeteer';
import { readFileSync } from 'node:fs';

const man = JSON.parse(readFileSync('img-manifest.json', 'utf8'));
/* The device pixel counts that matter: a 3x phone, a 2x laptop, a 1x
   large desktop. Each resolves `sizes` itself, exactly as the browser does. */
const DEVICES = [
  { name: '390@3x', vw: 390, dpr: 3 },
  { name: '744@2x', vw: 744, dpr: 2 },
  { name: '1440@2x', vw: 1440, dpr: 2 },
  { name: '2560@1x', vw: 2560, dpr: 1 },
];

/* Resolve a `sizes` list the way the browser does: first matching clause. */
function resolveSizes(sizes, vw) {
  for (const clause of sizes.split(',').map((s) => s.trim())) {
    const m = /^\((?:max-width):\s*(\d+)px\)\s*([\d.]+)vw$/.exec(clause);
    if (m) { if (vw <= +m[1]) return (+m[2] / 100) * vw; continue; }
    const b = /^([\d.]+)vw$/.exec(clause);
    if (b) return (+b[1] / 100) * vw;
  }
  return vw;
}
/* And pick a rung the way the browser does: smallest candidate >= need. */
const pickRung = (rungs, need) => rungs.find((r) => r.w >= need) ?? rungs[rungs.length - 1];

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'], protocolTimeout: 300000 });
const page = await browser.newPage();
await page.goto('http://localhost:3001/', { waitUntil: 'domcontentloaded' });

const rows = [];
for (const [src, e] of Object.entries(man)) {
  for (const d of DEVICES) {
    const cssW = resolveSizes(e.sizes, d.vw);
    const need = Math.round(cssW * d.dpr);
    const rungs = e.avif.length ? e.avif : e.webp;
    const rung = pickRung(rungs, need);
    const paintW = Math.min(need, 2000);                    // cap the canvas work
    const paintH = Math.max(1, Math.round(paintW * e.height / e.width));

    const r = await page.evaluate(async (origSrc, rungSrc, w, h) => {
      const draw = async (s) => {
        const im = new Image(); im.src = '/' + s; await im.decode();
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const x = c.getContext('2d', { willReadFrequently: true });
        x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
        x.drawImage(im, 0, 0, w, h);
        return x.getImageData(0, 0, w, h).data;
      };
      const A = await draw(origSrc), B = await draw(rungSrc);
      let se = 0, n = 0, maxd = 0, over8 = 0, sa = 0, sb = 0;
      const L = (p, i) => 0.2126 * p[i] + 0.7152 * p[i + 1] + 0.0722 * p[i + 2];
      for (let i = 0; i < A.length; i += 4) {
        const dl = L(A, i) - L(B, i);
        se += dl * dl; n++; sa += L(A, i); sb += L(B, i);
        const m = Math.max(Math.abs(A[i] - B[i]), Math.abs(A[i + 1] - B[i + 1]), Math.abs(A[i + 2] - B[i + 2]));
        if (m > maxd) maxd = m;
        if (m > 8) over8++;
      }
      const mse = se / n;
      return { psnr: mse === 0 ? 99 : 10 * Math.log10(65025 / mse), maxd, pctOver8: (over8 / n) * 100,
               meanA: sa / n, dMean: (sb - sa) / n };
    }, src, rung.file, paintW, paintH);

    rows.push({ src, device: d.name, need, rung: rung.w, kb: rung.bytes / 1024, ...r });
  }
}
await browser.close();

rows.sort((a, b) => a.psnr - b.psnr);
console.log('photograph'.padEnd(28), 'device'.padEnd(9), 'need'.padStart(5), 'rung'.padStart(5), 'KB'.padStart(6),
            'lumaPSNR'.padStart(9), 'maxΔ'.padStart(5), 'px>8'.padStart(7), 'Δmean'.padStart(7));
console.log('-'.repeat(96));
for (const r of rows.slice(0, 22)) {
  console.log(
    r.src.replace('assets/img/', '').padEnd(28), r.device.padEnd(9),
    String(r.need).padStart(5), String(r.rung).padStart(5), r.kb.toFixed(0).padStart(6),
    r.psnr.toFixed(1).padStart(9), String(r.maxd).padStart(5),
    (r.pctOver8.toFixed(2) + '%').padStart(7), r.dMean.toFixed(2).padStart(7),
  );
}
const worst = rows[0];
const under = rows.filter((r) => r.psnr < 38);
console.log(`\n${rows.length} photograph/device pairs. worst ${worst.psnr.toFixed(1)}dB (${worst.src.replace('assets/img/', '')} @ ${worst.device}).`);
console.log(under.length ? `${under.length} below 38dB — inspect these.` : 'none below 38dB.');
