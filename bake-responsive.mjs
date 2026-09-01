/* Responsive derivatives for every photograph the site actually ships.
   Reads img-sizes.json (written by `node measure-img-sizes.mjs --json`,
   which measures what the layout PAINTS rather than guessing) and emits,
   per image, a short ladder of widths in AVIF and WebP under assets/img/r/.
   The originals are never touched: they stay as the <img src> fallback and
   as the input every other bake script already expects.

     node bake-responsive.mjs              bake what is missing or stale
     node bake-responsive.mjs --force      re-bake everything
     node bake-responsive.mjs --report     print the table, encode nothing

   Run from the project root — puppeteer resolves from node_modules/.

   Four things here are load-bearing:

   1. AVIF is encoded 10-BIT (yuv420p10le) from 8-bit sources on purpose.
      It costs almost nothing and it is what keeps the near-black fields
      from banding — contact-hero is 47% shadow and about-craft is a lit
      core in a dark room, and those are exactly the frames an 8-bit
      re-encode ruins. 4:2:0 is correct rather than a compromise: the
      sources are already 4:2:0 JPEGs, so no chroma exists to lose.

   2. Every variant is MEASURED against its own lanczos-resized source and
      re-encoded at a lower CRF if it misses its PSNR floor. A fixed
      quality setting across 28 photographs graded to four different
      luminance bands is how one frame ends up soft.

   3. Δmean is printed beside PSNR because this site's grading is specified
      in mean luminance — the chapters band is 62-84, the experience band
      90-108. An encoder that shifts levels would move a frame out of its
      band silently, and PSNR alone would not show it.

   4. duck-plate is WEBP-ONLY, and that is not an oversight. It is the
      one alpha cutout on the site, ffmpeg's AVIF path cannot carry an
      alpha channel here (libsvtav1 has no gray encoder for the aux
      stream), and the failure is SILENT — the encode succeeds and returns
      a fully opaque image. Verified: alpha 30.4% transparent in, 0.0% out.
      If a future ffmpeg grows the capability, check the alpha histogram
      of the result before believing it. */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import puppeteer from 'puppeteer';

const OUTDIR = 'assets/img/r';
const TMP = 'assets/img/.bake-tmp';
const FORCE = process.argv.includes('--force');
const REPORT = process.argv.includes('--report');

/* Role decides the quality floor. A full-viewport photograph behind the
   page's one heading is looked at; a 400px marquee tile sliding past at
   speed is not. Both still have to be indistinguishable from the source at
   the size they are painted — the roles differ in how much margin is kept
   on top of that, not in whether the bar is met. */
const ROLES = {
  hero:    { psnr: 43.0 },   /* full-viewport, and the LCP on three pages */
  feature: { psnr: 41.5 },   /* framed photographs inside a composition */
  tile:    { psnr: 39.5 },   /* marquee tiles, ~400px, sliding past */
};

/* Searched, not fixed. The same CRF across 28 photographs graded to four
   different luminance bands lands each of them somewhere different: on this
   set, hitting one PSNR floor takes CRF 10 on the brightest frame and CRF 30
   on the darkest. A coarse grid + binary search finds the cheapest rung that
   clears the floor in three encodes rather than seven. */
const CRF_GRID = [10, 14, 18, 22, 26, 30, 34];
const WEBP_GRID = [0.94, 0.90, 0.86, 0.82, 0.78, 0.74, 0.70];

const ROLE_OF = {
  'assets/img/hero-omakase-1717.jpg': 'hero',
  'assets/img/about-craft.jpg': 'hero',
  'assets/img/contact-hero.jpg': 'hero',
  'assets/img/reserve-interior.jpg': 'hero',   // full-bleed, on all four pages
  /* NOT hero, though they are full-bleed. Both are daylight aerials of a
     whole district — the highest-frequency content on the site — so a hero
     floor puts the top rung at 609K against a 633K original, i.e. buys
     nothing. They are also flagged placeholders in the markup. */
  'assets/img/locale-mombasa.jpg': 'feature',
  'assets/img/locale-nairobi.jpg': 'feature',
  'assets/img/about-plate.jpg': 'hero',        // full-bleed, nothing on it
};
const roleFor = (src) => ROLE_OF[src] ?? (src.includes('/gallery/') ? 'tile' : 'feature');

