// The .touch entrance, frozen at chosen moments, plus the .details ending.
//
// Usage: node shoot-touch.mjs [width] [height] [ms,ms,ms...]
//   node shoot-touch.mjs
//   node shoot-touch.mjs 1440 900 0,400,900,1400,2400
//   node shoot-touch.mjs 1280x800
//
// WHY THIS EXISTS. `screenshot.mjs` cannot capture this section, for the two
// reasons menu.html's opening has and one more of its own. Its full-page
// capture uses captureBeyondViewport, which never moves the layout viewport,
// so the IntersectionObserver never fires and .touch shoots armed — that is,
// blank. Even with the observer firing, the shutter lands wherever a 2060ms
// choreography happens to be, which is not repeatable. And .touch is below
// the fold, so the viewport has to be driven there before any of it is
// visible at all.
//
// The entrance is not waited out, it is SEEDED AND PAUSED: reload with
// `IntersectionObserver` stubbed so the section stays armed, add `is-in` by
// hand, then pause every transition and set its currentTime. Nothing is
// simulated — these are the real CSS transitions, stopped.
//
// THE PAGE IS RELOADED FOR EVERY TIMESTAMP. Removing `is-in` and re-adding it
// to replay in one page does not work: removing it starts a full set of
// REVERSE transitions, a paused animation never finishes and so is never
// dropped, and each pass then seeks a growing pile of half-finished
// transitions. It fails legibly if you print the count and illegibly if you
// only look at the PNGs.
//
// SCROLLING IS DONE WITH getBoundingClientRect AND behavior:'instant'. The
// reserve tooling records both halves of this trap: `.touch` is
// position:relative so its offsetTop is not a document coordinate, and a
// smooth scroll is still easing when the shutter fires. Both failures look
// like a correct screenshot of the wrong thing.
//
// The table is usually the faster read than the PNGs. Per element it gives
// opacity, APPARENT SCALE (painted box width over width at rest) and offset
// from rest. The two display lines carry a rotateX, so their bounding box is
// a trapezoid measured at its wider edge and the number runs a little above
// the pure perspective scale; the fields carry none, so theirs should close
// against p/(p-z) directly.
//
// A RUN AT A LARGE t READING `scale 1.000  offset 0.0, 0.0` ON ALL TEN IS THE
// PROOF THE COMPOSITION IS UNTOUCHED. And a line reading scale 1.000 at t=0
// is not a subtle animation — it is the perspective-on-the-wrong-parent bug.
import puppeteer from 'puppeteer';
import { mkdir, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)));
const OUT_DIR = resolve(ROOT, 'temporary screenshots');
const URL_BASE = process.env.URL_BASE ?? 'http://localhost:3001';

const args = process.argv.slice(2);

let width = 1440;
let height = 900;
let times = [0, 400, 900, 1400, 2400];

if (args[0]) {
  const m = /^(\d+)x(\d+)$/.exec(args[0]);
  if (m) {
    width = Number(m[1]);
    height = Number(m[2]);
    if (args[1]) times = args[1].split(',').map(Number);
  } else {
    width = Number(args[0]);
    if (args[1] && /^\d+$/.test(args[1])) height = Number(args[1]);
    if (args[2]) times = args[2].split(',').map(Number);
  }
}

// Depth per element, so the printed scale can be read against what it should
// be rather than merely against 1.000. Null where the element has no Z.
const TARGETS = [
  ['eyebrow', '.touch__eyebrow', 1100, -80],
  ['line 1', '.touch__title span:nth-child(1)', 1100, -210],
  ['line 2', '.touch__title span:nth-child(2)', 1100, -240],
  ['rule', '.touch__rule', null, null],
  ['body', '.touch__body', 1100, -60],
  ['name', '.touch__form .field:nth-child(1)', 1200, -150],
  ['email', '.touch__form .field:nth-child(2)', 1200, -170],
  ['phone', '.touch__form .field:nth-child(3)', 1200, -190],
  ['message', '.touch__form .field:nth-child(4)', 1200, -210],
  ['send', '.touch__send', 1200, -120],
];

