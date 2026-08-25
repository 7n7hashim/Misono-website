/* MISONO — hero film sequencer.
 *
 * Three clips play as one continuous piece: slicing → plating → fire → repeat.
 * Only one is on screen at a time. The lockup is a sibling of the stage, not a
 * child, so nothing here can ever fade MISONO out along with a scene.
 *
 * If this script never runs, scene 1's still stays on screen behind the
 * lockup and the hero still reads as finished.
 */
(function () {
  'use strict';

  var html = document.documentElement;
  var params = new URLSearchParams(window.location.search);

  /* Screenshots run under webdriver, which forces the static hero — so the
     entrance and the sequence are never observable in a capture. ?anim=1
     overrides that for visual verification. */
  var forceAnim = params.get('anim') === '1';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var headless = navigator.webdriver === true;
  var still = !forceAnim && (reduced || headless);

  if (still) html.classList.add('no-anim');

  var stage = document.querySelector('.stage');
  var dip = document.querySelector('.dip');
  if (!stage) return;

  var scenes = Array.prototype.slice.call(stage.querySelectorAll('.scene'));
  if (!scenes.length) return;

  /* The static hero is scene 1's still. Loading three clips we will never
     play would spend bandwidth for nothing. */
  if (still) return;

  /* Timing comes from the stylesheet so the CSS transition and this
     sequencer can never disagree about how long a crossfade takes. */
  function ms(name, fallback) {
    var raw = getComputedStyle(html).getPropertyValue(name).trim();
    var n = parseFloat(raw);
    if (!isFinite(n)) return fallback;
    return /ms$/.test(raw) ? n : n * 1000;
  }
  var HOLD = ms('--hold', 5000);
  var TRANS = ms('--trans', 1200);

  var tall = window.matchMedia('(max-width: 767px)');
  var index = 0;
  var timer = null;
  var running = false;

  function attach(scene) {
    var video = scene.querySelector('video');
    if (!video) return null;

    var want = tall.matches ? 'tall' : 'wide';
    if (video.dataset.loaded === want) return video;

    var src = want === 'tall' ? video.dataset.srcTall : video.dataset.src;
    if (!src) return video;

    video.dataset.loaded = want;

    /* H.264 only. VP9 was measured larger than H.264 on every one of these
       clips — dark footage with film grain is expensive for it — so a second
       codec would have cost bytes and bought no reach. */
    video.src = src;

    video.addEventListener('canplay', function () {
      video.classList.add('is-painted');
    });
    video.addEventListener('error', function () {
      video.classList.remove('is-painted');
    });

    video.preload = 'auto';
    video.load();
    return video;
  }

  function play(video) {
    if (!video) return;
    var started = video.play();
    if (started && typeof started.catch === 'function') {
      /* Autoplay refused, or the codec turned out to be undecodable. The
         still underneath scene 1 stays, and the hero still looks complete. */
      started.catch(function () {});
    }
  }

  function advance() {
    var from = index;
    var to = (index + 1) % scenes.length;
    var incoming = attach(scenes[to]);

    /* Nothing looks worse than cutting to a scene that has not decoded yet.
       Wait a beat for it rather than showing a hole. */
    if (incoming && incoming.readyState < 3) {
      timer = window.setTimeout(advance, 300);
      return;
    }

    if (incoming) {
      incoming.currentTime = 0;
      play(incoming);
    }

    /* The room goes dark for a moment and comes back somewhere else. */
    if (dip) {
      dip.classList.remove('is-dipping');
      void dip.offsetWidth;               /* restart the animation */
      dip.classList.add('is-dipping');
    }

    scenes[to].classList.add('is-active');
    scenes[from].classList.remove('is-active');
    index = to;

    /* Stop decoding the outgoing clip once it is fully invisible. */
    window.setTimeout(function () {
      var outgoing = scenes[from].querySelector('video');
      if (outgoing && from !== index) outgoing.pause();
    }, TRANS);

    timer = window.setTimeout(advance, HOLD + TRANS);
  }

  function start() {
    if (running) return;
    running = true;
    play(scenes[index].querySelector('video'));
    window.clearTimeout(timer);
    timer = window.setTimeout(advance, HOLD + TRANS);
  }

  function stop() {
    running = false;
    window.clearTimeout(timer);
    timer = null;
    scenes.forEach(function (scene) {
      var video = scene.querySelector('video');
      if (video) video.pause();
    });
  }

  /* Scene 1 first and on its own — it is the only one on screen at load.
     The other two are fetched during idle, and have a full hold to become
     ready before their turn. */
  attach(scenes[0]);
  start();

  function warm() {
    scenes.slice(1).forEach(attach);
  }
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(warm, { timeout: 1500 });
  } else {
    window.setTimeout(warm, 400);
  }

  /* A hidden tab should not burn battery advancing scenes nobody sees. */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else start();
  });

  /* Rotating a phone, or dragging a desktop window across the breakpoint,
     changes which crop is correct. Re-attach the visible scene immediately
     and let the rest pick their new sources on their next turn. */
  function onBreakpoint() {
    var current = scenes[index];
    var video = attach(current);
    if (video && running) play(video);
  }
  if (typeof tall.addEventListener === 'function') {
    tall.addEventListener('change', onBreakpoint);
  } else if (typeof tall.addListener === 'function') {
    tall.addListener(onBreakpoint);
  }
}());

