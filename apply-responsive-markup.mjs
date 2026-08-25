/* Rewrites every photographic <img> on the four pages into a <picture> that
   offers AVIF, then WebP, then the untouched original, and applies the
   loading policy below. Idempotent: an <img> already inside a <picture> is
   left alone, so this can be re-run after a re-bake.

     node apply-responsive-markup.mjs             rewrite in place
     node apply-responsive-markup.mjs --dry       print what would change

   THE ORIGINAL FILES ARE NEVER REPLACED. They stay as the <img src>, which
   is what a browser with neither AVIF nor WebP still gets, and they stay as
   the input every other bake-*.py expects. Nothing here edits a photograph.

   Two structural notes:

   - `picture { display: contents }` is REQUIRED, and it is in each page's
     CSS rather than here. Several of these images are flex or grid items of
     their own parent (`.beyond__track img` is `flex: none`); wrapping them
     puts <picture> in that slot instead and the marquee's max-content row
     stops measuring what it measured before. `display: contents` removes
     the wrapper from the box tree so the <img> is the flex item again.
     Selector matching is unaffected — every rule on this site targets these
     images by class or as a descendant, never as a direct child.

   - The loading policy is per-image, not per-page, because three sections
     on about.html are documented as deliberately NOT lazy: their frames
     share one grid cell, so a frame that arrives undecoded rises as an
     empty rectangle. Those keep `loading="lazy"` in the markup for the
     no-JS case but are woken early by the warm-up in each page's script,
     which flips them to eager two viewports out — earlier than the
     browser's own lazy threshold, and still off the initial critical path. */
import { readFileSync, writeFileSync } from 'node:fs';

const DRY = process.argv.includes('--dry');
const manifest = JSON.parse(readFileSync('img-manifest.json', 'utf8'));

/* eager   — fetched at parse time. The LCP image, and nothing else.
   lazy    — native lazy, nothing more. Genuinely far down and self-contained.
   warm:S  — native lazy in the markup, woken by the observer on section S.
             For frames whose arrival is choreographed and must be decoded
             before their turn. */
const POLICY = {
  'index.html': {
    'assets/img/hero-omakase-1717.jpg': { mode: 'eager', priority: 'high', preload: true },
    'assets/img/teppanyaki-counter.jpg': { mode: 'lazy' },
    'assets/img/chirashi-plate.webp': { mode: 'lazy' },
    'assets/img/reserve-interior.jpg': { mode: 'lazy' },
    '*gallery*': { mode: 'warm', warm: '.beyond' },
  },
  'menu.html': {
    /* The opening composition is above the fold on every viewport and is
       the measured LCP element. All four frames arrive together out of
       depth; a lazy one would arrive late into a two-second choreography. */
    'assets/img/hero-omakase-1717.jpg': { mode: 'eager', priority: 'high', preload: true },
    'assets/img/teppanyaki-flambe.jpg': { mode: 'eager' },
    'assets/img/chirashi-plate.webp': { mode: 'eager' },
    'assets/img/gallery/food7.jpg': { mode: 'eager' },
    'assets/img/reserve-interior.jpg': { mode: 'lazy' },
  },
  'about.html': {
    'assets/img/about-craft.jpg': { mode: 'eager', priority: 'high', preload: true },
    'assets/img/about-plate.jpg': { mode: 'lazy' },
    'assets/img/about-ch1-teppan.jpg': { mode: 'warm', warm: '.chapters' },
    'assets/img/about-ch2-hand.jpg': { mode: 'warm', warm: '.chapters' },
    'assets/img/about-ch3-ingredient.jpg': { mode: 'warm', warm: '.chapters' },
    'assets/img/about-ch4-room.jpg': { mode: 'warm', warm: '.chapters' },
    'assets/img/about-ex1-teppan.jpg': { mode: 'warm', warm: '.experience' },
    'assets/img/about-ex2-craft.jpg': { mode: 'warm', warm: '.experience' },
    'assets/img/about-ex3-room.jpg': { mode: 'warm', warm: '.experience' },
    'assets/img/about-ic1-counter.jpg': { mode: 'warm', warm: '.ichie' },
    'assets/img/about-ic2-brush.jpg': { mode: 'warm', warm: '.ichie' },
    'assets/img/reserve-interior.jpg': { mode: 'lazy' },
  },
  'contact.html': {
    'assets/img/contact-hero.jpg': { mode: 'eager', priority: 'high', preload: true },
    'assets/img/locale-mombasa.jpg': { mode: 'warm', warm: '.locale--mombasa' },
    'assets/img/locale-nairobi.jpg': { mode: 'warm', warm: '.locale--nairobi' },
    'assets/img/reserve-interior.jpg': { mode: 'lazy' },
  },
};

const policyFor = (page, src) => {
  const p = POLICY[page];
  if (p[src]) return p[src];
  for (const k of Object.keys(p)) {
    if (k.startsWith('*') && src.includes(k.replace(/\*/g, ''))) return p[k];
  }
  return null;
};

/* Rewrite one attribute in place, or append it before the closing bracket. */
function setAttr(tag, name, value) {
  const re = new RegExp(`\\s${name}="[^"]*"`);
  if (value === null) return tag.replace(re, '');
  if (re.test(tag)) return tag.replace(re, ` ${name}="${value}"`);
  return tag.replace(/\s*\/?>$/, ` ${name}="${value}">`);
}

