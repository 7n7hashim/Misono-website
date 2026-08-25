/* Everything about the location bands that is NOT a single moment.

   Usage, from the project root — it MUST be run from there, since it resolves
   puppeteer out of node_modules/:

     node verify-locale.mjs

   shoot-locale.mjs answers "what does it look like at position p". This
   answers the questions a screenshot cannot:

     1. CAP HEIGHT, scanned from the render against the 2.70%-of-width target.
        Cap height is the type invariant for this section, not ink width —
        these headings are seven characters against the comp's seventeen, so
        matching the comp's 29.79% ink width would set a seven-letter word
        across a third of the viewport. The 0.66em cap ratio the CSS starts
        from is a spec-sheet number for Cormorant and is NOT to be trusted;
        this is the measurement that decides the multiple.

     2. FIT across seven viewports, tested as rects rather than by
        scrollHeight > clientHeight — which lies here for the same reason it
        lies on the reserve section: the photograph drifts inside a mask that
        is holding still, so the section ALWAYS reports overflow.

     3. THE SEAM. .details used to end on #F5E5DB, the foot of a closing
        gradient, against .locale's --ground #F7E8DF — a measured step of 4
        per channel. That gradient was removed on 2026-08-18 when .details
        became the foot of the .touch composition rather than a band of its
        own, so both sides are now #F7E8DF and the step is 0. Kept as a check
        rather than deleted: it is the thing that would regress if anyone
        re-tinted either section.

     4. REDUCED MOTION: that nothing is left transformed or faded, and that no
        inline --rise is ever written.

     5. EVERY var() IN THE FILE against :root, by enumeration. A token that is
        used but not defined fails SILENTLY, and it has already happened twice
        on about.html — once leaving type at inherited ink, once painting SVG
        dots black on the peach. Reasoning about which tokens "must" be there
        is exactly what missed it both times. */
import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';

const URL = 'http://localhost:3001/contact.html';
const VIEWPORTS = [
  [1440, 900], [1280, 800], [1512, 820], [2560, 1440],
  [1000, 700], [820, 1180], [390, 844]
];

const browser = await puppeteer.launch({ headless: 'new' });

const settle = async (page) => {
  await page.evaluate(() => document.fonts && document.fonts.ready);
  /* Reduced motion is emulated for every measuring pass: it renders the
     composition outright instead of leaving it armed behind an observer, and
     it is the state the measured numbers are supposed to describe. */
  await page.evaluate(() => new Promise(r => setTimeout(r, 250)));
};

const newPage = async (w, h, reduce = true) => {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  if (reduce) {
    await page.emulateMediaFeatures([
      { name: 'prefers-reduced-motion', value: 'reduce' }
    ]);
  }
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await settle(page);
  return page;
};

/* ------------------------------------------------------- 1. cap height */

