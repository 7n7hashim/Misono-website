/* Capture a location band at a set of positions through its travel.

   screenshot.mjs cannot do this. It captures full-page with
   captureBeyondViewport, which never moves the layout viewport, so the
   IntersectionObserver never fires and both sections shoot ARMED — that is,
   blank. This scrolls for real, lets the rAF loop write --rise, and shoots
   the viewport.

   Usage, from the project root:
     node shoot-locale.mjs [width] [height] [p,p,p...] [mombasa|nairobi|both]

   Each p is a position through the section's travel: 0 is the moment its top
   reaches the bottom of the window, 1 the moment its foot leaves the top —
   the same span the CSS derives --rise over, so p and --rise agree.

   Files land in `temporary screenshots/`.

   Two things this encodes, both of which cost time elsewhere on this site:

     · SCROLL VIA getBoundingClientRect, NEVER offsetTop. `.locale` is
       position: relative, so its offsetTop is not a document coordinate; the
       reserve tooling records the same trap, where it produced a capture of
       the wrong section that looked perfectly correct. behavior:'instant'
       because the page sets scroll-behavior: smooth and a plain scrollTo is
       still easing when the shutter fires.

     · IT PRINTS EACH MARKER'S PAINTED RECT AGAINST ITS CONTENT RECT. The
       markers are the reason each one has its OWN perspective box: given one
       shared box they are projected toward that box's centre and land on top
       of the composition. That failure reads as clumsy placement rather than
       as a bug, so it must be MEASURED and not looked at. dx/dy of 0.0 at
       rest is the proof.

   It also reports apparent scale, which is the grandchild-perspective check:
   an element with a translateZ and no camera reports exactly 1.000. */
import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';

const W  = +(process.argv[2] || 1440);
const H  = +(process.argv[3] || 900);
const PS = (process.argv[4] || '0,0.25,0.5,0.75,1').split(',').map(Number);
const WHICH = (process.argv[5] || 'both').toLowerCase();

const SECTIONS = WHICH === 'both'
  ? ['.locale--mombasa', '.locale--nairobi']
  : [`.locale--${WHICH}`];

const OUT = 'temporary screenshots';
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
await page.goto('http://localhost:3001/contact.html', { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts && document.fonts.ready);

/* A WARM PASS FIRST, and the reason is the whole shape of this tool.

   Two independent things move here and they are not the same kind of thing:
   the ENTRANCE is a one-shot arrival (the observer adds .is-in once and
   unobserves), and --rise is continuous scroll state. Shooting a position
   140ms after scrolling to it catches the entrance partway and reports a
   layout that does not exist at any resting moment — the first run of this
   tool produced exactly that: a heading at opacity 0.25 and a photograph at
   0, which looks like a broken section rather than like a capture taken too
   early.

   So: drive every section once and let its entrance finish, THEN measure.
   After the warm pass .is-in is permanent, so each p below reports --rise
   and nothing else. To look at the entrance itself, use the timed capture in
   the same style as shoot-flavors.mjs rather than reading these numbers. */
for (const sel of SECTIONS) {
  await page.evaluate((sel) => {
    const s = document.querySelector(sel);
    const r = s.getBoundingClientRect();
    scrollTo({ top: r.top + scrollY - innerHeight * 0.35, behavior: 'instant' });
  }, sel);
  await page.evaluate((sel) => new Promise((resolve) => {
    const s = document.querySelector(sel);
    const started = Date.now();
    (function poll() {
      /* Scoped to the section on purpose. An unscoped getAnimations() sweep
         reaches the reservation block's reserve-drift, which runs forever —
         and anything that waits on "all animations finished" then waits
         forever too. */
      const running = s.getAnimations
        ? s.getAnimations({ subtree: true }).filter(a => a.playState === 'running')
        : [];
      if ((s.classList.contains('is-in') && !running.length) || Date.now() - started > 4000) {
        return resolve();
      }
      setTimeout(poll, 80);
    })();
  }), sel);
}

for (const sel of SECTIONS) {
  console.log(`\n=== ${sel}  ${W}x${H} ===`);

  for (const p of PS) {
    await page.evaluate((sel, p) => {
      const s = document.querySelector(sel);
      const r = s.getBoundingClientRect();
      const top = r.top + scrollY;
      /* The span --rise is derived over: from the section's top being at the
         bottom of the window, to its foot leaving the top. */
      const start = top - innerHeight;
      const span  = innerHeight + r.height;
      scrollTo({ top: start + span * p, behavior: 'instant' });
    }, sel, p);

    await page.evaluate(() => new Promise(r =>
      requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 140)))));

    const tag = String(p).replace('.', 'p');
    const name = sel.replace('.locale--', '');
    const file = `${OUT}/locale-${name}-${W}x${H}-p${tag}.png`;
    await page.screenshot({ path: file });

    const state = await page.evaluate((sel) => {
      const s = document.querySelector(sel);
      const rise = s.style.getPropertyValue('--rise') || '(unset)';

      /* Apparent scale from the painted rect against the layout rect, which
         is what a translateZ through a perspective actually produces. 1.000
         on an element that carries a translateZ means no camera. */
      const probe = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const w = el.offsetWidth, h = el.offsetHeight;
        return {
          scale: w ? +(r.width / w).toFixed(3) : 1,
          op: +(+getComputedStyle(el).opacity).toFixed(2),
          /* painted centre minus content centre — see the header note */
          dx: +(r.left + r.width / 2 - (el.offsetLeft + w / 2 +
                (el.offsetParent ? el.offsetParent.getBoundingClientRect().left : 0))).toFixed(1),
          dy: +(r.top + r.height / 2 - (el.offsetTop + h / 2 +
                (el.offsetParent ? el.offsetParent.getBoundingClientRect().top : 0))).toFixed(1)
        };
      };

      const out = { rise, els: {} };
      const map = {
        eyebrow: '.locale__eyebrow',
        title:   '.locale__title',
        body:    '.locale__body',
        frame:   '.locale__frame',
        cardA:   '.locale__mark--a .locale__card',
        cardB:   '.locale__mark--b .locale__card',
        pill:    '.locale__pill',
        dot1:    '.locale__mark--d1 .locale__dot'
      };
      for (const k in map) out.els[k] = probe(s.querySelector(map[k]));

      /* The photograph's own drift, read off the element the CSS writes it
         on rather than recomputed. */
      const img = s.querySelector('.locale__img');
      out.img = img ? getComputedStyle(img).transform : '(none)';
      return out;
    }, sel);

    const cells = Object.entries(state.els).map(([k, v]) =>
      v ? `${k} s${v.scale.toFixed(3)} o${v.op.toFixed(2)} d(${v.dx},${v.dy})` : `${k} —`);
    console.log(`p=${String(p).padEnd(5)} --rise ${String(state.rise).padEnd(7)} ${file}`);
    console.log(`        ${cells.join('  ')}`);
    console.log(`        img ${state.img}`);
  }
}

await browser.close();
