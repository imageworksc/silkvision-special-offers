/* ==========================================================================
   Page behaviour
   Loaded with `defer`, so the document is parsed by the time this runs.

   Everything here is an enhancement. If the file fails to load the page is
   still complete and readable: nothing is hidden by CSS until this script
   says it is safe to hide it.
   ========================================================================== */

'use strict';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const root = document.documentElement;

/* --------------------------------------------------------------------------
   1 · Reading progress — the hairline at the top fills as the page is read.
   -------------------------------------------------------------------------- */
const setupProgress = () => {
  const bar = document.getElementById('progress');
  if (!bar) return;
  let ticking = false;

  const read = () => {
    const max = root.scrollHeight - window.innerHeight;
    bar.style.setProperty('--p', max > 0 ? (window.scrollY / max).toFixed(4) : '0');
    ticking = false;
  };

  const request = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(read);
  };

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  read();
};

/* --------------------------------------------------------------------------
   2 · Scroll reveals
   The flag goes on <html> from here, so a target is only ever hidden while
   the page is in a position to bring it back.
   -------------------------------------------------------------------------- */
const setupReveals = () => {
  const targets = [...document.querySelectorAll('[data-reveal]')];
  if (!targets.length) return;

  root.dataset.anim = 'on';

  if (reduced.matches || !('IntersectionObserver' in window)) {
    for (const el of targets) el.classList.add('is-in');
    return;
  }

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: .1 });

  for (const el of targets) io.observe(el);

  // The negative rootMargin means anything in the last slice of a
  // fully-scrolled page would never trigger. Once the visitor reaches the
  // bottom, reveal whatever is still waiting.
  const flush = () => {
    if (window.innerHeight + window.scrollY < root.scrollHeight - 2) return;
    for (const el of targets) {
      el.classList.add('is-in');
      io.unobserve(el);
    }
    window.removeEventListener('scroll', flush);
  };
  window.addEventListener('scroll', flush, { passive: true });
  window.addEventListener('load', flush);
};

/* --------------------------------------------------------------------------
   3 · The sticky call bar
   On a phone, once the hero has scrolled away. Hidden again at the closing
   band, which carries the same two actions full size.
   -------------------------------------------------------------------------- */
const setupStickyCta = () => {
  const bar = document.getElementById('stickyCta');
  const hero = document.querySelector('.hero');
  const closing = document.getElementById('contact');
  if (!bar || !hero || !('IntersectionObserver' in window)) return;

  let pastHero = false;
  let atClosing = false;
  const paint = () => { bar.dataset.shown = String(pastHero && !atClosing); };

  new IntersectionObserver(([e]) => {
    pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
    paint();
  }).observe(hero);

  if (closing) {
    new IntersectionObserver(([e]) => {
      atClosing = e.isIntersecting;
      paint();
    }).observe(closing);
  }
};

/* --------------------------------------------------------------------------
   4 · Reward graphics
   Each plays its entrance every time its section comes into view: the class
   goes on when 40% of the graphic is on screen and comes off only once it
   has left the screen entirely, so the next visit plays it again without
   flickering at the edge. With reduced motion or no IntersectionObserver
   the graphics simply show.
   -------------------------------------------------------------------------- */
const setupRewards = () => {
  const figs = [...document.querySelectorAll('[data-reward]')];
  if (!figs.length) return;
  if (reduced.matches || !('IntersectionObserver' in window)) {
    for (const fig of figs) fig.classList.add('is-live');
    return;
  }

  // The EVO cards' shine replays on every visit, from above or below: it
  // re-arms once the graphic is mostly out of view (under 20% showing) and
  // plays again when half of it is back.
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      const f = en.target;
      if (en.intersectionRatio >= 0.4) f.classList.add('is-live');
      else if (!en.isIntersecting) f.classList.remove('is-live');
      if (en.intersectionRatio >= 0.5) f.classList.add('is-shine');
      else if (en.intersectionRatio < 0.2) f.classList.remove('is-shine');
    }
  }, { threshold: [0, 0.2, 0.4, 0.5] });
  for (const fig of figs) io.observe(fig);

  // The hero's "Explore Current Offers" button: once its scroll to the EVO
  // section has finished, the cards' shine plays, even when the cards were
  // already partly in view and so never "arrived".
  const evo = document.querySelector('.reward-graphic');
  if (!evo) return;
  for (const link of document.querySelectorAll('a[href="#offers"]')) {
    link.addEventListener('click', () => {
      evo.classList.remove('is-shine');
      let done = false;
      const play = () => {
        if (done) return;
        done = true;
        removeEventListener('scrollend', play);
        evo.style.setProperty('--shine-delay', '.15s');
        void evo.offsetWidth;
        evo.classList.add('is-live', 'is-shine');
        setTimeout(() => evo.style.removeProperty('--shine-delay'), 2000);
      };
      addEventListener('scrollend', play, { once: true });
      setTimeout(play, 1200); // browsers without the scrollend event
    });
  }
};

setupProgress();
setupReveals();
setupStickyCta();
setupRewards();
