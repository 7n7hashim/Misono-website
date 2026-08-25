// The flavors section's entrance, frozen at chosen moments.
//
// Usage: node shoot-flavors.mjs [width] [height] [ms,ms,ms...]
//   node shoot-flavors.mjs
//   node shoot-flavors.mjs 1440 900 0,300,700,1200,2400
//   node shoot-flavors.mjs 1280x800
//
// WHY THIS EXISTS. `screenshot.mjs` cannot capture this section's entrance,
// for two separate reasons. Its full-page capture uses captureBeyondViewport,
// which never moves the layout viewport, so the IntersectionObserver that
// triggers the entrance does not fire and the section shoots armed — that is,
// blank. And even with the observer firing, a screenshot lands wherever the
// two-second choreography happens to be by the time the shutter opens, which
// is not a comparison you can repeat.
//
// So the entrance is not waited out here, it is SEEDED AND PAUSED: the page is
// reloaded with `IntersectionObserver` stubbed out so the section stays armed,
// `is-in` is then added by hand, and every transition the document starts is
// paused with its currentTime set to the requested millisecond. Nothing is
// simulated — the frames below are the real CSS, stopped.
//
// THE PAGE IS RELOADED FOR EVERY TIMESTAMP, and that is not caution. Removing
// `is-in` and re-adding it to replay the entrance in one page does not work:
// removing it starts a full set of REVERSE transitions, a paused animation
// never finishes and so is never dropped, and each pass therefore seeks a
// growing pile of half-finished transitions instead of a fresh one. It fails
// legibly if you print the count — 15, 15, 14, 12, 9 across five passes of the
// same section — and illegibly if you only look at the PNGs, which show a
// composition drifting further off its marks the longer the run goes.
//
// The table it prints is usually the faster read than the PNGs. Per element it
// gives opacity and APPARENT SCALE — the painted bounding box's width over its
// width at rest. Read it as depth made legible, not as the projection's scale
// factor: these elements also carry a rotateX, which turns the box into a
// trapezoid whose bounding width is that of its wider edge, so the number runs
// a little above the pure perspective scale and the arithmetic will not close
// against 1500/(1500+z) exactly. What it is exact about is REST. The last line
// of a run at a large t is the one that matters most: every scale 1.000 and
// every offset 0.0 is the proof that the composition measured in menu.html is
// untouched once the entrance lands.
import puppeteer from 'puppeteer';
import { mkdir, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)));
const OUT_DIR = resolve(ROOT, 'temporary screenshots');
const URL_BASE = process.env.URL_BASE ?? 'http://localhost:3001';

const args = process.argv.slice(2);

// Width may arrive as "1440 900" or as "1440x800".
let width = 1440;
let height = 900;
let times = [0, 300, 700, 1100, 1600, 2400];

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

const TARGETS = [
  ['eyebrow',   '.flavors__eyebrow'],
  ['line 1',    '.flavors__display span:nth-child(1)'],
  ['line 2',    '.flavors__display span:nth-child(2)'],
  ['frame ul',  '.frame--ul'],
  ['frame ur',  '.frame--ur'],
  ['frame ll',  '.frame--ll'],
  ['frame lr',  '.frame--lr'],
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

  const url = `${URL_BASE}/menu.html`;

  // Only the entrance's own transitions, never every animation on the page.
  // The reservation section's `reserve-drift` runs forever, and an infinite
  // animation cannot be finished at all — `finish()` throws on it — so an
  // unscoped sweep takes the whole run down three viewports from anything
  // being looked at here.
  await page.evaluateOnNewDocument(() => {
    window.flavorsAnimations = () => {
      const section = document.querySelector('.flavors');
      return document.getAnimations().filter(
        (a) => a.effect && a.effect.target && section.contains(a.effect.target),
      );
    };
  });

  const settle = () => page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );

  // Pass 1, with the page exactly as a reader gets it: does the observer fire
  // at all? If it does not, the entrance never runs for anyone, and every
  // frame below would be the armed state rather than the animation. The rest
  // geometry is taken here too, with everything finished, since every apparent
  // scale in the table is measured against it.
  const res = await page.goto(url, { waitUntil: 'networkidle0', timeout: 60_000 });
  if (!res?.ok()) throw new Error(`${url} responded ${res ? res.status() : 'with no response'}`);
  await page.evaluate(() => document.fonts.ready);
  await settle();

  const armed = await page.evaluate(() => ({
    js: document.documentElement.classList.contains('js'),
    isIn: document.querySelector('.flavors').classList.contains('is-in'),
  }));
  console.log(`html.js=${armed.js}   .flavors.is-in on load=${armed.isIn}   ${width}x${height}\n`);

  const rest = await page.evaluate((targets) => {
    for (const a of flavorsAnimations()) a.finish();
    const out = {};
    for (const [name, sel] of targets) {
      const r = document.querySelector(sel).getBoundingClientRect();
      out[name] = { w: r.width, h: r.height, x: r.left, y: r.top };
    }
    return out;
  }, TARGETS);

  // Every pass from here on gets the section armed and left that way, so the
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
    await settle();

    const count = await page.evaluate((ms) => {
      document.querySelector('.flavors').classList.add('is-in');
      // flavorsAnimations() resolves style itself, so the transitions this
      // class starts exist by the time they are being paused.
      const anims = flavorsAnimations();
      for (const a of anims) { a.pause(); a.currentTime = ms; }
      return anims.length;
    }, t);

    await settle();

    const state = await page.evaluate((targets) => {
      const out = {};
      for (const [name, sel] of targets) {
        const el = document.querySelector(sel);
        const r = el.getBoundingClientRect();
        out[name] = {
          w: r.width, h: r.height, x: r.left, y: r.top,
          o: Number(getComputedStyle(el).opacity),
        };
      }
      return out;
    }, TARGETS);

    const index = await nextIndex();
    const out = resolve(OUT_DIR, `screenshot-${index}-flavors-${t}ms.png`);
    await page.screenshot({ path: out, fullPage: false });

    rows.push({ t, count, out, state });
  }

  for (const row of rows) {
    console.log(`${row.out.replace(ROOT + '/', '')}   t=${row.t}ms   ${row.count} transitions running`);
    for (const [name] of TARGETS) {
      const s = row.state[name];
      const r = rest[name];
      const scale = s.w / r.w;
      const dx = s.x - r.x;
      const dy = s.y - r.y;
      console.log(
        `    ${name.padEnd(9)} opacity ${s.o.toFixed(3)}` +
        `   scale ${scale.toFixed(3)}` +
        `   offset ${dx >= 0 ? ' ' : ''}${dx.toFixed(1)}, ${dy >= 0 ? ' ' : ''}${dy.toFixed(1)}`,
      );
    }
    console.log('');
  }

  if (problems.length) {
    console.log('Page reported problems:');
    for (const p of [...new Set(problems)]) console.log(`  - ${p}`);
  }
} catch (err) {
  console.error(`shoot-flavors failed: ${err.message}`);
  process.exitCode = 1;
} finally {
  await browser.close();
}