/* WebP only. See note 4. */
const ALPHA = new Set(['assets/img/duck-plate.webp']);

const sh = (cmd, args) => execFileSync(cmd, args, { maxBuffer: 1 << 30 });

/* ---------------------------------------------------------------- ladder */

/* Built from the widths the layout was OBSERVED to ask for, not from a
   geometric series off the top. Two of these images are painted wider on a
   phone than on a laptop (the chapters and experience sections stack), so a
   series from the desktop maximum would ship a blurry handset. */
function ladder(observed, natural) {
  const seen = observed.filter((n) => n > 0);
  if (!seen.length) return [natural];

  /* Built from the widths the layout was OBSERVED to ask for, clustered —
     NOT as a geometric series from the top. Two reasons, both measured:

     - Some of these frames are painted WIDER on a phone than on a laptop,
       because the chapters and experience sections stack. A series from the
       desktop maximum ships a blurry handset.
     - A rung only helps if it sits just above a real request. The locale
       bands are asked for at 998 device px by a 3x phone; a geometric
       ladder put its nearest rung at 1240 and the phone fetched 274KB to
       paint 998 pixels. Clustering the actual needs puts a rung at 1024 and
       the same phone fetches ~190KB — same quality, 30% fewer bytes. Over-
       fetch, not quantisation, was the thing worth fixing there.

     1.18 is the cluster ratio: any two needs closer than that would produce
     files a reader could never tell apart. Five rungs is the target; see the
     thinning rule below for when a sixth and seventh earn their place. */
  const caps = [...new Set(seen.map((n) => Math.min(natural, Math.ceil(n * 1.02 / 10) * 10)))].sort((a, b) => b - a);
  let keep = [];
  for (const w of caps) {
    if (!keep.length || w < keep[keep.length - 1] / 1.18) keep.push(w);
  }
  /* Thin by GAP, not by position. The old rule spliced from the middle
     until five remained, which is right only when the demand is narrow.
     lis-hero is asked for at 101.4vw on index.html and 15.2vw on menu.html
     — a 6.1x span — and middle-thinning removed exactly the rungs menu.html
     needs, leaving [280, 350, 1210, 1450, 1717]: a 3.46x hole where every
     other ladder on the site sits between 1.2 and 2.1. A 390px phone then
     fetched the 1210 rung, 36KB, to paint a 450px frame, and it did it at
     fetchpriority=high on that page's LCP path.

     So: drop whichever rung leaves the smallest hole behind, keep both ends
     always, and stop early if the cheapest remaining removal would open a
     hole wider than GAP_MAX. Five is still the target; seven is the ceiling
     for an image whose demand genuinely spans that far. Rungs cost disk and
     bake time, not reader bytes — a reader still downloads exactly one. */
  const GAP_MAX = 1.60, SOFT = 5, HARD = 7;
  keep = keep.filter((w) => w >= 240).sort((a, b) => a - b);
  while (keep.length > SOFT) {
    let bi = -1, best = Infinity;
    for (let i = 1; i < keep.length - 1; i++) {
      const gap = keep[i + 1] / keep[i - 1];      // the hole removing i would open
      if (gap < best) { best = gap; bi = i; }
    }
    if (bi < 0) break;
    if (keep.length <= HARD && best > GAP_MAX) break;
    keep.splice(bi, 1);
  }
  return keep;
}

/* ------------------------------------------------------------- measuring */

/* Read a decoded file as raw planes at its OWN size. The `scale` filter is
   deliberately absent, and its absence is the whole reason these numbers
   mean anything: an earlier version passed scale=W:H even when the file was
   already W x H, and swscale's identity path is not bit-exact. That
   resampling error swamped the compression error and pinned every
   measurement near 39dB regardless of CRF — a flat PSNR-vs-CRF curve is the
   symptom, and it looks like "the encoder is very good" rather than like a
   broken gauge. If this curve ever goes flat again, suspect the metric
   before the encoder. */
const plane = (f, fmt) => sh('ffmpeg', ['-v', 'error', '-i', f, '-vf', `format=${fmt}`, '-f', 'rawvideo', '-']);

