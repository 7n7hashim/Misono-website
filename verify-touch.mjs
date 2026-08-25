// The checks shoot-touch.mjs does not cover, for .touch and .details.
//
// Usage: node verify-touch.mjs
//
// shoot-touch.mjs answers "does the entrance land on its marks". This answers
// the four questions that are not about a single moment: what the field rules
// are actually painted as, whether the block fits at every viewport, whether
// reduced motion really parks everything, and whether the hero's parallax —
// live for the first time since this page grew a second section — covers its
// section at every scroll position.
//
// Answers the questions shoot-touch.mjs does not: what the field rules are
// ACTUALLY PAINTED as (they are 1px lines and the eye reads them as different
// colours at different y — subpixel coverage, not a bug, but "not a bug" is a
// measurement rather than an opinion), whether the block fits at every
// viewport, and whether reduced motion really parks everything at rest.
//
// Must be run from the project root: puppeteer resolves from node_modules/.
import puppeteer from 'puppeteer';

const URL_BASE = process.env.URL_BASE ?? 'http://localhost:3001';
// Not named URL: that shadows the global one puppeteer needs.
const PAGE = `${URL_BASE}/contact.html`;

const VIEWPORTS = [
  [1440, 900], [1280, 800], [1512, 820], [2560, 1440], [1000, 700], [820, 1180], [390, 844],
];

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-color-profile=srgb', '--hide-scrollbars'],
});

const settle = (page) => page.evaluate(
  () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
);

