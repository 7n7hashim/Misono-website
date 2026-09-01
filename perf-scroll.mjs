/* Frame cost during scrolling, which is where this site's motion lives.

   Everything on these pages that moves is driven by one rAF loop per page
   writing custom properties, with the transforms derived in CSS — so the
   thing to measure is not "is there jank" in the abstract but how long the
   main thread is busy per frame while the pinned sections are running.

     node perf-scroll.mjs [baseline|current]

   Runs with a 4x CPU slowdown, which is roughly a mid-range Android, and
   scrolls each page end to end at a fixed rate. Reports frames over 16.7ms
   (a missed 60Hz frame) and over 50ms (a long task), plus the worst frame.

   The comparison target is _baseline-*.html, the pre-optimisation pages. */
import puppeteer from 'puppeteer';

const BASE = 'http://localhost:3001';
const PAGES = ['index', 'menu', 'about', 'contact'];

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'], protocolTimeout: 300000 });

async function run(url, label) {
  const p = await browser.newPage();
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  const cdp = await p.createCDPSession();
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await p.goto(url, { waitUntil: 'networkidle0', timeout: 90000 });
  /* Let deferred photography settle first: a frame spent decoding an image
     is not a frame spent on the animation, and mixing them measures the
     wrong thing. */
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += innerHeight) {
      scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 60));
    }
    scrollTo({ top: 0, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 900));
  });

  const stats = await p.evaluate(async () => {
    const frames = [];
    let last = performance.now();
    let stop = false;
    (function tick() {
      const now = performance.now();
      frames.push(now - last);
      last = now;
      if (!stop) requestAnimationFrame(tick);
    }());
    /* A steady crawl rather than a jump: the pinned sections map scroll
       position to state, so stepping a viewport at a time would skip most
       of the work they do. */
    const total = document.body.scrollHeight - innerHeight;
    const STEP = 24;
    for (let y = 0; y <= total; y += STEP) {
      scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => requestAnimationFrame(r));
    }
    stop = true;
    await new Promise((r) => setTimeout(r, 100));
    const f = frames.slice(3);                       // drop the loop's own warm-up
    f.sort((a, b) => a - b);
    const at = (q) => f[Math.min(f.length - 1, Math.floor(f.length * q))];
    return {
      frames: f.length,
      median: at(0.5), p95: at(0.95), worst: f[f.length - 1],
      over16: f.filter((x) => x > 16.7).length,
      over50: f.filter((x) => x > 50).length,
    };
  });

  await p.close();
  return stats;
}

console.log('page'.padEnd(10), 'build'.padEnd(9), 'frames'.padStart(7), 'median'.padStart(7), 'p95'.padStart(7), 'worst'.padStart(7), '>16.7ms'.padStart(9), '>50ms'.padStart(7));
console.log('-'.repeat(72));
/* The `before` column reads `_baseline-*.html`, copies of the pre-optimisation
   pages. Those were tidied away, so the fetch 404s, the scroll runs over an
   error body, no frames are collected and `at()` returns undefined — which
   surfaces as a TypeError on .toFixed() rather than as "the baseline is
   missing". Same class of stale-baseline failure compare-layout.mjs was cured
   of; it exits 2 and says so. Here the row is simply skipped. */
for (const page of PAGES) {
  for (const [label, url] of [
    ['before', `${BASE}/_baseline-${page}.html`],
    ['after', `${BASE}/${page === 'index' ? '' : page + '.html'}`],
  ]) {
    const probe = await fetch(url).catch(() => null);
    if (!probe || !probe.ok) { console.log(page.padEnd(10), label.padEnd(9), '  — not present, skipped'); continue; }
    const s = await run(url, label);
    console.log(
      page.padEnd(10), label.padEnd(9),
      String(s.frames).padStart(7),
      s.median.toFixed(1).padStart(7), s.p95.toFixed(1).padStart(7), s.worst.toFixed(1).padStart(7),
      `${((s.over16 / s.frames) * 100).toFixed(1)}%`.padStart(9),
      String(s.over50).padStart(7),
    );
  }
}
await browser.close();