async function nextIndex() {
  await mkdir(OUT_DIR, { recursive: true });
  const files = await readdir(OUT_DIR);
  let max = 0;
  for (const file of files) {
    const m = /^screenshot-(\d+)/.exec(file);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max + 1;
}

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-color-profile=srgb', '--hide-scrollbars'],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });

  const problems = [];
  page.on('console', (m) => { if (m.type() === 'error') problems.push(`console: ${m.text()}`); });
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => problems.push(`requestfailed: ${r.url()}`));

  const url = `${URL_BASE}/contact.html`;

  await page.evaluateOnNewDocument(() => {
    // Scoped to the section, never document.getAnimations() wholesale. This
    // page happens to carry no infinite animation for finish() to throw on,
    // unlike `drift` on index/about and `reserve-drift` in the reservation
    // block — but that is an accident of this page, not a property of the
    // tool, so the sweep is scoped anyway.
    window.touchAnimations = () => {
      const section = document.querySelector('.touch');
      return document.getAnimations().filter(
        (a) => a.effect && a.effect.target && section.contains(a.effect.target),
      );
    };
    window.toTouch = () => {
      const r = document.querySelector('.touch').getBoundingClientRect();
      // getBoundingClientRect, never offsetTop; instant, never smooth.
      window.scrollTo({ top: r.top + window.scrollY, behavior: 'instant' });
    };
    // sRGB relative luminance, then WCAG contrast. Rec.709 coefficients as
    // WCAG defines them — NOT the Rec.601 the bake scripts use for painted
    // luminance, which is a different question and a different number.
    window.contrast = (a, b) => {
      const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
      const L = (rgb) => {
        const [r, g, bl] = rgb.match(/[\d.]+/g).slice(0, 3).map((n) => lin(Number(n) / 255));
        return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
      };
      const [x, y] = [L(a), L(b)].sort((p, q) => q - p);
      return (x + 0.05) / (y + 0.05);
    };
  });

  const settle = () => page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );

  // Pass 1, with the page exactly as a reader gets it: does the observer fire
  // at all? If it does not, the entrance never runs for anyone and every
  // frame below would be the armed state rather than the animation. Rest
  // geometry is taken here, at the same scroll position every later pass
  // uses, since every apparent scale is measured against it.
  const res = await page.goto(url, { waitUntil: 'networkidle0', timeout: 60_000 });
  if (!res?.ok()) throw new Error(`${url} responded ${res ? res.status() : 'with no response'}`);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.toTouch());
  await settle();
  await new Promise((r) => setTimeout(r, 400));

  const armed = await page.evaluate(() => ({
    js: document.documentElement.classList.contains('js'),
    isIn: document.querySelector('.touch').classList.contains('is-in'),
    drift: getComputedStyle(document.querySelector('.touch')).getPropertyValue('--drift').trim(),
    par: getComputedStyle(document.querySelector('.hero')).getPropertyValue('--par').trim(),
  }));
  console.log(`\n${width}x${height}   html.js=${armed.js}   .touch.is-in after scroll=${armed.isIn}`);
  console.log(`--drift at .touch top=${armed.drift}   hero --par=${armed.par}\n`);

  const rest = await page.evaluate((targets) => {
    for (const a of touchAnimations()) a.finish();
    const out = {};
    for (const [name, sel] of targets) {
      const r = document.querySelector(sel).getBoundingClientRect();
      out[name] = { w: r.width, h: r.height, x: r.left, y: r.top };
    }
    return out;
  }, TARGETS);

  // ---- contrast and fit, measured at rest -------------------------------
  const checks = await page.evaluate(() => {
    const bg = getComputedStyle(document.querySelector('.touch')).backgroundColor;
    const rule = getComputedStyle(document.querySelector('.field__rule')).backgroundColor;
    const label = getComputedStyle(document.querySelector('.field__label')).color;
    const input = getComputedStyle(document.querySelector('.field__input')).color;
    const body = getComputedStyle(document.querySelector('.touch__body')).color;
    const send = getComputedStyle(document.querySelector('.touch__send')).borderTopColor;

    const section = document.querySelector('.touch').getBoundingClientRect();
    const inner = document.querySelector('.touch__inner').getBoundingClientRect();

    // The decorative marks are PROJECTED, so where they land is not where
    // they are positioned: .touch__deco's perspective-origin is its own
    // centre, so a mark in the right margin at z is dragged INWARD toward
    // the middle, over the form. getBoundingClientRect reports the painted
    // box, which is the only one that matters here.
    const kanji = document.querySelector('.touch__kanji').getBoundingClientRect();
    const mon = document.querySelector('.touch__mon').getBoundingClientRect();

    return {
      kanjiGap: kanji.left - inner.right,   // >0 means clear of the form
      monGap: inner.left - mon.right,       // >0 means clear of the masthead
      kanjiBox: [kanji.left, kanji.right, kanji.height],
      monBox: [mon.left, mon.right],
      innerBox: [inner.left, inner.right],
      ruleC: contrast(bg, rule),
      labelC: contrast(bg, label),
      inputC: contrast(bg, input),
      bodyC: contrast(bg, body),
      sendC: contrast(bg, send),
      // The copy box against the section box — NOT scrollHeight >
      // clientHeight, which lies here the same way it lies on the reserve
      // section, and would anyway be measuring the whole document.
      fits: inner.top >= section.top - 0.5 && inner.bottom <= section.bottom + 0.5,
      slack: Math.min(inner.top - section.top, section.bottom - inner.bottom),
      innerH: inner.height,
      sectionH: section.height,
      tu: getComputedStyle(document.querySelector('.touch')).getPropertyValue('--tu').trim(),
    };
  });

  const pass = (v, need) => `${v.toFixed(2)}:1 ${v >= need ? 'PASS' : 'FAIL'} (needs ${need})`;
  console.log('contrast as computed, against the section ground');
  console.log(`    field rule   ${pass(checks.ruleC, 3.0)}   <- UI boundary, WCAG 1.4.11`);
  console.log(`    field label  ${pass(checks.labelC, 4.5)}`);
  console.log(`    typed value  ${pass(checks.inputC, 4.5)}`);
  console.log(`    body         ${pass(checks.bodyC, 4.5)}`);
  console.log(`    send border  ${pass(checks.sendC, 3.0)}   <- UI boundary`);
  console.log(`\nfit   --tu ${checks.tu}   inner ${checks.innerH.toFixed(0)}px in ${checks.sectionH.toFixed(0)}px`
    + `   ${checks.fits ? 'FITS' : 'CLIPPED'}   slack ${checks.slack.toFixed(0)}px each side`);
  console.log(`deco  content spans ${checks.innerBox[0].toFixed(0)}-${checks.innerBox[1].toFixed(0)}`);
  console.log(`      kanji painted ${checks.kanjiBox[0].toFixed(0)}-${checks.kanjiBox[1].toFixed(0)}`
    + ` (${checks.kanjiBox[2].toFixed(0)}px tall)   clear of form by ${checks.kanjiGap.toFixed(0)}px`
    + `   ${checks.kanjiGap > 0 ? 'OK' : 'OVERLAPS'}`);
  console.log(`      mon   painted ${checks.monBox[0].toFixed(0)}-${checks.monBox[1].toFixed(0)}`
    + `   clear of masthead by ${checks.monGap.toFixed(0)}px   ${checks.monGap > 0 ? 'OK' : 'OVERLAPS'}\n`);

  // Every pass from here gets the section armed and left that way, so the
  // seek below is the only thing that ever starts it.
  await page.evaluateOnNewDocument(() => {
    window.IntersectionObserver = class {
      observe() {} unobserve() {} disconnect() {} takeRecords() { return []; }
    };
  });

  const rows = [];

  for (const t of times) {
    await page.reload({ waitUntil: 'networkidle0', timeout: 60_000 });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => window.toTouch());
    await settle();

    const count = await page.evaluate((ms) => {
      document.querySelector('.touch').classList.add('is-in');
      const anims = touchAnimations();
      for (const a of anims) { a.pause(); a.currentTime = ms; }
      return anims.length;
    }, t);

    await settle();

    const state = await page.evaluate((targets) => {
      const out = {};
      for (const [name, sel] of targets) {
        const el = document.querySelector(sel);
        const r = el.getBoundingClientRect();
        out[name] = { w: r.width, x: r.left, y: r.top, o: Number(getComputedStyle(el).opacity) };
      }
      return out;
    }, TARGETS);

    const index = await nextIndex();
    const out = resolve(OUT_DIR, `screenshot-${index}-touch-${t}ms.png`);
    await page.screenshot({ path: out, fullPage: false });

    rows.push({ t, count, out, state });
  }

  for (const row of rows) {
    console.log(`${row.out.replace(ROOT + '/', '')}   t=${row.t}ms   ${row.count} transitions running`);
    for (const [name, , p, z] of TARGETS) {
      const s = row.state[name];
      const r = rest[name];
      const scale = s.w / r.w;
      const dx = s.x - r.x;
      const dy = s.y - r.y;
      const want = p ? `  (z ${z}, projects ${(p / (p - z)).toFixed(3)})` : '';
      console.log(
        `    ${name.padEnd(8)} opacity ${s.o.toFixed(3)}   scale ${scale.toFixed(3)}` +
        `   offset ${dx >= 0 ? ' ' : ''}${dx.toFixed(1)}, ${dy >= 0 ? ' ' : ''}${dy.toFixed(1)}${want}`,
      );
    }
    console.log('');
  }

  // ---- the ending, which needs none of the above ------------------------
  // .details has no observer-driven entrance, so it is simply scrolled to and
  // shot. Its own numbers are printed because #F5E5DB — the foot of its
  // closing gradient — is the binding ground on this page, not the peach.
  await page.reload({ waitUntil: 'networkidle0', timeout: 60_000 });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => {
    const r = document.querySelector('.details').getBoundingClientRect();
    window.scrollTo({ top: r.top + window.scrollY, behavior: 'instant' });
  });
  await settle();
  await new Promise((r) => setTimeout(r, 250));

  const det = await page.evaluate(() => {
    const el = document.querySelector('.details');
    const r = el.getBoundingClientRect();
    const foot = '#F5E5DB';
    const toRgb = (hex) => {
      const n = parseInt(hex.slice(1), 16);
      return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
    };
    const value = getComputedStyle(document.querySelector('.details__value')).color;
    const label = getComputedStyle(document.querySelector('.details__label')).color;
    const links = [...document.querySelectorAll('.details__value')].map((a) => ({
      href: a.getAttribute('href'), text: a.textContent.trim(),
    }));
    return {
      h: r.height,
      svh: (r.height / window.innerHeight * 100).toFixed(1),
      valueC: contrast(toRgb(foot), value),
      labelC: contrast(toRgb(foot), label),
      links,
    };
  });

  const dIndex = await nextIndex();
  const dOut = resolve(OUT_DIR, `screenshot-${dIndex}-details.png`);
  await page.screenshot({ path: dOut, fullPage: false });

  console.log(`${dOut.replace(ROOT + '/', '')}   .details ${det.h.toFixed(0)}px = ${det.svh}svh`);
  console.log(`    against the gradient foot #F5E5DB:`);
  console.log(`        value  ${pass(det.valueC, 4.5)}`);
  console.log(`        label  ${pass(det.labelC, 4.5)}`);
  for (const l of det.links) console.log(`    ${l.href.padEnd(38)} ${l.text}`);
  console.log('');

  if (problems.length) {
    console.log('Page reported problems:');
    for (const p of [...new Set(problems)]) console.log(`  - ${p}`);
  }
} catch (err) {
  console.error(`shoot-touch failed: ${err.message}`);
  process.exitCode = 1;
} finally {
  await browser.close();
}
