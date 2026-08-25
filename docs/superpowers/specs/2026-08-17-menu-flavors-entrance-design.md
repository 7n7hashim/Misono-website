# Menu — the opening composition's 3D entrance

Built 2026-08-17. The `.flavors` section on `menu.html` — four portrait
photographs floating around a heading centred on the viewport — gains an
entrance. Nothing else about it changes: the composition, the type, the ground
and the four measured insets are all exactly as built on 2026-08-11, and the
entrance is required to end on them to the pixel.

The brief: `THE MENU` emerging out of depth, `Exceptional Flavors` popping
forward rather than fading up, the frames arriving from behind the page, slow
easing with a slight overshoot so things settle rather than stop, triggered on
reaching the section, and subtle enough for a high-end Japanese restaurant.

## 1. Why the depth is a property and not a function

There are two ways to get a `translateZ` projected. Put `perspective()` at the
head of each element's own transform, or put the `perspective` **property** on a
parent. This uses the property, and the reason is the rest state.

With `perspective()` inside the transform, an element that has finished
arriving still carries a transform. That is a composited layer holding type,
and Chrome rasterises the glyphs once and stretches the result — which a
hairline Cormorant Garamond at 300 shows immediately. It is the same finding
that keeps `will-change` off `about.html`'s statement, and it is why nothing
here carries `will-change` either.

With the property on the parent, the arrival can end on a true
`transform: none`. Rest is then not an approximation of the measured
composition; it *is* the measured composition, and the type rasterises the way
it does on a page with no motion at all.

    .flavors__field   { perspective: 1500px; }
    .flavors__title   { perspective: 1100px; }
    .flavors__display { perspective: 1100px; }

Verified three ways, all in `shoot-flavors.mjs` and a pixel diff:

  - apparent scale `1.000` and offset `0.0, 0.0` on all seven animated
    elements at a large t, at 1440x900, 1280x800 and 390x844;
  - the settled viewport against a `prefers-reduced-motion` capture: max
    channel delta **4**, mean 1.15, i.e. the SVG grain's own dither;
  - the same comparison restricted to the type block: max channel delta **2**,
    against both the reduced-motion and the scripting-disabled render.

The larger deltas in a whole-viewport diff (up to 106 on 0.26% of pixels) sit
inside the photographs and are image resampling, not layout — check the bbox
before reading a number like that as a shift.

## 2. `perspective` reaches direct children only

Declared on `.flavors__title` alone, the property reaches `.flavors__eyebrow`
and stops. The two display lines are **grandchildren** — `.flavors__title` >
`h1.flavors__display` > `span` — so their `translateZ` had no camera to be
projected through.

This is the third silent-failure of its kind on this site, after two undefined
tokens on `about.html`, and it is the worst of the three to catch by eye: there
is no error, no warning, and the result is a heading that fades up while the
frames behind it move in depth. That is a plausible design. The tell is
numeric — a line reporting apparent scale `1.000` at t=0 is this bug, not a
subtle animation — which is why the shooter prints scale per element.

Hence the same value declared twice. `.flavors__display`'s box is the two lines,
so its perspective-origin is the heading's own centre, which is where the lines
should be coming at the reader from.

## 3. The frames' sideways travel is not written anywhere

`.flavors__field` is `inset: 0` on the section, so its perspective-origin is the
centre of the window — which is exactly where the heading sits. A frame pushed
back in Z is therefore projected **toward the heading**, and its slide out to
its own measured inset is the projection coming undone.

Nothing writes a per-frame `translateX`. The four insets at `.frame--ul/ur/ll/lr`
remain the only thing deciding where a frame lands, which is the property worth
protecting: the 2026-08-11 finding is that straightening any of those four
numbers collapses the composition into a grid, and a motion system that also had
an opinion about horizontal position would be a second place for that to happen.

The drift is proportional to distance from the origin, so it scales itself down
on a narrow viewport with no media query and no second set of numbers. Measured
at t=0 on the lower-right frame: 68.7px of travel at 1440 wide, 60.8 at 1280,
1.8 at 390.

## 4. The overshoot is not `y2`

