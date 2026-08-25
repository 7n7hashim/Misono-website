#!/bin/bash
# Bakes the gallery stills: crop → expose → white-balance → grade → scale.
# One-off; see CLAUDE.md "Grade at encode time, not at runtime."
#
# The nine sources are phone snapshots shot under whatever light was in the
# room — food3 is tungsten-orange, food6 is window-cool, food9 is amber. A
# single tone curve cannot reconcile nine different casts, so each frame is
# measured and pulled toward grey before the shared look goes on top. Two
# passes: probe the mean RGB, then bake with that frame's correction.
set -e
cd "$(dirname "$0")"
mkdir -p assets/img/gallery

# Master curve: crushes the low end so the snapshot backgrounds fall away,
# with a shoulder above 0.72 that holds the blown white plates back.
MASTER="0/0 0.22/0.075 0.5/0.42 0.72/0.62 0.88/0.72 1/0.80"

# Cool shadows, applied after the balance — this is what lands the backgrounds
# on the stage's indigo. Chained as its own curves instance: inside a single
# curves, `all` alongside `r`/`b` starves green and turns neutrals magenta.
# Measured, not assumed.
SHADE="curves=b='0/0.03 0.3/0.325 1/0.99':r='0/0 0.3/0.285 1/1'"

# How far toward neutral grey each cast is pulled. Full strength would bleach
# the warmth out of the food; this leaves every dish warm but stops the nine
# casts from disagreeing with each other.
WB=0.55

H=560

# Mean R,G,B of a filtered frame, as three integers.
probe () {
  ffmpeg -v error -i "assets/img/$1.jpeg" -vf "$2,scale=1:1,format=rgb24" \
    -f rawvideo -pix_fmt rgb24 - 2>/dev/null | od -An -tu1 | tr -s ' ' | sed 's/^ //;s/ $//'
}

bake () { # $1 stem  $2 eq params  $3 optional crop
  local crop=""
  [ -n "$3" ] && crop="crop=$3,"
  local pre="${crop}eq=$2,curves=all='$MASTER'"

  read -r r g b <<<"$(probe "$1" "$pre")"
  read -r gr gg gb <<<"$(python3 -c "
r,g,b=$r,$g,$b
grey=(r+g+b)/3
f=lambda c:(grey/c)**$WB if c else 1.0
print('%.4f %.4f %.4f'%(f(r),f(g),f(b)))")"

  ffmpeg -v error -y -i "assets/img/$1.jpeg" \
    -vf "${pre},colorchannelmixer=rr=$gr:gg=$gg:bb=$gb,\
colorchannelmixer=rr=1.035:gg=1.0:bb=0.965,\
${SHADE},scale=-2:$H:flags=lanczos" \
    -q:v 6 "assets/img/gallery/$1.jpg"
  printf "%-12s mean rgb %3d %3d %3d   wb gains %s %s %s\n" "$1" "$r" "$g" "$b" "$gr" "$gg" "$gb"
}

BASE="brightness=-0.030:contrast=1.20:saturation=0.70:gamma=0.90"

# Cropped: the only three frames where the surroundings actively fight the
# food — an arm and a chair, a person in shot, a terracotta floor.
bake foodinspo1 "$BASE"                                                     880:1480:210:70
bake food2      "$BASE"                                                     940:1560:20:20
bake food9      "brightness=-0.050:contrast=1.22:saturation=0.58:gamma=0.88" 1150:1230:70:170

# Full frame, original aspect kept. Exposure is pulled per frame so that no
# tile punches a hole in the strip; the amounts came from measuring each
# frame's average luma, not from taste.
bake food3 "brightness=-0.190:contrast=1.22:saturation=0.66:gamma=0.78"
bake food5 "brightness=-0.060:contrast=1.20:saturation=0.70:gamma=0.87"
bake food7 "brightness=-0.070:contrast=1.20:saturation=0.70:gamma=0.86"
bake food4 "brightness=-0.065:contrast=1.24:saturation=0.68:gamma=0.86"
bake food8 "brightness=-0.085:contrast=1.26:saturation=0.66:gamma=0.84"
bake food6 "brightness=-0.045:contrast=1.24:saturation=0.70:gamma=0.88"

echo
echo "--- baked (neutral = U 128, V 128) ---"
for f in assets/img/gallery/*.jpg; do
  printf "%-40s %-10s %-6s %s\n" "$f" \
    "$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$f")" \
    "$(du -h "$f" | cut -f1)" \
    "$(ffprobe -v error -f lavfi -i "movie=$f,signalstats" -show_entries frame_tags=lavfi.signalstats.YAVG,lavfi.signalstats.UAVG,lavfi.signalstats.VAVG -of csv=p=0)"
done
echo "total: $(du -ch assets/img/gallery/*.jpg | tail -1 | cut -f1)"
