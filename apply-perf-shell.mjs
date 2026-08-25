/* The non-image half of the performance pass, applied to all four pages:
   self-hosted type, the `picture` box-tree fix, and the warm-up that wakes
   deferred photographs before the reader reaches them.

     node apply-perf-shell.mjs        apply (idempotent — re-runs are no-ops)

   WHY THE FONTS MOVED OFF GOOGLE. The three <link>s they replace cost two
   DNS lookups, two TLS handshakes and one render-blocking stylesheet before
   the browser even learns a font URL — roughly 600-900ms of critical path on
   a 150ms-RTT connection, during which no text of any kind is painted. Self
   hosting puts the woff2 on the connection that is already open for the HTML.

   The files are Google's own latin subsets, fetched once and committed:
   ONE variable file per family covering 300-400 rather than one per weight.
   That matters more than it sounds — asking the CSS API for `300;400` hands
   back two @font-face blocks pointing at two URLs, and a page that sets both
   weights (all four of these do) downloads the same 37.8KB outline twice.

   Nothing here changes a typeface, a weight or a size. The only faces
   declared are the ones each page actually sets: menu.html and contact.html
   have no italic in them at all and no longer ask for one.

   ON THE FALLBACK FACE. Cormorant Garamond sets 13.2% narrower than Georgia
   at the same font-size (measured: width ratio 0.8676 over a mixed sample).
   Left alone, every display line reflows by that much when the webfont
   swaps in. 'Cormorant Fallback' is Georgia with size-adjust and the
   vertical metrics overridden to Cormorant's own, so the two occupy the
   same box and the swap costs no layout shift. Jost is NOT given one: it
   measures 1.0015x the system sans, and an override tuned on this machine's
   system font would be a guess on every other platform. */
import { readFileSync, writeFileSync } from 'node:fs';

const RANGE = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';

const face = (family, style, weight, file) =>
`  @font-face {
    font-family: '${family}';
    font-style: ${style};
    font-weight: ${weight};
    font-display: swap;
    src: url(assets/fonts/${file}) format('woff2');
    unicode-range: ${RANGE};
  }`;

/* Pages that set no italic anywhere do not declare one. */
const ITALIC = new Set(['index.html', 'about.html']);

const cssBlock = (page) => `  /* =====================================================================
     PERFORMANCE — self-hosted type and the <picture> box tree.
     Added by the 2026-08-24 load-time pass; see apply-perf-shell.mjs for the
     reasoning behind every number in here. Nothing below changes a typeface,
     a weight, a size or a colour.
     ===================================================================== */

${face('Cormorant Garamond', 'normal', '300 400', 'cormorant-garamond-normal-300-400.woff2')}

${ITALIC.has(page) ? face('Cormorant Garamond', 'italic', '400', 'cormorant-garamond-italic-400.woff2') + '\n\n' : ''}${face('Jost', 'normal', '300 400', 'jost-normal-300-400.woff2')}

  /* Georgia, bent onto Cormorant's metrics, so the ~150ms before the webfont
     arrives is not a differently-shaped page. 86.8% is the measured width
     ratio of the two over a mixed sample; the vertical overrides are
     Cormorant's own ascent and descent expressed against that adjusted em. */
  @font-face {
    font-family: 'Cormorant Fallback';
    src: local('Georgia'), local('Times New Roman'), local('Times');
    size-adjust: 86.8%;
    ascent-override: 106%;
    descent-override: 33.4%;
    line-gap-override: 0%;
  }

  /* <picture> generates NO box. Several of these photographs are flex or
     grid items of their own parent — .beyond__track img is \`flex: none\` in
     a max-content row whose width the marquee's translate is a percentage
     of — and a wrapper would take that slot instead of the <img>. With
     display:contents the <img> is the flex item again and every measured
     layout is byte-for-byte what it was. Selector matching is untouched:
     every rule on this site reaches these images by class or as a
     descendant, never as a direct child. */
  picture { display: contents; }
`;

const HEAD = `<link rel="preload" as="font" type="font/woff2" crossorigin href="assets/fonts/cormorant-garamond-normal-300-400.woff2">
<link rel="preload" as="font" type="font/woff2" crossorigin href="assets/fonts/jost-normal-300-400.woff2">`;

/* Wakes a deferred photograph 1.5 viewports out — earlier than the browser's
   own lazy threshold, and still nowhere near the initial critical path.
   Three sections on about.html are documented as deliberately NOT lazy
   because their frames share one grid cell and a frame that arrives
   undecoded rises as an empty rectangle; this is how they stay off the
   first load without losing that. With JS off the markup's own
   loading="lazy" still fetches them, one viewport later. */
const WARM = `<script>
/* Deferred photography: wake a section's frames 1.5 viewports before it
   arrives, so nothing is decoding at the moment it has to be on screen.
   See apply-perf-shell.mjs. Degrades to plain native lazy with JS off. */
(function () {
  var imgs = document.querySelectorAll('img[data-warm]');
  if (!imgs.length) return;
  var wake = function (list) {
    for (var i = 0; i < list.length; i++) {
      var im = list[i];
      im.loading = 'eager';
      im.fetchPriority = 'auto';
      if (im.decode) im.decode().catch(function () {});
    }
  };
  if (!('IntersectionObserver' in window)) return wake(imgs);
  var groups = {};
  for (var i = 0; i < imgs.length; i++) {
    var k = imgs[i].getAttribute('data-warm');
    (groups[k] = groups[k] || []).push(imgs[i]);
  }
  Object.keys(groups).forEach(function (sel) {
    var host = document.querySelector(sel);
    if (!host) return wake(groups[sel]);
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      wake(groups[sel]);
    }, { rootMargin: '150% 0px 150% 0px' });
    io.observe(host);
  });
}());
</script>`;

for (const page of ['index.html', 'menu.html', 'about.html', 'contact.html']) {
  let html = readFileSync(page, 'utf8');
  if (html.includes("Cormorant Fallback")) { console.log(`${page}: already applied — skipped`); continue; }

  /* --- head: drop the three Google links, add two same-origin preloads --- */
  html = html.replace(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\n/, '');
  html = html.replace(/<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>\n/, '');
  html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2[^>]*>\n/, HEAD + '\n');

  /* --- css: the block goes FIRST, so nothing already in the file can be
         shadowed by it and nothing in it can shadow a later override --- */
  html = html.replace('<style>\n', '<style>\n' + cssBlock(page) + '\n');

  /* --- the metric-matched fallback joins every Cormorant stack, ahead of
         Georgia and behind the real face --- */
  const before = html;
  html = html
    .replace(/font-family: "Cormorant Garamond", Cormorant, Georgia, serif;/g,
             `font-family: "Cormorant Garamond", Cormorant, 'Cormorant Fallback', Georgia, serif;`)
    .replace(/font-family: "Cormorant Garamond", ui-serif, Georgia, serif;/g,
             `font-family: "Cormorant Garamond", ui-serif, 'Cormorant Fallback', Georgia, serif;`)
    .replace(/font-family: 'Cormorant Garamond', Georgia, serif;/g,
             `font-family: 'Cormorant Garamond', 'Cormorant Fallback', Georgia, serif;`);
  const stacks = (before.match(/font-family: ['"]Cormorant Garamond['"]/g) || []).length;

  /* --- the warm-up, last thing before </body> --- */
  html = html.replace('</body>', WARM + '\n</body>');

  writeFileSync(page, html);
  console.log(`${page}: fonts self-hosted, ${stacks} Cormorant stacks given the fallback face, warm-up added`);
}
