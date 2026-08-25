#!/bin/bash
# Bakes the section stills: crop → expose → white-balance → grade → scale.
# Same rule as the hero and the gallery — see CLAUDE.md "Grade at encode time,
# not at runtime." The CSS mask only shapes the edge; it does no tone work.
#
# Two sources, unlike the gallery's nine. Both are studio shots already lit on
# a dark ground, so the correction is gentler than bake-gallery.sh's — but they
# do not agree with each other (the shrimp sits on a warm-green slate, the
# chopsticks on a neutral near-black), so each is still measured and pulled
# toward grey before the shared look goes on top.
#
# Each scene ships twice: a wide crop for >=768px and a tall crop below, which
# is the breakpoint site.js and the CSS both use.
set -e
cd "$(dirname "$0")"

# Master curve. Crushes the low end so the studio grounds fall away into the
# stage's indigo, and shoulders hard above 0.68 — these sit behind type at full
# bleed, so a food highlight that reaches white would punch a hole in the page.
MASTER="0/0 0.18/0.05 0.42/0.27 0.68/0.47 0.86/0.59 1/0.67"

# Cool shadows, applied after the balance — this is what lands the backgrounds
# on the indigo. Its own curves instance on purpose: inside a single curves,
# `all` alongside `r`/`b` starves green and turns neutrals magenta.
SHADE="curves=b='0/0.035 0.3/0.33 1/0.99':r='0/0 0.3/0.28 1/1'"

# How far toward neutral grey each cast is pulled. Far lower than the gallery's
# 0.55, and for a reason the gallery did not have: there the background filled
# most of every frame, so the measured cast really was the room's light. Here
# the food fills the frame, so the probe reads the shrimp's own orange as a
# cast. At 0.55 it bleached the shrimp to cream — measured, not guessed. This
# corrects the grounds' disagreement and leaves the food warm.
WB=0.15

# Put back the warmth the balance takes off, on purpose and in one place: the
# stage is cool and the food is warm, and that tension is the whole grade.
WARM="colorchannelmixer=rr=1.045:gg=1.0:bb=0.955"

# Mean R,G,B of a filtered frame, as three integers.
probe () {
  ffmpeg -v error -i "assets/img/$1-src.jpeg" -vf "$2,scale=1:1,format=rgb24" \
    -f rawvideo -pix_fmt rgb24 - 2>/dev/null | od -An -tu1 | tr -s ' ' | sed 's/^ //;s/ $//'
}

bake () { # $1 stem  $2 suffix  $3 eq params  $4 crop  $5 WxH  $6 pre-filters
  local pre="${6}crop=$4,eq=$3,curves=all='$MASTER'"
  local w="${5%x*}" h="${5#*x}"

  read -r r g b <<<"$(probe "$1" "$pre")"
  read -r gr gg gb <<<"$(python3 -c "
r,g,b=$r,$g,$b
grey=(r+g+b)/3
f=lambda c:(grey/c)**$WB if c else 1.0
print('%.4f %.4f %.4f'%(f(r),f(g),f(b)))")"

  ffmpeg -v error -y -i "assets/img/$1-src.jpeg" \
    -vf "${pre},colorchannelmixer=rr=$gr:gg=$gg:bb=$gb,\
${WARM},${SHADE},scale=$w:$h:flags=lanczos" \
    -q:v 7 "assets/img/$1$2.jpg"
  printf "%-22s mean rgb %3d %3d %3d   wb gains %s %s %s\n" "$1$2" "$r" "$g" "$b" "$gr" "$gg" "$gb"
}

# Both scenes come from one shoot: the same salmon loin on the same slate under
# the same light. That is the point. Two unrelated stock frames, however good
# each is alone, read as two stock frames; one shoot read across two sections
# reads as a restaurant that photographed its own food. The crops are
# deliberately unalike — a still form in one, two hands and a blade in the
# other — so the shared source buys cohesion without repeating a picture.
#
# Sharing a light, they share a grade. The slate is a mid grey that has to fall
# to near-black, and the salmon is the one warm thing on a cool page and has to
# survive the fall. The low gamma does the first; the master curve's shoulder
# stops it doing the second.
LOOK="brightness=-0.070:contrast=1.18:saturation=0.72:gamma=0.78"

# ── scene-omakase ──────────────────────────────────────────────────────────
# The loin bleeds off the top edge and the slate runs empty beneath it, so the
# lockup sits in the dark with the warm form directly above — the reference's
# arrangement, where the food holds the frame and the type holds the quiet.
# The loin is 1085px of a 3593px frame, so in any 4:3 crop it covers three
# fifths of the height; the only real choice is which three fifths, and putting
# it anywhere but the top puts it behind the heading.
#
# Baked 4:3, not 16:9. The hole it fills is the section plus the bleed the
# parallax travels in — about 1440x1090 on a laptop — and `cover` discards
# whatever does not fit. A 16:9 bake lost a quarter of its width and magnified
# the rest by a third. Ship the shape of the hole.
bake scene-omakase ""      "$LOOK" 2400:1800:0:700   1800x1350
bake scene-omakase "-tall" "$LOOK" 1400:2489:500:700 1080x1920

# ── scene-craft ────────────────────────────────────────────────────────────
# The other half of the same slate: one hand flat on the loin, one drawing the
# blade. The section's head sits high and this frame runs from a third of the
# way down to the foot, so the hands land mid-screen as the section is scrolled
# through — the picture arrives where the eye already is.
#
# Portrait for that reason: the hole is taller than it is wide even on a
# desktop. An earlier landscape bake was cover-cropped to its middle two thirds
# and lost half the subject off the sides.
bake scene-craft ""      "$LOOK" 2400:2700:0:100   1600x1800
bake scene-craft "-tall" "$LOOK" 1400:2661:700:300 1000x1900

echo
echo "--- baked (neutral = U 128, V 128) ---"
for f in assets/img/scene-*.jpg; do
  printf "%-34s %-10s %-6s %s\n" "$f" \
    "$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$f")" \
    "$(du -h "$f" | cut -f1)" \
    "$(ffprobe -v error -f lavfi -i "movie=$f,signalstats" -show_entries frame_tags=lavfi.signalstats.YAVG,lavfi.signalstats.YMAX,lavfi.signalstats.UAVG,lavfi.signalstats.VAVG -of csv=p=0)"
done
echo "total: $(du -ch assets/img/scene-*.jpg | tail -1 | cut -f1)"