console.log('CAP HEIGHT — target 2.70% of viewport width\n');
{
  for (const [w, h] of [[1440, 900], [1280, 800], [390, 844]]) {
    const page = await newPage(w, h);
    for (const sel of ['.locale--mombasa', '.locale--nairobi']) {
      const box = await page.evaluate((sel) => {
        const t = document.querySelector(sel + ' .locale__title');
        t.scrollIntoView({ block: 'center', behavior: 'instant' });
        const b = t.getBoundingClientRect();
        /* PAGE coordinates, not viewport ones. page.screenshot({clip}) clips
           against the document, so passing a post-scroll viewport rect
           captures a region that far down from the TOP OF THE PAGE — here,
           the dark hero photograph. It does not error and the PNG looks like
           a real capture; the cap scan simply reported ink on every row and
           the seam check reported a step of 203. Add the scroll offset. */
        return {
          clip: { x: Math.floor(b.left + scrollX), y: Math.floor(b.top + scrollY),
                  width: Math.ceil(b.width), height: Math.ceil(b.height) },
          fs: parseFloat(getComputedStyle(t).fontSize),
          text: t.textContent.trim(),
          inkW: +b.width.toFixed(1)
        };
      }, sel);

      const png = await page.screenshot({ clip: box.clip });

      /* SCANNED OVER THE FIRST GLYPH ONLY, and that correction is the whole
         point of this check.

         The first version of this scan walked the full ink extent of the
         heading and called it the cap height. It is not: "Mombasa" has a `b`
         and "Nairobi" has a `b` AND a dotted `i`, so the top of the ink is
         the ASCENDER, which in Cormorant sits well above the cap. It
         reported 62px against a 59px font — a cap taller than its own em,
         which is impossible and is what gave the error away. Believing it
         would have shrunk this heading by a third to hit a target it was
         already close to.

         So the window is [first ink column, +1.15em], which contains `M` or
         `N` and at most a sliver of the following x-height letter. Neither
         reaches above the cap, so the extent over that window IS the cap. */
      const ink = await page.evaluate(async (dataUrl, fs) => {
        const img = new Image(); img.src = dataUrl; await img.decode();
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        const g = c.getContext('2d'); g.drawImage(img, 0, 0);
        const d = g.getImageData(0, 0, c.width, c.height).data;
        const isInk = (x, y) => {
          const i = (y * c.width + x) * 4;
          // ground F7E8DF (247,232,223) vs ink 2F1B19 (47,27,25)
          return d[i] < 170 && d[i + 1] < 150;
        };
        let firstCol = -1;
        for (let x = 0; x < c.width && firstCol < 0; x++)
          for (let y = 0; y < c.height; y++)
            if (isInk(x, y)) { firstCol = x; break; }
        const lastCol = Math.min(c.width - 1, firstCol + Math.round(fs * 1.15));
        let top = -1, bot = -1;
        for (let y = 0; y < c.height; y++)
          for (let x = firstCol; x <= lastCol; x++)
            if (isInk(x, y)) { if (top < 0) top = y; bot = y; break; }
        return { top, bot, firstCol, lastCol };
      }, 'data:image/png;base64,' + png.toString('base64'), box.fs);

      /* Cross-check through the font's own metrics. actualBoundingBoxAscent
         of a single capital IS the cap height, measured by the same engine
         that painted the scan above — if the two disagree by more than a
         pixel, the scan window is wrong, not the font. */
      const metric = await page.evaluate((sel) => {
        const t = document.querySelector(sel + ' .locale__title');
        const cs = getComputedStyle(t);
        const c = document.createElement('canvas').getContext('2d');
        c.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const m = c.measureText(t.textContent.trim()[0]);
        return +m.actualBoundingBoxAscent.toFixed(1);
      }, sel);

      const cap = ink.bot - ink.top + 1;
      const pct = cap / w * 100;
      /* The 2.70% target is a share of a DESKTOP viewport, taken off a
         1.90:1 comp. Below the 640 breakpoint the heading is deliberately a
         much larger share — a phone needs bigger relative type, and holding
         2.70% there would set a 10px cap. So the target is only asserted
         where it means something. */
      const desktop = w >= 1000;
      const flag = !desktop ? `(phone — target n/a, ${pct.toFixed(1)}%)`
                            : Math.abs(pct - 2.70) <= 0.12 ? 'ok' : 'OFF';
      /* The painted scan runs ~2px larger than the font metric at this size,
         every time and in the same direction: actualBoundingBoxAscent is the
         glyph outline, and the scan sees the ANTIALIASED edge either side of
         it. A constant 2px offset is the two agreeing. Flag only a real
         divergence. */
      const agree = Math.abs(cap - metric) <= 3 ? '' : `  SCAN/METRIC DISAGREE (${metric}px)`;
      console.log(`  ${String(w + 'x' + h).padEnd(10)} ${sel.replace('.locale--', '').padEnd(9)}` +
        ` "${box.text}"  font ${box.fs.toFixed(1)}px  cap ${cap}px (metric ${metric}px)` +
        ` = ${pct.toFixed(2)}%  ${flag}${agree}`);
    }
    await page.close();
  }
}

/* ------------------------------------------------------------- 2. fit */

console.log('\nFIT — section, head and stage as rects (no scrollHeight test)\n');
{
  for (const [w, h] of VIEWPORTS) {
    const page = await newPage(w, h);
    const r = await page.evaluate(() => {
      const out = [];
      for (const sel of ['.locale--mombasa', '.locale--nairobi']) {
        const s = document.querySelector(sel);
        const head = s.querySelector('.locale__head');
        const stage = s.querySelector('.locale__stage');
        const sr = s.getBoundingClientRect();
        const hr = head.getBoundingClientRect();
        const gr = stage.getBoundingClientRect();
        out.push({
          sel: sel.replace('.locale--', ''),
          section: Math.round(sr.height),
          head: Math.round(hr.height),
          stage: Math.round(gr.height),
          /* the copy column tested against the section, which is the test
             that means something here */
          clipped: hr.left < sr.left - 0.5 || hr.right > sr.right + 0.5
                   || gr.left < sr.left - 0.5 || gr.right > sr.right + 0.5
        });
      }
      return { out, hscroll: document.documentElement.scrollWidth > innerWidth + 1 };
    });
    for (const o of r.out) {
      console.log(`  ${String(w + 'x' + h).padEnd(10)} ${o.sel.padEnd(9)}` +
        ` section ${String(o.section).padEnd(5)} head ${String(o.head).padEnd(4)}` +
        ` stage ${String(o.stage).padEnd(5)} clipped ${o.clipped ? 'YES' : 'no'}` +
        `  h-scroll ${r.hscroll ? 'YES' : 'no'}`);
    }
    await page.close();
  }
}

/* ------------------------------------------------------------ 3. seam */