Both curves end above 1 and come back, because an element that decelerates onto
its mark has been *placed* there and one that passes it and returns has
*settled* there. But the peak of `cubic-bezier(x1,y1,x2,y2)` sits around t=0.8
and well below y2:

    --ease-settle  cubic-bezier(0.18, 0.84, 0.26, 1.12)  peaks 1.026  ~2.6%
    --ease-pop     cubic-bezier(0.15, 0.90, 0.22, 1.20)  peaks 1.055  ~5.5%

Solved against the travel each drives: 2.6% of 290px is 7px of Z, 5.5% of 240px
is 13px. Confirmed in the capture — the display lines read apparent scale 1.012
at t=1100 against a predicted 1100/1088.5 = 1.011. Picking y2 by eye gives
roughly a fifth of the overshoot you think you asked for.

## 5. The choreography

One number per element, all in draw-order down the stylesheet. `--in-fade` is
deliberately shorter than `--in-move` throughout: the move is the thing worth
watching, so each element is opaque well before it stops travelling. Fading and
travelling over the same span is a cross-dissolve and throws the depth away.

    element      delay   move    fade   from                              ease
    eyebrow        0ms  1200ms   900ms  z -80,  y  6                      settle
    Exceptional  190ms  1500ms   850ms  z -210, y 14, rotateX 7deg        pop
    Flavors      330ms  1500ms   850ms  z -240, y 16, rotateX 8deg        pop
    frame ul     300ms  1500ms  1000ms  z -230, y 10, rotateX 4deg        settle
    frame ur     390ms  1500ms  1000ms  z -255, y 11, rotateX 4.5deg      settle
    frame ll     490ms  1500ms  1000ms  z -290, y 13, rotateX 5deg        settle
    frame lr     580ms  1500ms  1000ms  z -265, y 12, rotateX 4.5deg      settle

Three decisions inside that table:

**The eyebrow gets depth and no rotation.** 10px caps at 0.34em tracking are the
one thing in this composition a `rotateX` would only make mushy. Holding it to
pure depth is also what leaves the rotation below reading as the display's own
gesture rather than as an effect applied twice — `THE MENU` emerges, the
heading pops, and those are different moves rather than one move at two volumes.

**The type leads and the frames finish.** The heading is the subject and the
frames are what frame it, so the composition assembles inward-out. Durations are
long enough (1.2–1.5s) that the delays overlap heavily: at 500ms the type has
nearly landed, the upper frames are half-arrived, and the lower-left is still
ghosting in. Nothing in the sequence is ever alone on screen except the eyebrow.

**The frames arrive at four different depths, deepest at lower-left.** One
shared Z would read as a single plane sliding forward, which is a slideshow
transition rather than a composition assembling.

## 6. The trigger, and the state a reader without JS gets

House contract, same as `about.html`: `.js` on the documentElement arms the
hidden state, an `IntersectionObserver` adds `.is-in` once and disconnects.
Every rest state in the stylesheet is the finished composition and `.js` is what
takes it away — so with scripting off the section renders complete, and a
`prefers-reduced-motion` block puts all three properties back **by name**. The
blanket rule at the top of the file only shortens durations; it does not undo a
starting transform, so without that block a reader asking for less motion would
get the composition parked 280px behind the page.

Two details that are not arbitrary:

**`.js` is added from a script in `<head>`, not beside the observer at the foot
of the body.** `about.html` can arm late because the section it arms is below
the fold. This one is the first thing on screen, so a class added after the body
has parsed lets the heading paint in place and then be snatched back.

**Threshold 0.3.** The section is a full viewport tall, so at any threshold near
zero it is already intersecting on the first frame regardless of where a reader
is restored to; a third of it has to be on screen before the composition starts
assembling. Then the observer disconnects — this is an arrival, not a scroll
effect, and coming back up the page must not replay it.

## 7. Capturing it

`node shoot-flavors.mjs [width] [height] [ms,ms,ms...]`. See the header of that
file. The two things that cost time: a paused animation never finishes and so is
never dropped, which makes remove-and-re-add replay seek a growing pile of
half-finished transitions instead of a fresh one; and `finish()` throws on an
infinite animation, so any `getAnimations()` sweep has to be scoped to the
section or it dies on the reservation block's `reserve-drift` three viewports
down.