function psnrOf(a, b, stride, offset, weight) {
  let se = 0, n = 0, maxd = 0, sa = 0, sb = 0;
  for (let i = offset; i < Math.min(a.length, b.length); i += stride) {
    const w = weight ? weight[i] : 1;
    if (!w) continue;
    const d = a[i] - b[i];
    se += d * d; n++; sa += a[i]; sb += b[i];
    if (Math.abs(d) > maxd) maxd = Math.abs(d);
  }
  const mse = n ? se / n : 0;
  return { psnr: mse === 0 ? 99 : 10 * Math.log10(65025 / mse), maxd, dMean: n ? (sb - sa) / n : 0, mean: n ? sa / n : 0 };
}

/* Luma, because that is what CRF controls and what the eye weights most.
   Chroma is reported separately rather than folded in: the sources are
   already 4:2:0 JPEGs, so a 4:2:0 re-encode has almost no chroma left to
   lose, and mixing it into one number only dilutes the signal. */
function compare(refFile, encFile, alpha) {
  if (alpha) {
    /* LUMA, over FULLY OPAQUE pixels only. Two corrections are folded in
       here and neither was visible by looking at the plate:

       - Chrome's canvas premultiplies on encode, so every partially
         transparent pixel — the anti-aliased rim, 0.84% of this frame —
         differs from the reference by construction. Weighting by alpha
         rather than gating on it let that rim dominate and reported
         34.8dB on a plate that is pixel-identical wherever it is solid.
       - Comparing RGB rather than luma folded WebP's own 4:2:0 chroma loss
         into the number the quality search reads: 36.1dB against 42.1dB
         for the same file. That 6dB gap pinned this one image at q0.94 and
         saved nothing at all against the original.

       The silhouette is the part that actually has to survive, and it is
       checked separately and strictly, on the alpha channel. */
    const a = plane(refFile, 'rgba'), b = plane(encFile, 'rgba');
    const L = (p, i) => 0.2126 * p[i] + 0.7152 * p[i + 1] + 0.0722 * p[i + 2];
    let se = 0, n = 0, maxd = 0, sa = 0, sb = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i += 4) {
      if (a[i + 3] !== 255) continue;
      const d = L(a, i) - L(b, i);
      se += d * d; n++; sa += L(a, i); sb += L(b, i);
      if (Math.abs(d) > maxd) maxd = Math.abs(d);
    }
    const mse = n ? se / n : 0;
    const al = psnrOf(a, b, 4, 3, null);
    return {
      psnr: mse === 0 ? 99 : 10 * Math.log10(65025 / mse),
      maxd: Math.round(maxd), dMean: n ? (sb - sa) / n : 0, mean: n ? sa / n : 0,
      opaque: n, alphaPsnr: al.psnr, alphaMaxd: al.maxd,
    };
  }
  return psnrOf(plane(refFile, 'gray'), plane(encFile, 'gray'), 1, 0, null);
}

/* -------------------------------------------------------------- encoders */

function encodeAvif(srcPng, out, crf) {
  sh('ffmpeg', ['-y', '-v', 'error', '-i', srcPng, '-c:v', 'libsvtav1',
    '-crf', String(crf), '-preset', '4', '-pix_fmt', 'yuv420p10le',
    '-svtav1-params', 'tune=0', '-frames:v', '1', out]);
}

let page = null, browser = null;
async function encodeWebp(srcPng, out, q) {
  const b64 = readFileSync(srcPng).toString('base64');
  const data = await page.evaluate(async (src, q) => {
    const img = new Image(); img.src = src; await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    /* Already at the target size and lanczos-scaled by ffmpeg — this draw
       is 1:1, so no resampling happens here at all. */
    c.getContext('2d', { alpha: true }).drawImage(img, 0, 0);
    return c.toDataURL('image/webp', q).split(',')[1];
  }, 'data:image/png;base64,' + b64, q);
  writeFileSync(out, Buffer.from(data, 'base64'));
}

/* ------------------------------------------------------------------ main */

const spec = JSON.parse(readFileSync('img-sizes.json', 'utf8'));
if (!existsSync(OUTDIR)) mkdirSync(OUTDIR, { recursive: true });
if (!existsSync(join(OUTDIR, 'gallery'))) mkdirSync(join(OUTDIR, 'gallery'), { recursive: true });
if (!existsSync(TMP)) mkdirSync(TMP, { recursive: true });

const jobs = spec.map((s) => {
  const role = roleFor(s.src);
  return { ...s, role, widths: ladder(s.devAll ?? Object.values(s.dev), s.nw) };
});