console.log('\nSEAM — .details ground against .locale ground\n');
{
  const page = await newPage(1440, 900);
  const seam = await page.evaluate(() => {
    const d = document.querySelector('.details');
    const l = document.querySelector('.locale--mombasa');
    const b = d.getBoundingClientRect();
    scrollTo({ top: b.bottom + scrollY - innerHeight / 2, behavior: 'instant' });
    return new Promise(r => requestAnimationFrame(() => {
      const db = d.getBoundingClientRect(), lb = l.getBoundingClientRect();
      /* Page coordinates — see the note in the cap-height block. */
      r({ y: Math.round(db.bottom + scrollY), lTop: Math.round(lb.top + scrollY) });
    }));
  });
  const png = await page.screenshot({
    clip: { x: 700, y: Math.max(0, seam.y - 14), width: 40, height: 28 }
  });
  const rows = await page.evaluate(async (dataUrl) => {
    const img = new Image(); img.src = dataUrl; await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    const out = [];
    for (let y = 0; y < c.height; y++) {
      const i = (y * c.width + 10) * 4;
      out.push([d[i], d[i + 1], d[i + 2]]);
    }
    return out;
  }, 'data:image/png;base64,' + png.toString('base64'));

  let maxStep = 0, at = -1;
  for (let i = 1; i < rows.length; i++) {
    const s = Math.max(
      Math.abs(rows[i][0] - rows[i - 1][0]),
      Math.abs(rows[i][1] - rows[i - 1][1]),
      Math.abs(rows[i][2] - rows[i - 1][2]));
    if (s > maxStep) { maxStep = s; at = i; }
  }
  console.log(`  boundary at y=${seam.y}; largest per-channel step across it: ${maxStep}` +
    ` (row ${at})`);
  console.log(`  above ${rows[0].join(',')}   below ${rows[rows.length - 1].join(',')}`);
  console.log(`  ${maxStep <= 4 ? 'no visible band — a step of <=4 per channel is below threshold'
                                : 'REPORT THIS: a step this size may read as a band'}`);
  await page.close();
}

/* -------------------------------------------------- 4. reduced motion */

console.log('\nREDUCED MOTION\n');
{
  const page = await newPage(1440, 900);
  await page.evaluate(() => scrollTo({ top: document.body.scrollHeight / 2, behavior: 'instant' }));
  await page.evaluate(() => new Promise(r => setTimeout(r, 400)));
  const rm = await page.evaluate(() => {
    const bad = [];
    document.querySelectorAll('.locale').forEach(s => {
      if (s.style.getPropertyValue('--rise')) bad.push('inline --rise written on ' + s.className);
      s.querySelectorAll('.locale__img, .locale__mark, .locale__frame, .locale__card,' +
        ' .locale__pill, .locale__dot, .locale__eyebrow, .locale__title, .locale__body')
        .forEach(el => {
          const cs = getComputedStyle(el);
          if (cs.transform !== 'none') bad.push(`${el.className} transform ${cs.transform}`);
          if (+cs.opacity < 0.999) bad.push(`${el.className} opacity ${cs.opacity}`);
        });
    });
    const anims = [].concat(...[...document.querySelectorAll('.locale')]
      .map(s => s.getAnimations ? s.getAnimations({ subtree: true }) : []));
    return { bad, anims: anims.length };
  });
  console.log(rm.bad.length ? rm.bad.map(b => '  ' + b).join('\n')
                            : '  nothing transformed, nothing faded, no inline --rise');
  console.log(`  getAnimations() on .locale subtrees: ${rm.anims}`);
  await page.close();
}

/* --------------------------------------------------- 5. var() vs :root */

console.log('\nTOKENS — every var() in the file against :root\n');
{
  /* COMMENTS ARE STRIPPED FIRST, and this is not tidiness. The first run of
     this check reported --cream as "declared nowhere" — a genuine-looking
     silent-failure hit that was actually the token being NAMED in a comment
     explaining why the code deliberately does not use it. A checker that
     reads comments produces false positives, and a false positive here is
     worse than no check: it is exactly the noise that would let a real
     undeclared token through the next time. */
  const src = readFileSync('contact.html', 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')      // CSS and JS block comments
    .replace(/<!--[\s\S]*?-->/g, ' ');      // HTML comments
  const declared = new Set();
  const rootBlock = src.slice(src.indexOf(':root'), src.indexOf('*, *::before'));
  for (const m of rootBlock.matchAll(/(--[\w-]+)\s*:/g)) declared.add(m[1]);

  /* Custom properties are also legitimately declared on a component and read
     inside it (--lu, --in-delay, ...). Collect every declaration anywhere,
     then report the two lists separately — a name that is READ but declared
     NOWHERE is the failure this check exists for. */
  const anywhere = new Set();
  for (const m of src.matchAll(/(--[\w-]+)\s*:/g)) anywhere.add(m[1]);

  const used = new Set();
  for (const m of src.matchAll(/var\(\s*(--[\w-]+)/g)) used.add(m[1]);

  const undeclared = [...used].filter(u => !anywhere.has(u)).sort();
  const notInRoot = [...used].filter(u => !declared.has(u) && anywhere.has(u)).sort();

  console.log(`  ${used.size} distinct var() reads; ${declared.size} tokens in :root`);
  console.log(undeclared.length
    ? '  DECLARED NOWHERE (these fail silently):\n' + undeclared.map(u => '    ' + u).join('\n')
    : '  every var() read resolves to a declaration somewhere');
  if (notInRoot.length) {
    console.log('  declared on a component rather than :root (expected for these):');
    console.log('    ' + notInRoot.join(', '));
  }
}

await browser.close();
