/* Does every derivative actually show its own source photograph?

   Usage:  node verify-rungs.mjs            all rungs
           node verify-rungs.mjs --quick    the widest AVIF and WebP per image

   This exists because the answer was NO for eight days and nothing noticed.

   `bake-responsive.mjs` keys its outputs on `stem-width`, so when a source is
   re-cropped or replaced at a width the ladder already had, the old file is
   kept and the bake reports success. The rebrand replaced five photographs
   that way, and 18 of the 24 derivatives whose width survived were still the
   previous restaurant's picture. The `<img src>` JPEG fallback was correct;
   every browser that takes AVIF or WebP got the wrong image.

   Three checks that ought to have caught it each had a reason not to:

     - dimensions matched, so any geometry check passed;
     - both photographs were graded to the same luminance band, so the means
       agreed to within 0.7 of 255 and no grading check fired;
     - `compare-photos.mjs` measures a rung against ITS OWN source, which for
       a stale file means measuring the old photograph against the new one and
       reporting the result as a quality score rather than as a wrong image.

   What separates them cleanly is luma PSNR between the shipped rung and the
   CURRENT source downscaled to that rung's size. A re-encode of the same
   photograph scores 40dB and up. A different photograph scores 8 to 12. There
   is no middle ground to tune a threshold against, which is what makes this
   worth running rather than eyeballing; STALE is set at 30dB. */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const QUICK = process.argv.includes('--quick');
const STALE_DB = 30;
const TMP = 'assets/img/.verify-tmp';

const manifest = JSON.parse(readFileSync('img-manifest.json', 'utf8'));
rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

const sh = (cmd, args) => execFileSync(cmd, args, { maxBuffer: 1 << 30 });

/* Raw luma at the file's own size. No `scale` filter on the decode of the
   rung: swscale's identity path is not bit-exact and that error is large
   enough to swamp what is being measured here. */
function gray(file, out, w, h) {
  const args = ['-v', 'error', '-i', file];
  if (w) args.push('-vf', `scale=${w}:${h}:flags=lanczos`);
  args.push('-pix_fmt', 'gray', '-f', 'rawvideo', out, '-y');
  sh('ffmpeg', args);
  return readFileSync(out);
}

/* The alpha plane, same size, or null where the file has none. */
function alpha(file, out, w, h) {
  const fmt = sh('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=pix_fmt', '-of', 'csv=p=0', file]).toString().trim();
  /* yuva420p is what WebP reports here, and it neither ends in `a` nor
     starts with one of the packed names — an earlier test missed it, the
     gate silently never applied, and the cutout read as stale. */
  if (!/^(yuva|ya)|a$|^(rgba|bgra|argb|abgr)/.test(fmt)) return null;
  /* format=rgba before alphaextract, and after any scale: swscale can hand
     on a format with no alpha plane and the filter then fails outright. */
  const vf = [w ? `scale=${w}:${h}:flags=lanczos` : null, 'format=rgba', 'alphaextract']
    .filter(Boolean).join(',');
  sh('ffmpeg', ['-v', 'error', '-i', file, '-vf', vf, '-pix_fmt', 'gray', '-f', 'rawvideo', out, '-y']);
  return readFileSync(out);
}

const rows = [];
let checked = 0, stale = 0, missing = 0;

for (const [src, entry] of Object.entries(manifest)) {
  if (!existsSync(src)) { console.log(`SOURCE MISSING  ${src}`); missing++; continue; }
  let rungs = [...(entry.avif ?? []), ...(entry.webp ?? [])];
  if (QUICK) {
    const last = (l) => (l && l.length ? [l[l.length - 1]] : []);
    rungs = [...last(entry.avif), ...last(entry.webp)];
  }
  for (const r of rungs) {
    if (!existsSync(r.file)) { console.log(`RUNG MISSING    ${r.file}`); missing++; continue; }
    const dim = sh('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height', '-of', 'csv=p=0:s=x', r.file]).toString().trim();
    const [w, h] = dim.split('x').map(Number);
    const a = gray(r.file, join(TMP, 'a.gray'));
    const b = gray(src, join(TMP, 'b.gray'), w, h);
    if (a.length !== b.length) {
      rows.push([r.file, '—', `SIZE MISMATCH: rung ${a.length}B vs source-at-${w}x${h} ${b.length}B`]);
      stale++; continue;
    }
    /* The cutout is compared over FULLY OPAQUE pixels only, exactly as the
       bake's own metric is. Chrome premultiplies on encode, so a transparent
       pixel's luma is whatever it was before it was made invisible: comparing
       the whole frame reported the duck plate at 21dB — the signature of a
       different photograph — on files baked from that very source minutes
       earlier. Alpha is the gate, not a weight. */
    const aa = alpha(r.file, join(TMP, 'a.a'));
    const ba = alpha(src, join(TMP, 'b.a'), w, h);
    let keep = null;
    if (aa && ba && aa.length === a.length && ba.length === a.length) {
      /* And ERODE that mask before using it. The rim has to go too, not just
         the transparent pixels: the bake resizes through Chrome's canvas and
         this check resizes through swscale, and on a hard-edged cutout those
         two disagree along the edge by far more than compression does. Only
         the 1122 rung — the source's own width, so resampled by neither —
         passed without this, which is the signature of a resampler mismatch
         rather than of a stale file. */
      const r0 = Math.max(2, Math.round(w * 0.01));
      const op = new Uint8Array(a.length);
      for (let i = 0; i < a.length; i++) op[i] = (aa[i] === 255 && ba[i] === 255) ? 1 : 0;
      keep = new Uint8Array(a.length);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (x < r0 || y < r0 || x >= w - r0 || y >= h - r0) continue;
        let ok = 1;
        for (let dy = -r0; dy <= r0 && ok; dy += r0) for (let dx = -r0; dx <= r0; dx += r0) {
          if (!op[(y + dy) * w + (x + dx)]) { ok = 0; break; }
        }
        keep[y * w + x] = ok;
      }
    }
    let mse = 0, n = 0;
    for (let i = 0; i < a.length; i++) {
      if (keep && !keep[i]) continue;
      const d = a[i] - b[i]; mse += d * d; n++;
    }
    if (!n) { rows.push([r.file, '—', 'no fully opaque pixels to compare']); continue; }
    mse /= n;
    const psnr = mse === 0 ? 99 : 10 * Math.log10(65025 / mse);
    checked++;
    if (psnr < STALE_DB) { stale++; rows.push([r.file, psnr.toFixed(1), 'STALE — a DIFFERENT photograph than its source']); }
  }
}

rmSync(TMP, { recursive: true, force: true });

for (const [f, db, note] of rows) console.log(`  ${f.padEnd(44)} ${String(db).padStart(5)}dB  ${note}`);
console.log(`\n${checked} rungs checked against their current source${QUICK ? ' (--quick: widest per image)' : ''}`);
if (missing) console.log(`${missing} file(s) referenced by the manifest but not on disk`);
if (stale) {
  console.log(`\n${stale} STALE — these are not the photograph they claim to be.`);
  console.log('Fix:  rm -rf assets/img/r && node bake-responsive.mjs --force && node apply-responsive-markup.mjs');
  process.exit(1);
}
console.log('every rung shows its own source photograph');
