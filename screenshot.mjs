// Full-page screenshots into "temporary screenshots/", auto-incremented so
// nothing is ever overwritten.
//
// Usage: node screenshot.mjs <url> [label] [viewport]
//   node screenshot.mjs http://localhost:3000
//   node screenshot.mjs http://localhost:3000 hero
//   node screenshot.mjs http://localhost:3000 hero mobile
//
// viewport: desktop (default) | tablet | mobile | WIDTHxHEIGHT
import puppeteer from 'puppeteer';
import { mkdir, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)));
const OUT_DIR = resolve(ROOT, 'temporary screenshots');

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1 },
  tablet: { width: 820, height: 1180, deviceScaleFactor: 1 },
  mobile: { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
};

const [, , urlArg, labelArg, viewportArg] = process.argv;
const url = urlArg ?? 'http://localhost:3000';

if (url.startsWith('file://')) {
  console.error('Refusing to screenshot a file:// URL — start `node serve.mjs` and use http://localhost:3000');
  process.exit(1);
}

function parseViewport(arg) {
  if (!arg) return VIEWPORTS.desktop;
  if (VIEWPORTS[arg]) return VIEWPORTS[arg];
  const m = /^(\d+)x(\d+)$/.exec(arg);
  if (m) return { width: Number(m[1]), height: Number(m[2]), deviceScaleFactor: 1 };
  console.error(`Unknown viewport "${arg}". Use desktop, tablet, mobile, or WIDTHxHEIGHT.`);
  process.exit(1);
}

// Highest existing screenshot-N wins, so parallel labels never collide.
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

const viewport = parseViewport(viewportArg);
const label = labelArg ? `-${labelArg.replace(/[^a-zA-Z0-9._-]+/g, '-')}` : '';
const index = await nextIndex();
const outPath = resolve(OUT_DIR, `screenshot-${index}${label}.png`);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-color-profile=srgb', '--hide-scrollbars'],
});

try {
  const page = await browser.newPage();
  await page.setViewport(viewport);

  const problems = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') problems.push(`console: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
  page.on('requestfailed', (req) => problems.push(`requestfailed: ${req.url()}`));

  const response = await page.goto(url, { waitUntil: 'networkidle0', timeout: 60_000 });
  if (!response?.ok()) {
    throw new Error(`${url} responded ${response ? response.status() : 'with no response'}`);
  }

  // Webfonts must be resolved, and the Tailwind Play CDN compiles styles at
  // runtime — wait for both rather than guessing with a fixed sleep.
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );

  await page.screenshot({ path: outPath, fullPage: true });

  const { width, height } = viewport;
  console.log(`Saved ${outPath.replace(ROOT + '/', '')}  (${width}x${height}, full page)`);
  if (problems.length) {
    console.log('\nPage reported problems:');
    for (const p of [...new Set(problems)]) console.log(`  - ${p}`);
  }
} catch (err) {
  console.error(`Screenshot failed: ${err.message}`);
  process.exitCode = 1;
} finally {
  await browser.close();
}