const srcset = (rungs) => rungs.map((r) => `${r.file} ${r.w}w`).join(', ');

/* `sizes` is per PAGE, not per file. Three photographs are used at very
   different sizes on two pages each — hero-omakase is a full-viewport hero
   on index.html and a 15vw framed photograph on menu.html — and a single
   merged value made menu.html fetch, and preload, the 1717px rung to paint
   a frame a fifth that wide. The ladder stays shared; only the hint moves. */
const sizesFor = (page, e) => (e.sizesByPage && e.sizesByPage[page === 'index.html' ? '/' : '/' + page]) || e.sizes;

let totalChanged = 0;

for (const page of Object.keys(POLICY)) {
  let html = readFileSync(page, 'utf8');
  /* Idempotency at file level rather than per-tag: once a page has been
     rewritten, re-running would nest <picture> inside <picture>. Re-baking
     and re-running means restoring the four pages first. */
  if (html.includes('<picture>')) {
    /* Already wrapped: refresh the candidate lists in place instead of
       wrapping again. A re-bake changes the ladder, and the <source> lists
       have to follow it or the page offers rungs that no longer exist. */
    let n = 0;
    html = html.replace(/<picture>([\s\S]*?)<\/picture>/g, (block) => {
      const src = /<img\b[^>]*\ssrc="([^"]+)"/.exec(block);
      if (!src || !manifest[src[1]]) return block;
      const e = manifest[src[1]];
      n++;
      return block
        .replace(/(<source type="image\/avif" sizes=")[^"]*("\s*\n\s*srcset=")[^"]*(")/,
                 (_m, a, b, c) => a + sizesFor(page, e) + b + srcset(e.avif) + c)
        .replace(/(<source type="image\/webp" sizes=")[^"]*("\s*\n\s*srcset=")[^"]*(")/,
                 (_m, a, b, c) => a + sizesFor(page, e) + b + srcset(e.webp) + c);
    });
    /* The preload names the same candidates, so it moves with them. */
    for (const [s2, pol] of Object.entries(POLICY[page])) {
      if (!pol.preload || !manifest[s2]) continue;
      const e = manifest[s2];
      html = html.replace(/(<link rel="preload" as="image" type="image\/\w+"\n\s*imagesrcset=")[^"]*("\n\s*imagesizes=")[^"]*(")/,
                          (_m, a, b, c) => a + srcset(e.avif.length ? e.avif : e.webp) + b + sizesFor(page, e) + c);
    }
    writeFileSync(page, html);
    console.log(`${page}: refreshed ${n} <picture> candidate lists`);
    continue;
  }
  const preloads = [];
  let changed = 0;

  html = html.replace(/([ \t]*)<img\b[\s\S]*?>/g, (whole, indent, offset) => {
    const tag = whole.slice(indent.length);
    const m = /\ssrc="([^"]+)"/.exec(tag);
    if (!m) return whole;
    const src = m[1];
    const entry = manifest[src];
    const pol = policyFor(page, src);
    if (!entry || !pol) return whole;

    let img = tag;
    if (pol.mode === 'eager') {
      img = setAttr(img, 'loading', 'eager');
      img = setAttr(img, 'decoding', 'sync');
      if (pol.priority) img = setAttr(img, 'fetchpriority', pol.priority);
    } else {
      img = setAttr(img, 'loading', 'lazy');
      img = setAttr(img, 'decoding', 'async');
      img = setAttr(img, 'fetchpriority', 'low');
      if (pol.mode === 'warm') img = setAttr(img, 'data-warm', pol.warm);
    }

    if (pol.preload) {
      const rungs = entry.avif.length ? entry.avif : entry.webp;
      preloads.push(
        `<link rel="preload" as="image" type="image/${entry.avif.length ? 'avif' : 'webp'}"\n` +
        `      imagesrcset="${srcset(rungs)}"\n` +
        `      imagesizes="${sizesFor(page, entry)}" fetchpriority="high">`,
      );
    }

    const sources = [];
    if (entry.avif.length) {
      sources.push(`${indent}  <source type="image/avif" sizes="${sizesFor(page, entry)}"\n${indent}          srcset="${srcset(entry.avif)}">`);
    }
    if (entry.webp.length) {
      sources.push(`${indent}  <source type="image/webp" sizes="${sizesFor(page, entry)}"\n${indent}          srcset="${srcset(entry.webp)}">`);
    }
    changed++;
    return `${indent}<picture>\n${sources.join('\n')}\n${indent}  ${img}\n${indent}</picture>`;
  });

  /* The preload replaces whatever hand-written one the page had — it has to
     name the same candidates the <picture> will choose from, or the browser
     preloads one file and then downloads a different one. */
  html = html.replace(/[ \t]*<link rel="preload" as="image"[\s\S]*?>\n/g, '');
  if (preloads.length) {
    html = html.replace(/(<link href="https:\/\/fonts\.googleapis[^>]*>\n|<\/title>\n)/, (mm) => mm + preloads.join('\n') + '\n');
  }

  if (DRY) console.log(`${page}: ${changed} images would be wrapped, ${preloads.length} preload`);
  else { writeFileSync(page, html); console.log(`${page}: wrapped ${changed} images, ${preloads.length} preload`); }
  totalChanged += changed;
}
console.log(`\n${totalChanged} <img> elements total`);
