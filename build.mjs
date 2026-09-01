/* Production build. Emits dist/ — the files the site actually ships.

     node build.mjs            build dist/
     node build.mjs --serve    build, then serve it with PROD headers on :3002

   The source files stay exactly as they are, and that is the point:
   about.html and contact.html are roughly half CSS comments by weight, and
   those comments are this project's record of what was measured and why.
   They are not recoverable from the CSS and must not be deleted from
   source. They simply have no business crossing the wire.

   dist/ also carries ONLY what a page references. The repository keeps
   ~20MB of reference captures and comps in assets/img/ (heroinspo.png,
   'map inspo.png', 'scroll through for about.png' and so on) plus a 6.6MB
   _archive/ that includes eight MP4s from the previous build of the site.
   None of it is linked from any page, all of it sits in a served directory,
   and deploying the project root ships every byte of it. The copy list here
   is derived from the markup, so that cannot happen by accident.

   Precompressed .br and .gz siblings are written next to every text file,
   for hosts that serve them directly (Netlify, Cloudflare, nginx with
   gzip_static / brotli_static). serve.mjs compresses on the fly instead, so
   these are belt and braces rather than a requirement. */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { gzipSync, brotliCompressSync, constants as z } from 'node:zlib';
import { execFileSync, spawn } from 'node:child_process';

const OUT = 'dist';
const PAGES = ['index.html', 'menu.html', 'about.html', 'contact.html'];

/* ------------------------------------------------------------- stripping */

/* Comments only. Deliberately NOT a minifier: collapsing whitespace or
   reordering declarations in a stylesheet built on measured values — and on
   a specificity order that has already bitten this project twice — risks a
   silent visual change to save bytes that brotli would have found anyway.
   Comments are about half of these files; whitespace is a couple of percent
   once compressed.

   Verified safe by scan before writing this: no CSS comment delimiter
   appears inside any string, url() or regex literal on any of the four
   pages, so a plain regex pass cannot corrupt a value. Re-run that scan if
   a page ever grows one. */
function stripComments(html) {
  const styles = [];
  const scripts = [];
  /* Pull the code blocks out first, so the HTML-comment pass cannot reach
     inside them and a stray "<!--" in a script cannot swallow markup. */
  html = html.replace(/<style>([\s\S]*?)<\/style>/g, (_m, css) => {
    styles.push(css);
    return ` STYLE${styles.length - 1} `;
  });
  html = html.replace(/<script>([\s\S]*?)<\/script>/g, (_m, js) => {
    scripts.push(js);
    return ` SCRIPT${scripts.length - 1} `;
  });

  html = html.replace(/<!--[\s\S]*?-->/g, '');
  /* Drop indentation in front of tags and collapse the blank lines the
     removals leave. Text content is untouched: only leading runs of
     whitespace that are immediately followed by a tag. */
  html = html.replace(/^[ \t]+(?=<)/gm, '').replace(/\n{3,}/g, '\n\n');

  const cssPass = (s) => s
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]+/gm, '  ')
    .replace(/^\s*\n/gm, '');
  const jsPass = (s) => s
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
    .replace(/^\s*\n/gm, '');

  html = html.replace(/ STYLE(\d+) /g, (_m, i) => `<style>${cssPass(styles[+i])}</style>`);
  html = html.replace(/ SCRIPT(\d+) /g, (_m, i) => `<script>${jsPass(scripts[+i])}</script>`);
  return html;
}

/* --------------------------------------------------------------- copying */

/* Every asset URL a page actually names — src, href, srcset, imagesrcset
   and url(). Anything not in here does not ship. */