if (REPORT) {
  for (const j of jobs) console.log(`${j.src.replace('assets/img/', '').padEnd(32)} ${j.role.padEnd(8)} ${j.nw}px → [${j.widths.join(', ')}]`);
  process.exit(0);
}

browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
page = await browser.newPage();

const manifest = {};
let srcTotal = 0, outTotal = 0;
const problems = [];
const pruned = [];

for (const j of jobs) {
  const stem = j.src.replace(/^assets\/img\//, '').replace(/\.[a-z0-9]+$/i, '');
  const cfg = ROLES[j.role];
  const alpha = ALPHA.has(j.src);
  /* sizesByPage MUST be carried through. `sizes` is per PAGE, not per file —
     lis-hero is a full-viewport hero on index.html and a 15vw framed
     photograph on menu.html — and apply-responsive-markup.mjs reads its
     hint from THIS manifest, not from img-sizes.json. Dropping the field
     here silently defeated the per-page fix on every re-run of the
     pipeline: menu.html was handed index's 101.4vw and preloaded a 1210px
     rung, at fetchpriority=high, to paint a frame 150px wide. */
  const entry = { src: j.src, sizes: j.sizes, sizesByPage: j.sizesByPage, width: j.nw, height: j.nh, role: j.role, avif: [], webp: [] };
  const srcBytes = statSync(j.src).size;
  srcTotal += srcBytes;
  const line = [];

  for (const w of j.widths) {
    const h = Math.round(j.nh * w / j.nw / 2) * 2;
    const refPng = join(TMP, `${stem.replace(/\//g, '_')}-${w}.png`);
    if (FORCE || !existsSync(refPng)) {
      sh('ffmpeg', ['-y', '-v', 'error', '-i', j.src, '-vf',
        `scale=${w}:${h}:flags=lanczos${alpha ? ',format=rgba' : ''}`, refPng]);
    }

    /* Binary search the grid for the CHEAPEST setting that still clears the
       floor. Both grids run best-quality-first, so `lo` is always known-good
       and the answer is the last index that passed. */
    async function search(grid, encode) {
      let lo = 0, hi = grid.length - 1, best = null;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        await encode(grid[mid]);
        const m = compare(refPng, encode.out, alpha);
        if (m.psnr >= cfg.psnr) { best = { setting: grid[mid], m }; lo = mid + 1; }
        else hi = mid - 1;
      }
      if (!best) {                       // even the top of the grid missed
        await encode(grid[0]);
        best = { setting: grid[0], m: compare(refPng, encode.out, alpha) };
      } else if (best.setting !== grid[grid.length - 1]) {
        await encode(best.setting);      // re-emit the winner: the search left a loser on disk
      }
      return best;
    }

    if (!alpha) {
      const out = join(OUTDIR, `${stem}-${w}.avif`);
      if (FORCE || !existsSync(out)) {
        const enc = async (crf) => encodeAvif(refPng, out, crf); enc.out = out;
        const { setting, m } = await search(CRF_GRID, enc);
        if (m.psnr < cfg.psnr) problems.push(`${out} luma PSNR ${m.psnr.toFixed(2)} < ${cfg.psnr} even at CRF ${setting}`);
        (entry.avifMeta ??= []).push({ w, crf: setting, psnr: +m.psnr.toFixed(2), maxd: m.maxd, dMean: +m.dMean.toFixed(3) });
        line.push(`avif${w} ${(statSync(out).size / 1024).toFixed(0)}K@crf${setting}/${m.psnr.toFixed(1)}dB`);
      }
      entry.avif.push({ w, file: `${OUTDIR}/${stem}-${w}.avif`, bytes: statSync(out).size });
      outTotal += statSync(out).size;
    }

    /* WebP normally exists only for browsers with no AVIF — Safari 14 to
       16.3 and the older Android web views — so that tier gets the two ends
       of the ladder rather than every rung: still a small file on a phone
       and a sharp one on a desktop, without doubling the derivative count
       for a shrinking slice of traffic.

       EXCEPT for the alpha cutout, where WebP is not a fallback tier at all
       but the ONLY format, because ffmpeg cannot carry an alpha channel
       into AVIF here. Thinning its rungs left the plate with 340 and 1122
       and nothing between, so every device needing more than 340 fetched
       227KB — menu.html paints it 171px wide on a phone. An image with no
       AVIF gets the whole ladder. */
    const webpRungs = new Set(alpha ? j.widths : [j.widths[0], j.widths[j.widths.length - 1]]);
    if (webpRungs.has(w)) {
      const out = join(OUTDIR, `${stem}-${w}.webp`);
      if (FORCE || !existsSync(out)) {
        const enc = async (q) => encodeWebp(refPng, out, q); enc.out = out;
        const { setting, m } = await search(WEBP_GRID, enc);
        if (m.psnr < cfg.psnr) problems.push(`${out} PSNR ${m.psnr.toFixed(2)} < ${cfg.psnr} even at q${setting}`);
        if (alpha && m.alphaPsnr < 45) problems.push(`${out} ALPHA PSNR ${m.alphaPsnr.toFixed(2)} — the cutout edge is degrading`);
        (entry.webpMeta ??= []).push({ w, q: setting, psnr: +m.psnr.toFixed(2), maxd: m.maxd, dMean: +m.dMean.toFixed(3), ...(alpha ? { alphaPsnr: +m.alphaPsnr.toFixed(1) } : {}) });
        line.push(`webp${w} ${(statSync(out).size / 1024).toFixed(0)}K@q${setting}/${m.psnr.toFixed(1)}dB` + (alpha ? `/a${m.alphaPsnr.toFixed(0)}` : ''));
      }
      entry.webp.push({ w, file: `${OUTDIR}/${stem}-${w}.webp`, bytes: statSync(out).size });
      outTotal += statSync(out).size;
    }
  }

  /* Drop any rung that a WIDER rung already beats on bytes.

     The CRF search runs per rung against that rung's own downscaled
     reference, so two neighbours can settle on different points of a coarse
     grid: menu-seafood came out 152K at 710 and 145K at 900. A rung like
     that is strictly dominated — the wider file is sharper AND smaller — so
     a phone picking it by `sizes` downloads more to see less. Pruning is
     safe because every surviving rung has already cleared the same PSNR
     floor; it only ever moves a request UP the ladder. Widest first, so a
     run of dominated rungs collapses in one pass, and the top rung, which
     nothing is wider than, always survives. */
  for (const list of [entry.avif, entry.webp]) {
    let best = Infinity;
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].bytes >= best) {
        pruned.push(`${list[i].file.replace(OUTDIR + '/', '')} ${(list[i].bytes / 1024).toFixed(0)}K — a wider rung is smaller`);
        list.splice(i, 1);
      } else best = list[i].bytes;
    }
  }

  /* A derivative that is not meaningfully smaller than the original is
     just another file to cache-miss on. The tiles are where this bites:
     a 306px JPEG is already near the floor of what any codec can do. */
  const topA = entry.avif.length ? entry.avif[entry.avif.length - 1] : null;
  const topW = entry.webp[entry.webp.length - 1];
  const scaleOf = (rung) => srcBytes * (rung.w / j.nw) ** 2;
  if (topA && topA.bytes > scaleOf(topA) * 0.9) { entry.avifSkipped = 'no smaller than the original'; }
  if (topW.bytes > scaleOf(topW) * 0.9 && !alpha) { entry.webpSkipped = 'no smaller than the original'; }

  const biggest = Math.max(
    entry.avif.length ? entry.avif[entry.avif.length - 1].bytes : 0,
    entry.webp[entry.webp.length - 1].bytes,
  );
  manifest[j.src] = entry;
  console.log(
    `${j.src.replace('assets/img/', '').padEnd(30)} ${j.role.padEnd(8)} ${(srcBytes / 1024).toFixed(0).padStart(5)}K → ` +
    `${(biggest / 1024).toFixed(0).padStart(5)}K top rung  ${line.join('  ')}`,
  );
}

await browser.close();
rmSync(TMP, { recursive: true, force: true });
writeFileSync('img-manifest.json', JSON.stringify(manifest, null, 2));

console.log(`\noriginals ${(srcTotal / 1024 / 1024).toFixed(2)}MB  →  derivatives ${(outTotal / 1024 / 1024).toFixed(2)}MB across every rung and both formats`);
if (pruned.length) { console.log('\nPRUNED (a wider rung is both sharper and smaller):'); for (const p of pruned) console.log('  ' + p); }
if (problems.length) { console.log('\nBELOW QUALITY FLOOR:'); for (const p of problems) console.log('  ' + p); }
else console.log('every variant met its PSNR floor');