try {
  // ---- 1. the field rules, as painted --------------------------------
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.goto(PAGE, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto';
      const r = document.querySelector('.touch').getBoundingClientRect();
      window.scrollTo({ top: r.top + window.scrollY, behavior: 'instant' });
      document.querySelector('.touch').classList.add('is-in');
    });
    await settle(page);
    await new Promise((r) => setTimeout(r, 2600));

    const shot = await page.screenshot({ encoding: 'binary', fullPage: false });

    const painted = await page.evaluate(async (b64) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      c.getContext('2d').drawImage(img, 0, 0);
      const ctx = c.getContext('2d');

      // Sample the darkest row within +-2px of each rule's reported y, since
      // a 1px line lands across two device rows when its y is fractional.
      const out = [];
      for (const f of document.querySelectorAll('.field__rule')) {
        const r = f.getBoundingClientRect();
        const x = Math.round(r.left + r.width / 2);
        let best = null;
        for (let dy = -2; dy <= 2; dy++) {
          const y = Math.round(r.top) + dy;
          if (y < 0 || y >= c.height) continue;
          const d = ctx.getImageData(x, y, 1, 1).data;
          const lum = 0.2126 * d[0] + 0.7152 * d[1] + 0.0722 * d[2];
          if (!best || lum < best.lum) best = { lum, rgb: [d[0], d[1], d[2]], y };
        }
        out.push({
          label: f.previousElementSibling.previousElementSibling.textContent.trim(),
          top: r.top.toFixed(2),
          ...best,
        });
      }
      return out;
    }, Buffer.from(shot).toString('base64'));

    console.log('\nfield rules, sampled from the rendered PNG at their darkest row');
    console.log('   (all four share one class; any difference here is subpixel coverage)');
    for (const p of painted) {
      console.log(`    ${p.label.padEnd(8)} css-top ${String(p.top).padStart(7)}`
        + `   painted rgb(${p.rgb.join(', ')})   lum ${p.lum.toFixed(1)}`);
    }
    await page.close();
  }

  // ---- 2. fit across viewports ---------------------------------------
  console.log('\nfit across viewports');
  for (const [w, h] of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    await page.goto(PAGE, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      document.querySelector('.touch').classList.add('is-in');
      const r = document.querySelector('.touch').getBoundingClientRect();
      window.scrollTo({ top: r.top + window.scrollY, behavior: 'instant' });
    });
    await settle(page);

    const m = await page.evaluate(() => {
      const s = document.querySelector('.touch').getBoundingClientRect();
      const i = document.querySelector('.touch__inner').getBoundingClientRect();
      const d = document.querySelector('.details').getBoundingClientRect();
      const send = document.querySelector('.touch__send').getBoundingClientRect();
      const k = document.querySelector('.touch__kanji').getBoundingClientRect();
      const mon = document.querySelector('.touch__mon').getBoundingClientRect();
      const docW = document.documentElement.scrollWidth;
      return {
        sec: s.height, inner: i.height,
        fits: i.top >= s.top - 0.5 && i.bottom <= s.bottom + 0.5,
        oneScreen: s.height <= window.innerHeight + 1,
        det: d.height, detSvh: d.height / window.innerHeight * 100,
        sendW: send.width,
        kanjiGap: i.right ? k.left - i.right : 0,
        monGap: i.left - mon.right,
        hScroll: docW > window.innerWidth + 0.5,
        tu: getComputedStyle(document.querySelector('.touch')).getPropertyValue('--tu'),
        ...(() => {
          // The email is 26 characters, set nowrap, and the widest thing on
          // the page — so it overflows SILENTLY rather than wrapping. What
          // binds is the section's content box, not a grid cell: the items
          // are stacked and shrink to fit, which is why an earlier version
          // of this check (cell width minus value width) read a trivial 0 at
          // every viewport and proved nothing.
          const cs = getComputedStyle(document.querySelector('.details'));
          const box = d.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
          const vals = [...document.querySelectorAll('.details__value')];
          const widest = Math.max(...vals.map((v) => v.getBoundingClientRect().width));
          // GRID ALIGNMENT, which is what the architecture actually
          // guarantees — and the third invariant this check has had, because
          // the first two encoded a LAYOUT rather than a RULE and went stale
          // the moment the layout moved:
          //
          //   · "every item's centre sits on the page axis" was right for a
          //     stack and reported OFF AXIS at five of seven viewports the
          //     day the columns arrived;
          //   · "the two ink centres are balanced about the axis" was right
          //     for two centred cells and fired everywhere once the details
          //     were left-aligned to the grid on 2026-08-18.
          //
          // What is true of the composition rather than of one arrangement of
          // it: PHONE starts on the same grid line as the masthead, and EMAIL
          // on the same line as the form. That is the whole point of merging
          // the two blocks onto one grid, so it is the thing to assert. It
          // stays true if the columns are re-proportioned, and it fails
          // loudly if the two rows ever stop agreeing.
          const items = [...document.querySelectorAll('.details__item')];
          const stacked = items[1].getBoundingClientRect().top
                        > items[0].getBoundingClientRect().bottom - 2;
          const mast = document.querySelector('.touch__masthead').getBoundingClientRect();
          const form = document.querySelector('.touch__form').getBoundingClientRect();
          const dx1 = items[0].getBoundingClientRect().left - mast.left;
          const dx2 = items[1].getBoundingClientRect().left - form.left;
          return { valSlack: box - widest, dx1, dx2, stacked };
        })(),
        /* THE PAIR MUST FIT ONE SCREEN TOGETHER, asked for on 2026-08-18 and
           the reason .touch lost 100px of padding and rhythm that day. It is
           a real constraint rather than a preference — "no scrolling
           required" — so it is asserted here rather than left to a
           screenshot. Measured from .touch's top to .details' bottom, which
           is what a reader sees having scrolled the form to the top of the
           window. */
        pair: (() => {
          const t = document.querySelector('.touch').getBoundingClientRect();
          const d = document.querySelector('.details').getBoundingClientRect();
          return d.bottom - t.top;
        })(),
      };
    });

    console.log(`    ${String(w).padStart(4)}x${String(h).padEnd(5)}`
      + ` section ${m.sec.toFixed(0).padStart(4)}  inner ${m.inner.toFixed(0).padStart(4)}`
      + `  ${m.fits ? 'FITS ' : 'CLIP '}`
      + ` 1screen ${m.oneScreen ? 'y' : 'n'}`
      + `  details ${m.det.toFixed(0).padStart(4)} (${m.detSvh.toFixed(0)}svh)`
      + `  deco ${m.kanjiGap.toFixed(0).padStart(5)}/${m.monGap.toFixed(0).padStart(5)}`
      + `  hscroll ${m.hScroll ? 'YES <-- BAD' : 'no'}`
      + `  email-slack ${m.valSlack.toFixed(0).padStart(4)}${m.valSlack < 0 ? ' <-- OVERFLOWS' : ''}`
      + `  ${m.stacked ? 'stacked' : '2-col  '}`
      + `  grid dx ${m.dx1.toFixed(1).padStart(5)}/${m.dx2.toFixed(1).padStart(5)}`
      + `${(!m.stacked && (Math.abs(m.dx1) > 1 || Math.abs(m.dx2) > 1)) ? ' <-- OFF GRID' : ''}`
      /* Asserted on DESKTOP only. The requirement was one desktop viewport;
         below the 1000px breakpoint the columns stack and a phone cannot
         show a four-field form and the contact details at once, so flagging
         it there would be the same stale-assertion noise the axis check was
         just cured of. Still printed, so the number is visible. */
      + `  pair ${m.pair.toFixed(0).padStart(4)}/${h}`
      + `${m.pair <= h ? ' +' + (h - m.pair).toFixed(0).padStart(3)
                       : (w >= 1000 ? ' <-- OVER ONE SCREEN' : ' (stacked, n/a)')}`);
    await page.close();
  }

  // ---- 3. reduced motion ---------------------------------------------
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(PAGE, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      const r = document.querySelector('.touch').getBoundingClientRect();
      window.scrollTo({ top: r.top + window.scrollY, behavior: 'instant' });
    });
    await settle(page);
    await new Promise((r) => setTimeout(r, 300));

    const rm = await page.evaluate(() => {
      const sels = ['.touch__eyebrow', '.touch__title span:nth-child(1)',
        '.touch__title span:nth-child(2)', '.touch__rule', '.touch__body',
        '.field:nth-child(1)', '.field:nth-child(4)', '.touch__send'];
      const moved = sels.filter((s) => {
        const cs = getComputedStyle(document.querySelector(s));
        return cs.transform !== 'none' || Number(cs.opacity) < 1;
      });
      const touch = document.querySelector('.touch');
      const hero = document.querySelector('.hero');
      return {
        moved,
        inlineDrift: touch.style.getPropertyValue('--drift'),
        inlinePar: hero.style.getPropertyValue('--par'),
        heroMedia: getComputedStyle(document.querySelector('.hero__media')).transform,
        running: document.getAnimations().length,
      };
    });

    console.log('\nreduced motion');
    console.log(`    elements not at rest : ${rm.moved.length ? rm.moved.join(', ') : 'none'}`);
    console.log(`    inline --drift written: ${rm.inlineDrift === '' ? 'no' : 'YES <-- BAD (' + rm.inlineDrift + ')'}`);
    console.log(`    inline --par written  : ${rm.inlinePar === '' ? 'no' : 'YES <-- BAD (' + rm.inlinePar + ')'}`);
    console.log(`    .hero__media transform: ${rm.heroMedia}`);
    console.log(`    animations running    : ${rm.running}`);
    await page.close();
  }

  // ---- 4. the hero parallax, now that the page actually scrolls -------
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.goto(PAGE, { waitUntil: 'networkidle0' });
    const par = await page.evaluate(async () => {
      const hero = document.querySelector('.hero');
      const media = document.querySelector('.hero__media');
      // The media must cover THE HERO'S BOX, not the viewport. Testing it
      // against the viewport reports a gap at every scroll position past the
      // first — which is not a gap, it is the section below coming into view,
      // i.e. the page working. The first version of this check got that
      // wrong and read as a parallax bug.
      const read = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => {
        const t = new DOMMatrixReadOnly(getComputedStyle(media).transform);
        const m = media.getBoundingClientRect();
        const h = hero.getBoundingClientRect();
        r({
          par: Number(getComputedStyle(hero).getPropertyValue('--par')),
          y: t.m42,
          top: m.top, bottom: m.bottom,
          covers: m.top <= h.top + 0.5 && m.bottom >= h.bottom - 0.5,
        });
      })));
      const out = [];
      for (const y of [0, 225, 450, 675, 900]) {
        window.scrollTo({ top: y, behavior: 'instant' });
        out.push({ scroll: y, ...(await read()) });
      }
      return { out, travel: getComputedStyle(hero).getPropertyValue('--par-travel') };
    });
    console.log(`\nhero parallax — LIVE for the first time (--par-travel ${par.travel.trim()})`);
    for (const r of par.out) {
      console.log(`    scrollY ${String(r.scroll).padStart(4)}   --par ${r.par.toFixed(4)}`
        + `   media translateY ${r.y.toFixed(1).padStart(6)}px`
        + `   covers ${r.top.toFixed(0)} to ${r.bottom.toFixed(0)}`
        + `   ${r.covers ? 'no gap' : 'GAP <-- BAD'}`);
    }
    await page.close();
  }
} catch (err) {
  console.error(`verify-touch failed: ${err.message}\n${err.stack}`);
  process.exitCode = 1;
} finally {
  await browser.close();
}