function referenced(html) {
  const out = new Set();
  const add = (u) => {
    if (!u) return;
    u = u.trim().split('#')[0].split('?')[0];
    if (!u || /^(https?:|data:|mailto:|tel:|#)/.test(u)) return;
    if (/\.html$/.test(u)) return;                   // pages are copied explicitly
    const dec = decodeURIComponent(u.replace(/^\.?\//, ''));
    /* Decode LAST and re-check: the grain filters reference themselves as
       url("%23n") inside an inline SVG data URI, and decoding that before
       the fragment test turns a same-document reference into a request for
       a file called "#n". */
    if (dec.startsWith('#')) return;
    out.add(dec);
  };
  for (const m of html.matchAll(/\ssrc="([^"]+)"/g)) add(m[1]);
  for (const m of html.matchAll(/\shref="([^"]+)"/g)) add(m[1]);
  for (const m of html.matchAll(/(?:srcset|imagesrcset)="([^"]+)"/g)) {
    for (const c of m[1].split(',')) add(c.trim().split(/\s+/)[0]);
  }
  for (const m of html.matchAll(/url\((['"]?)([^)'"]+)\1\)/g)) add(m[2]);
  return out;
}

const COMPRESS = /\.(html|css|js|mjs|json|svg|txt|webmanifest|xml)$/i;
function write(rel, body) {
  const p = join(OUT, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, body);
  if (COMPRESS.test(rel) && body.length >= 1024) {
    writeFileSync(p + '.br', brotliCompressSync(body, {
      params: { [z.BROTLI_PARAM_QUALITY]: 11, [z.BROTLI_PARAM_SIZE_HINT]: body.length },
    }));
    writeFileSync(p + '.gz', gzipSync(body, { level: 9 }));
  }
}

/* ------------------------------------------------------------------ main */

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const assets = new Set();
const rows = [];

for (const page of PAGES) {
  const src = readFileSync(page, 'utf8');
  const built = stripComments(src);
  for (const a of referenced(built)) assets.add(a);
  const buf = Buffer.from(built);
  write(page, buf);
  rows.push([page, Buffer.byteLength(src), buf.length, statSync(join(OUT, page + '.br')).size]);
}

/* A web manifest names its icons in JSON, which `referenced()` — an HTML
   attribute scanner — cannot see. Left alone, the 192 and 512 tiles are the
   one part of the icon set that never reaches dist, and nothing reports it:
   the manifest copies fine and the pages all render, so the failure only
   shows up when someone installs the site to a home screen. Follow them. */
for (const a of [...assets]) {
  if (!/\.webmanifest$/.test(a) || !existsSync(a)) continue;
  let icons = [];
  try { icons = JSON.parse(readFileSync(a, 'utf8')).icons ?? []; }
  catch { console.log(`WARNING: ${a} is not valid JSON — its icons will not ship`); continue; }
  for (const i of icons) {
    if (i.src) assets.add(decodeURIComponent(i.src.replace(/^\.?\//, '')));
  }
}

let assetBytes = 0;
const missing = [];
for (const a of [...assets].sort()) {
  if (!existsSync(a)) { missing.push(a); continue; }
  const body = readFileSync(a);
  write(a, body);
  assetBytes += body.length;
}

console.log('page'.padEnd(14), 'source'.padStart(9), 'built'.padStart(9), 'brotli'.padStart(8), '   markup dropped');
console.log('-'.repeat(62));
for (const [p, s, b, g] of rows) {
  console.log(p.padEnd(14), (s / 1024).toFixed(1).padStart(8) + 'K', (b / 1024).toFixed(1).padStart(8) + 'K',
              (g / 1024).toFixed(1).padStart(7) + 'K', `   ${(100 - (b / s) * 100).toFixed(0)}%`);
}
console.log(`\n${assets.size} referenced assets copied, ${(assetBytes / 1024 / 1024).toFixed(2)}MB`);
if (missing.length) console.log('MISSING (referenced but not on disk):', missing);

/* State what did NOT ship, so the number is visible rather than assumed. */
const du = (d) => { try { return +execFileSync('du', ['-sk', d]).toString().split('\t')[0] * 1024; } catch { return 0; } };
const repo = du('assets') + du('_archive') + du('brand_assets');
console.log(`excluded: ${((repo - assetBytes) / 1024 / 1024).toFixed(1)}MB of reference comps, _archive and unreferenced originals`);
console.log(`dist/ total ${(du(OUT) / 1024 / 1024).toFixed(2)}MB, including the .br/.gz siblings`);

if (process.argv.includes('--serve')) {
  console.log('\nserving dist/ with PROD headers on http://localhost:3002');
  spawn('node', ['serve.mjs'], { env: { ...process.env, PROD: '1', PORT: '3002', SERVE_ROOT: resolve(OUT) }, stdio: 'inherit' });
}
