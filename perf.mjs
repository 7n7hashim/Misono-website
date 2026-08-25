/* Performance harness. Loads every page in Chrome, records what actually
   crosses the wire and the three metrics that decide how fast the site
   feels, then prints one table.

   Usage:  node perf.mjs [baseline|after] [--fast]
             baseline / after  — label for the saved JSON, so the two runs
                                 can be diffed by `node perf.mjs --diff`
             --fast            — skip the throttled mobile pass

   Two passes per page:
     desktop  1440x900, no throttling, DPR 1
     mobile    390x844, Fast 3G + 4x CPU slowdown, DPR 3

   The mobile pass is the one that matters: it is where byte count turns
   into seconds. LCP on an unthrottled desktop is dominated by decode and
   hides a 600KB hero completely. */
import puppeteer from 'puppeteer';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:3001';
const PAGES = ['/', '/menu.html', '/about.html', '/contact.html'];
const OUT = 'perf-results';

const PROFILES = {
  desktop: { width: 1440, height: 900, dpr: 1, net: null, cpu: 1 },
  mobile: {
    width: 390, height: 844, dpr: 3, cpu: 4,
    // Fast 3G: the profile Lighthouse grades mobile on.
    net: { downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8, latency: 150 },
  },
};

const kind = (u, type) => {
  if (/\.(avif)$/i.test(u)) return 'img:avif';
  if (/\.(webp)$/i.test(u)) return 'img:webp';
  if (/\.(jpe?g|png|gif)$/i.test(u)) return 'img:legacy';
  if (/\.(woff2?|ttf|otf)$/i.test(u) || type === 'font') return 'font';
  if (/fonts\.googleapis/.test(u)) return 'font-css';
  if (type === 'document') return 'html';
  if (type === 'stylesheet') return 'css';
  if (type === 'script') return 'js';
  return 'other';
};

async function measure(browser, path, profileName) {
  const p = PROFILES[profileName];
  const page = await browser.newPage();
  await page.setViewport({ width: p.width, height: p.height, deviceScaleFactor: p.dpr });
  const cdp = await page.createCDPSession();
  await cdp.send('Network.enable');
  await cdp.send('Network.clearBrowserCache');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  if (p.net) await cdp.send('Network.emulateNetworkConditions', { offline: false, ...p.net });
  if (p.cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: p.cpu });

  const reqs = new Map();
  page.on('response', (r) => reqs.set(r.url(), { type: r.request().resourceType(), status: r.status() }));
  cdp.on('Network.loadingFinished', () => {});

  const sizes = new Map();
  cdp.on('Network.responseReceived', (e) => sizes.set(e.requestId, { url: e.response.url, type: e.type }));
  cdp.on('Network.loadingFinished', (e) => {
    const s = sizes.get(e.requestId);
    if (s) s.bytes = e.encodedDataLength;
  });

  const t0 = Date.now();
  await page.goto(BASE + path, { waitUntil: 'load', timeout: 120000 });
  const loadMs = Date.now() - t0;

  // Give LCP/CLS a moment to settle after load, without scrolling —
  // this measures the initial view, which is what the user waits for.
  await new Promise((r) => setTimeout(r, 2500));

  const metrics = await page.evaluate(() => new Promise((resolve) => {
    const out = { lcp: 0, lcpEl: '', cls: 0, fcp: 0, longTasks: 0, tbt: 0 };
    const nav = performance.getEntriesByType('navigation')[0];
    out.ttfb = nav ? Math.round(nav.responseStart) : 0;
    out.domContentLoaded = nav ? Math.round(nav.domContentLoadedEventEnd) : 0;
    for (const e of performance.getEntriesByType('paint')) {
      if (e.name === 'first-contentful-paint') out.fcp = Math.round(e.startTime);
    }
    try {
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) {
          out.lcp = Math.round(e.startTime);
          out.lcpEl = e.element ? (e.element.className || e.element.tagName) : (e.url || '');
          (out.lcpAll ||= []).push(Math.round(e.startTime) + ' ' + String(out.lcpEl).slice(0, 40));
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) if (!e.hadRecentInput) out.cls += e.value;
      }).observe({ type: 'layout-shift', buffered: true });
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) { out.longTasks++; out.tbt += Math.max(0, e.duration - 50); }
      }).observe({ type: 'longtask', buffered: true });
    } catch {}
    setTimeout(() => { out.cls = Math.round(out.cls * 10000) / 10000; out.tbt = Math.round(out.tbt); resolve(out); }, 400);
  }));

  const byKind = {};
  let total = 0, count = 0;
  for (const s of sizes.values()) {
    if (s.bytes == null) continue;
    const k = kind(s.url, s.type);
    byKind[k] = (byKind[k] ?? 0) + s.bytes;
    total += s.bytes;
    count++;
  }

  await page.close();
  return { path, profile: profileName, total, count, byKind, loadMs, ...metrics };
}

const label = process.argv[2] ?? 'run';
const fast = process.argv.includes('--fast');

if (process.argv.includes('--diff')) {
  const a = JSON.parse(readFileSync(`${OUT}/baseline.json`, 'utf8'));
  const b = JSON.parse(readFileSync(`${OUT}/after.json`, 'utf8'));
  const key = (r) => `${r.path}|${r.profile}`;
  const mb = new Map(b.map((r) => [key(r), r]));
  console.log('\n page                profile    bytes before → after        Δ        LCP before → after     CLS');
  console.log(' ' + '─'.repeat(96));
  for (const r of a) {
    const s = mb.get(key(r)); if (!s) continue;
    const pct = ((s.total - r.total) / r.total) * 100;
    console.log(
      ` ${r.path.padEnd(16)} ${r.profile.padEnd(9)} ${(r.total / 1024).toFixed(0).padStart(6)}K → ${(s.total / 1024).toFixed(0).padStart(6)}K  ${(pct >= 0 ? '-' : '+') + Math.abs(pct).toFixed(1).padStart(5)}%   ${String(r.lcp).padStart(6)} → ${String(s.lcp).padStart(6)}ms   ${r.cls} → ${s.cls}`,
    );
  }
  process.exit(0);
}

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const results = [];
const profiles = fast ? ['desktop'] : ['desktop', 'mobile'];
for (const prof of profiles) {
  for (const path of PAGES) {
    const r = await measure(browser, path, prof);
    results.push(r);
    const parts = Object.entries(r.byKind).sort((x, y) => y[1] - x[1])
      .map(([k, v]) => `${k} ${(v / 1024).toFixed(0)}K`).join('  ');
    console.log(
      `${prof.padEnd(8)} ${r.path.padEnd(15)} ${(r.total / 1024).toFixed(0).padStart(6)}K / ${String(r.count).padStart(3)} req` +
      `  LCP ${String(r.lcp).padStart(5)}ms  FCP ${String(r.fcp).padStart(5)}ms  CLS ${String(r.cls).padStart(6)}  TBT ${String(r.tbt).padStart(4)}ms  load ${String(r.loadMs).padStart(5)}ms`,
    );
    console.log(`${''.padEnd(9)}${''.padEnd(15)} ${parts}`);
    if (r.lcpEl) console.log(`${''.padEnd(9)}${''.padEnd(15)} LCP element: ${String(r.lcpEl).slice(0, 80)}`);
  }
}
await browser.close();

if (!existsSync(OUT)) mkdirSync(OUT);
writeFileSync(`${OUT}/${label}.json`, JSON.stringify(results, null, 2));
console.log(`\nSaved → ${OUT}/${label}.json`);
