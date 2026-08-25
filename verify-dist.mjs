/* Does the built site render what the source site renders?

   dist/ is the source with every comment removed, and comment removal is a
   regex pass over a stylesheet whose specificity order is load-bearing. A
   pass that ate one closing brace would take a whole rule block with it and
   the failure would be visual, not an error. This compares the two builds
   the only way that settles it: geometry of every classed element, then the
   painted pixels, at both viewports.

   Needs both servers up:
     PORT=3001 node serve.mjs                 (source)
     cd dist && PROD=1 PORT=3002 node ../serve.mjs   (built) */
import puppeteer from 'puppeteer';

const SRC = 'http://localhost:3001';
const BUILT = process.env.BUILT || 'http://localhost:3002';
const PAGES = (process.env.ONLY ? [process.env.ONLY] : ['', 'menu.html', 'about.html', 'contact.html']);
const VIEWS = (process.env.ONLYV === 'mobile' ? [{ name: 'mobile', w: 390, h: 844 }] : [{ name: 'desktop', w: 1440, h: 900 }, { name: 'mobile', w: 390, h: 844 }]);

async function snap(browser, url, view) {
  const p = await browser.newPage();
  await p.setViewport({ width: view.w, height: view.h, deviceScaleFactor: 1 });
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e.message)));
  await p.goto(url, { waitUntil: 'networkidle0', timeout: 90000 });
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += Math.round(innerHeight * 0.6)) {
      scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 80));
    }
    scrollTo({ top: 0, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 600));
    for (const a of document.getAnimations()) { try { a.pause(); a.currentTime = 0; } catch {} }
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
  const geo = await p.evaluate(() => {
    const o = {}; const n = {};
    for (const el of document.querySelectorAll('[class]')) {
      const c = (el.getAttribute('class') || '').trim().split(/\s+/)[0];
      if (!c) continue;
      n[c] = (n[c] ?? 0) + 1;
      const r = el.getBoundingClientRect();
      o[`${c}#${n[c]}`] = [Math.round(r.x * 10) / 10, Math.round(r.y * 10) / 10, Math.round(r.width * 10) / 10, Math.round(r.height * 10) / 10];
    }
    o.__doc = [0, 0, document.documentElement.scrollWidth, document.body.scrollHeight];
    /* Count the rules that survived: a stripping pass that ate a brace
       shows up here long before it shows up as a moved box. */
    let rules = 0;
    for (const s of document.styleSheets) { try { rules += s.cssRules.length; } catch {} }
    o.__rules = [rules, 0, 0, 0];
    return o;
  });
  const shot = await p.screenshot({ type: 'png' });
  await p.close();
  return { geo, shot, errs };
}

async function pixels(browser, a, b) {
  const p = await browser.newPage();
  const r = await p.evaluate(async (x, y) => {
    const load = (d) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = 'data:image/png;base64,' + d; });
    const [A, B] = await Promise.all([load(x), load(y)]);
    if (A.width !== B.width || A.height !== B.height) return { mismatch: [A.width, A.height, B.width, B.height] };
    const px = (im) => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
      const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0); return g.getImageData(0, 0, c.width, c.height).data; };
    const p1 = px(A), p2 = px(B);
    let diff = 0, maxd = 0, minX = 1e9, minY = 1e9, maxX = -1, maxY = -1;
    const W = A.width;
    for (let i = 0; i < p1.length; i += 4) {
      const m = Math.max(Math.abs(p1[i] - p2[i]), Math.abs(p1[i + 1] - p2[i + 1]), Math.abs(p1[i + 2] - p2[i + 2]));
      if (m > 1) {
        diff++;
        const idx = i / 4, x = idx % W, y = (idx - x) / W;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
      if (m > maxd) maxd = m;
    }
    return { pctDiff: (diff / (p1.length / 4)) * 100, maxd, box: diff ? [minX, minY, maxX, maxY] : null, size: [A.width, A.height] };
  }, a.toString('base64'), b.toString('base64'));
  await p.close();
  return r;
}

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'], protocolTimeout: 300000 });
let fails = 0;
for (const page of PAGES) {
  for (const v of VIEWS) {
    const a = await snap(browser, `${SRC}/${page}`, v);
    const b = await snap(browser, `${BUILT}/${page}`, v);
    const moved = Object.keys(a.geo).filter((k) => !(k in b.geo) || a.geo[k].some((n, i) => Math.abs(n - b.geo[k][i]) > 0.5));
    const px = await pixels(browser, a.shot, b.shot);
    const label = (page || 'index').padEnd(14) + v.name.padEnd(9);
    const rulesA = a.geo.__rules[0], rulesB = b.geo.__rules[0];
    const ok = !moved.length && rulesA === rulesB && !px.mismatch && px.pctDiff < 0.01 && !a.errs.length && !b.errs.length;
    console.log(`${label} cssRules ${rulesA}/${rulesB}  moved ${moved.length}  pixels differing ${px.mismatch ? 'SIZE MISMATCH' : px.pctDiff.toFixed(4) + '%'}  maxΔ ${px.maxd ?? '-'}  ${ok ? 'IDENTICAL' : 'DIFFERS'}`);
    if (moved.length) console.log('    moved:', moved.slice(0, 6).join(', '));
    if (px.box) {
      console.log(`    differing region x${px.box[0]}-${px.box[2]} y${px.box[1]}-${px.box[3]} of ${px.size.join('x')}`);
      const { writeFileSync } = await import('node:fs');
      writeFileSync(`temporary screenshots/dd-src.png`, a.shot);
      writeFileSync(`temporary screenshots/dd-built.png`, b.shot);
      console.log('    wrote temporary screenshots/dd-src.png and dd-built.png');
    }
    if (b.errs.length) console.log('    built page errors:', b.errs.slice(0, 3));
    if (!ok) fails++;
  }
}
await browser.close();
console.log(fails ? `\n${fails} comparison(s) differ` : '\ndist renders identically to source everywhere checked');
