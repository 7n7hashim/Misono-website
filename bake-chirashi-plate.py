"""
Re-bake the chirashi cutout from the original `foodfood.png`.

Why it needed re-baking: the shipped cutout's alpha stops at a rim fit that had
taken in the pale surface the bowl stands on, so a light crescent up to 52px
wide (angles ~320 deg through ~130 deg) is opaque in the file. On the cream
ground that was invisible. On the peach it reads -- and the plate turns, so it
orbits.

Two consequences of measuring the bowl instead of the rim: the radius drops
548.6 -> 530.1, and the centre moves 15.5px and 19.9px, which matters because
the plate rotates about the centre of the file. So the frame is re-cropped too.

Done from the 1254px source rather than the shipped webp so the result is one
lossy encode from the original, not two.

To reproduce assets/img/chirashi-plate.webp exactly:

    python3 bake-chirashi-plate.py 3
    node bake-png-to-webp.mjs /tmp/chirashi-plate-rebaked.png \
        assets/img/chirashi-plate.webp 0.94

3 is the inset (see INSET below) and 0.94 is the quality that lands the file
within 4% of the weight of the bake it replaced. There is no cwebp and no
ImageMagick on this machine, and sips reads webp but cannot write it, which is
why the encode goes through the Chrome that puppeteer already ships.

The bake it replaced is kept at _archive/chirashi-plate-rimfit.webp -- this
project has no git history, so nothing is overwritten without a copy.
"""
import struct, zlib, math

SRC = "/Users/hashim/Desktop/Restuarant website/assets/img/foodfood.png"
DST = "/tmp/chirashi-plate-rebaked.png"

# Separates the bowl (measures 12-40) from the pale surface (232+). The gap is
# wide enough that the exact value does not matter.
DARK = 170


def read_png(path):
    d = open(path, "rb").read()
    i, idat = 8, b""
    while i < len(d):
        ln = struct.unpack(">I", d[i:i + 4])[0]
        t = d[i + 4:i + 8]
        if t == b"IHDR":
            w, h, bd, ct, _, _, _ = struct.unpack(">IIBBBBB", d[i + 8:i + 21])
        if t == b"IDAT":
            idat += d[i + 8:i + 8 + ln]
        i += 12 + ln
    assert bd == 8 and ct in (2, 6), (bd, ct)
    bpp = 3 if ct == 2 else 4
    raw = zlib.decompress(idat)
    stride = w * bpp
    out = bytearray(h * stride)
    prev = bytearray(stride)
    p = 0
    for y in range(h):
        f = raw[p]; p += 1
        line = bytearray(raw[p:p + stride]); p += stride
        if f:
            for x in range(stride):
                a = line[x - bpp] if x >= bpp else 0
                b = prev[x]
                c = prev[x - bpp] if x >= bpp else 0
                if f == 1: line[x] = (line[x] + a) & 255
                elif f == 2: line[x] = (line[x] + b) & 255
                elif f == 3: line[x] = (line[x] + (a + b) // 2) & 255
                else:
                    pa, pb, pc = abs(b - c), abs(a - c), abs(a + b - 2 * c)
                    pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                    line[x] = (line[x] + pr) & 255
        out[y * stride:(y + 1) * stride] = line
        prev = line
    return w, h, bpp, out


def write_png(path, w, h, buf):
    stride = w * 4
    raw = bytearray()
    for y in range(h):
        raw.append(0)
        raw += buf[y * stride:(y + 1) * stride]
    def chunk(t, data):
        return (struct.pack(">I", len(data)) + t + data
                + struct.pack(">I", zlib.crc32(t + data) & 0xFFFFFFFF))
    png = (b"\x89PNG\r\n\x1a\n"
           + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0))
           + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
           + chunk(b"IEND", b""))
    open(path, "wb").write(png)


def fit(pts):
    """Kasa algebraic circle fit."""
    Sx = Sy = Sxx = Syy = Sxy = Sxz = Syz = Sz = 0.0
    n = len(pts)
    for x, y in pts:
        z = x * x + y * y
        Sx += x; Sy += y; Sxx += x * x; Syy += y * y; Sxy += x * y
        Sxz += x * z; Syz += y * z; Sz += z
    A = [[Sxx, Sxy, Sx], [Sxy, Syy, Sy], [Sx, Sy, n]]
    b = [Sxz, Syz, Sz]
    for i in range(3):
        p = max(range(i, 3), key=lambda r: abs(A[r][i]))
        A[i], A[p] = A[p], A[i]; b[i], b[p] = b[p], b[i]
        for r in range(i + 1, 3):
            f = A[r][i] / A[i][i]
            for c in range(i, 3):
                A[r][c] -= f * A[i][c]
            b[r] -= f * b[i]
    s = [0.0] * 3
    for i in (2, 1, 0):
        s[i] = (b[i] - sum(A[i][c] * s[c] for c in range(i + 1, 3))) / A[i][i]
    xc, yc = s[0] / 2, s[1] / 2
    return xc, yc, math.sqrt(s[2] + xc * xc + yc * yc)