/* MISONO — sections 3-5.
 *
 * Two jobs, and the stylesheet performs both of them: mark a block as seen so
 * its reveal can run, and publish the offset each photograph should sit at.
 * Nothing in here animates anything itself, and nothing in here reads a style
 * back off the DOM.
 *
 * Deliberately its own unit rather than an extension of the sequencer above —
 * that one returns early in several places, and none of those decisions are
 * about this half of the page.
 */
(function () {
  'use strict';

  var html = document.documentElement;
  var params = new URLSearchParams(window.location.search);

  /* The same test the hero makes, made again rather than shared: if the hero
     is ever lifted off this page, these sections must still resolve to their
     finished state on their own instead of staying invisible. */
  var forceAnim = params.get('anim') === '1';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var headless = navigator.webdriver === true;
  var still = !forceAnim && (reduced || headless);

  if (still) {
    /* .no-anim renders every block revealed and every frame at rest, so there
       is nothing left to observe and nothing left to offset. */
    html.classList.add('no-anim');
    return;
  }

  /* ── Reveal ──────────────────────────────────────────────── */

  var blocks = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        /* An entrance, not a state — nothing re-hides on the way back up. */
        io.unobserve(entry.target);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });

    Array.prototype.forEach.call(blocks, function (block) { io.observe(block); });
  } else {
    /* No observer: show the page rather than withhold it. */
    Array.prototype.forEach.call(blocks, function (block) {
      block.classList.add('is-in');
    });
  }

  /* ── Parallax ────────────────────────────────────────────── */

  var plates = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  if (!plates.length) return;

  var offsets = new Array(plates.length);
  var ticking = false;

  /* Every rect is read before any style is written. Interleaving them would
     make each write invalidate the next read, and the cost of that grows with
     the number of frames on the page. */
  function place() {
    ticking = false;
    var vh = window.innerHeight;
    var i;

    for (i = 0; i < plates.length; i++) {
      var el = plates[i];
      var box = el.getBoundingClientRect();
      /* 0 as the frame's top edge enters the foot of the window, 1 as its
         bottom edge leaves the head of it. */
      var progress = (vh - box.top) / (vh + box.height);
      if (progress < 0) progress = 0;
      else if (progress > 1) progress = 1;

      /* data-parallax is a fraction of the travel available, not a pixel
         distance, and the travel available is --bleed — the amount the frame
         is oversized by. Read off the DOM for the same reason the sequencer
         reads --hold: hard-coding it here let a later change to --bleed leave
         the two disagreeing, and the disagreement shows as the photograph's
         own edge sliding into the section. At 1 the frame travels exactly to
         its bleed and no further, whatever the breakpoint has made that. */
      var bleed = parseFloat(getComputedStyle(el).getPropertyValue('--bleed')) || 0;
      var ratio = parseFloat(el.dataset.parallax);
      if (!isFinite(ratio)) ratio = 1;
      else if (ratio > 1) ratio = 1;

      offsets[i] = (progress - 0.5) * 2 * bleed * ratio;
    }

    for (i = 0; i < plates.length; i++) {
      plates[i].style.setProperty('--p', offsets[i].toFixed(1) + 'px');
    }
  }

  function schedule() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(place);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  place();
}());
