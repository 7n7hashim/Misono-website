// Static server for the project root. Node built-ins only — no dependencies.
//
// Usage: node serve.mjs           → http://localhost:3000, dev headers
//        PORT=4000 node serve.mjs
//        PROD=1 node serve.mjs    → production headers (see below)
//
// It compresses and it caches, because a static server that does neither
// gives a misleading picture of the site's real speed: these pages carry
// their whole stylesheet inline and gzip them about 3.4:1, so measuring
// them uncompressed overstates the HTML cost by ~70%.
//
// TWO HEADER MODES, and the difference is deliberate:
//
//   dev (default)  every response revalidates. The screenshot and verify
//                  tools must always see the file as it is on disk, and a
//                  cached photograph after a re-bake is a wasted round of
//                  chasing a difference that is not there. ETags still make
//                  the revalidation a 304, so it stays fast.
//
//   PROD=1         HTML revalidates; everything under assets/ is immutable
//                  for a year. Safe because the derivatives are content-
//                  addressed by width — assets/img/r/<name>-<w>.avif — so a
//                  re-bake at a different ladder writes different names. The
//                  ORIGINALS are not content-addressed, so they get a day.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { gzipSync, brotliCompressSync, constants as zlibConstants } from 'node:zlib';

/* The directory to serve. Defaults to this file's own directory — cwd is
   deliberately NOT used, so the project tooling can start the server from
   anywhere — but SERVE_ROOT overrides it, which is how `dist/` gets served
   by the same script.

   Without the override, `cd dist && node ../serve.mjs` silently serves the
   PROJECT ROOT: the server starts, every URL 200s, and the pages look
   right, because they ARE the right pages — just the unbuilt ones. That
   made verify-dist.mjs compare the source site against itself and report
   eight pixel-identical pairs, which is true and worthless. If a dist check
   passes suspiciously easily, check what the server printed at startup. */
const ROOT = resolve(process.env.SERVE_ROOT ?? fileURLToPath(new URL('.', import.meta.url)));
const PORT = Number(process.env.PORT) || 3000;
const PROD = process.env.PROD === '1';

/* Compress text, never images. AVIF, WebP and woff2 are already entropy
   coded — running them through brotli costs CPU on both ends and typically
   ADDS bytes. */
const COMPRESSIBLE = /^(text\/|application\/(javascript|json|manifest\+json)|image\/svg)/;

/* Built once per file, then reused. Brotli at quality 11 is slow enough
   that doing it per request would dominate the response time on about.html;
   the pages change rarely and the cache is keyed on size+mtime. */
const encoded = new Map();
function compressed(body, type, accept) {
  if (!COMPRESSIBLE.test(type) || body.length < 1024) return null;
  const key = createHash('sha1').update(body).digest('hex');
  let slot = encoded.get(key);
  if (!slot) {
    slot = {
      br: brotliCompressSync(body, {
        params: {
          [zlibConstants.BROTLI_PARAM_QUALITY]: 11,
          [zlibConstants.BROTLI_PARAM_SIZE_HINT]: body.length,
        },
      }),
      gzip: gzipSync(body, { level: 9 }),
    };
    encoded.set(key, slot);
  }
  if (/\bbr\b/.test(accept)) return { enc: 'br', body: slot.br };
  if (/\bgzip\b/.test(accept)) return { enc: 'gzip', body: slot.gzip };
  return null;
}

function cacheControl(pathname) {
  if (!PROD) return 'no-cache';
  /* Content-addressed by width: a re-bake at a different ladder writes
     different filenames, so these can never go stale. */
  if (pathname.startsWith('/assets/img/r/')) return 'public, max-age=31536000, immutable';
  if (pathname.startsWith('/assets/fonts/')) return 'public, max-age=31536000, immutable';
  if (pathname.startsWith('/assets/') || pathname.startsWith('/brand_assets/')) return 'public, max-age=86400';
  return 'no-cache';                                   // HTML: always revalidate
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.webmanifest': 'application/manifest+json',
};

// Decode the URL (asset filenames may contain URL-encoded spaces) and confine
// the result to ROOT so `..` segments can't escape the project directory.
function resolveRequestPath(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null; // malformed percent-encoding
  }
  const withinRoot = normalize(decoded).replace(/^(\.\.(?:[/\\]|$))+/, '');
  const target = resolve(ROOT, '.' + (withinRoot.startsWith('/') ? withinRoot : '/' + withinRoot));
  if (target !== ROOT && !target.startsWith(ROOT + sep)) return null;
  return target;
}

function sendError(res, code, message) {
  const body = `${code} ${message}\n`;
  res.writeHead(code, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

const server = createServer(async (req, res) => {
  let pathname;
  try {
    pathname = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`).pathname;
  } catch {
    return sendError(res, 400, 'Bad Request');
  }

  const target = resolveRequestPath(pathname);
  if (!target) {
    console.log(`  400  ${pathname}`);
    return sendError(res, 400, 'Bad Request');
  }

  try {
    let filePath = target;
    let info = await stat(filePath).catch(() => null);

    if (info?.isDirectory()) {
      filePath = join(filePath, 'index.html');
      info = await stat(filePath).catch(() => null);
    }

    if (!info?.isFile()) {
      console.log(`  404  ${pathname}`);
      return sendError(res, 404, 'Not Found');
    }

    const body = await readFile(filePath);
    const type = MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream';

    /* Weak ETag over size+mtime: cheap, and enough to make a revalidation a
       304 rather than a re-download. */
    const etag = `W/"${info.size.toString(16)}-${info.mtimeMs.toString(16)}"`;
    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304, { ETag: etag, 'Cache-Control': cacheControl(pathname) });
      res.end();
      console.log(`  304  ${pathname}`);
      return;
    }

    const z = compressed(body, type, String(req.headers['accept-encoding'] ?? ''));
    const out = z ? z.body : body;
    const headers = {
      'Content-Type': type,
      'Content-Length': out.length,
      'Cache-Control': cacheControl(pathname),
      ETag: etag,
      Vary: 'Accept-Encoding',
    };
    if (z) headers['Content-Encoding'] = z.enc;
    res.writeHead(200, headers);
    res.end(req.method === 'HEAD' ? undefined : out);
    console.log(`  200  ${pathname}${z ? `  ${z.enc} ${(body.length / 1024).toFixed(0)}K→${(out.length / 1024).toFixed(0)}K` : ''}`);
  } catch (err) {
    console.error(`  500  ${pathname} — ${err.message}`);
    sendError(res, 500, 'Internal Server Error');
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `Port ${PORT} is already in use — the dev server is probably already running.\n` +
        `Do not start a second instance. Use the running one, or set PORT to something else.`,
    );
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, () => {
  console.log(`Misono server → http://localhost:${PORT}   [${PROD ? 'PROD headers' : 'dev headers'}]`);
  console.log(`Serving ${ROOT}`);
  if (!PROD) console.log('brotli/gzip on; caching set to revalidate. PROD=1 for immutable asset caching.');
});