w, h, bpp, src = read_png(SRC)
sstride = w * bpp
def spx(x, y):
    i = y * sstride + x * bpp
    return src[i], src[i + 1], src[i + 2]

# --- find the bowl edge along 720 rays ------------------------------------
cx0 = cy0 = (w - 1) / 2.0
N = 720
samples = []
for k in range(N):
    a = k * 2 * math.pi / N
    ca, sa = math.cos(a), math.sin(a)
    r = (w / 2.0) - 2
    while r > 300:
        x, y = int(cx0 + r * ca), int(cy0 + r * sa)
        if 0 <= x < w and 0 <= y < h and min(spx(x, y)) < DARK:
            break
        r -= 1
    samples.append((cx0 + r * ca, cy0 + r * sa))

# Trim: garnish crosses the rim at a handful of angles and reads as dark, and
# would drag the radius outward if it were left in the fit.
pts = samples
for _ in range(3):
    xc, yc, R = fit(pts)
    pts = sorted(pts, key=lambda p: abs(math.hypot(p[0] - xc, p[1] - yc) - R))
    pts = pts[:int(len(pts) * 0.88)]
xc, yc, R = fit(pts)
resid = [abs(math.hypot(x - xc, y - yc) - R) for x, y in pts]
print("bowl circle in the 1254 source: centre (%.1f, %.1f)  r %.1f" % (xc, yc, R))
print("kept %d/%d rays, residual mean %.2f px, max %.2f px"
      % (len(pts), N, sum(resid) / len(resid), max(resid)))
print("shipped bake used centre (638.1, 635.2)  r 548.6 -- the rim, not the bowl")

# --- build RGBA, cut at the circle, one-pixel feather ---------------------
# INSET: the fit has a 2.3px worst residual, so a cut exactly on R leaves a
# pale sliver wherever the circle runs outside the bowl. Pulled in until the
# sliver is gone; every pixel of inset costs half a rendered pixel of bowl.
import sys
INSET = float(sys.argv[1]) if len(sys.argv) > 1 else 0.0
R -= INSET

# The frame stays 1122px, the shipped size, so the rendered plate keeps the
# size the composition was measured at and nothing moves. The bowl goes from
# 94.49% of the frame to 93.96% -- the 3px inset, 3px of rendered diameter on
# a 549px plate -- and the rest of the difference is transparent margin.
#
# Not corrected here: the spec has the plate at 40.38% of the viewport, and
# because the old fit took in the pale surface the bowl has only ever rendered
# at 38.2%. Fixing that means growing the plate ~32px at 1440, which is a
# change to the composition and not to this bug.
half = 561
x0, y0 = int(round(xc - half)), int(round(yc - half))
nw = nh = half * 2
dst = bytearray(nw * nh * 4)
fcx, fcy = xc - x0, yc - y0
for y in range(nh):
    dy = y - fcy
    row = (y + y0) * sstride
    for x in range(nw):
        d = math.hypot(x - fcx, dy)
        if d >= R:
            continue
        s = row + (x + x0) * bpp
        o = (y * nw + x) * 4
        dst[o] = src[s]; dst[o + 1] = src[s + 1]; dst[o + 2] = src[s + 2]
        dst[o + 3] = 255 if d <= R - 1 else int(255 * (R - d))

print("cropped to %dx%d about the bowl's centre; r %.1f leaves %.1fpx margin"
      % (nw, nh, R, half - R))
write_png(DST, nw, nh, dst)
print("wrote", DST)

# --- verify: nothing pale left on the silhouette --------------------------
dstride = nw * 4
def dpx(x, y):
    i = y * dstride + x * 4
    return dst[i], dst[i + 1], dst[i + 2], dst[i + 3]
c = (nw - 1) / 2.0
runs = []
for k in range(N):
    a = k * 2 * math.pi / N
    ca, sa = math.cos(a), math.sin(a)
    r = nw / 2.0 - 2
    while r > 300:
        x, y = int(c + r * ca), int(c + r * sa)
        if dpx(x, y)[3] > 200:
            break
        r -= 1
    n = 0
    while r > 300:
        x, y = int(c + r * ca), int(c + r * sa)
        if min(dpx(x, y)[:3]) < DARK:
            break
        n += 1; r -= 1
    if n:
        runs.append(n)
print("silhouette: %d/%d rays end on a pale pixel; worst run %d px (was 52)"
      % (len(runs), N, max(runs) if runs else 0))
