/* =========================================================
   Ahmed Jab — Portfolio
   Lenis smooth scroll + GSAP animations
   ========================================================= */
import './style.css';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $  = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

/* ---------- Text splitting helpers ---------- */
function splitChars(el) {
  const text = el.textContent;
  el.textContent = '';
  el.style.overflow = 'hidden';
  const chars = [];
  // Group letters into per-word wrappers so a word never breaks mid-letter.
  // Line breaks can then only happen between whole words.
  text.split(' ').forEach((word, wi, arr) => {
    const wspan = document.createElement('span');
    wspan.className = 'word';
    [...word].forEach((ch) => {
      const s = document.createElement('span');
      s.className = 'char';
      s.textContent = ch;
      wspan.appendChild(s);
      chars.push(s);
    });
    el.appendChild(wspan);
    if (wi < arr.length - 1) el.appendChild(document.createTextNode(' '));
  });
  return chars;
}

function splitLines(el) {
  const html = el.innerHTML;
  const parts = html.split(/(<br\s*\/?>)/i);
  el.innerHTML = '';
  parts.forEach((part) => {
    if (/^<br/i.test(part)) { el.appendChild(document.createElement('br')); return; }
    part.split(/\s+/).filter(Boolean).forEach((word) => {
      const w = document.createElement('span');
      w.className = 'w';
      w.style.display = 'inline-block';
      w.style.marginRight = '0.26em';
      w.textContent = word;
      el.appendChild(w);
    });
  });
  // group words by vertical position into visual lines
  const words = $$('.w', el);
  const lines = [];
  let cur = [], top = null;
  words.forEach((w) => {
    const t = w.offsetTop;
    if (top === null) top = t;
    if (Math.abs(t - top) > 6) { lines.push(cur); cur = []; top = t; }
    cur.push(w);
  });
  if (cur.length) lines.push(cur);
  // rebuild as .line > .line-inner
  el.innerHTML = '';
  const inners = [];
  lines.forEach((line) => {
    const lineEl = document.createElement('span');
    lineEl.className = 'line';
    const inner = document.createElement('span');
    inner.className = 'line-inner';
    line.forEach((w) => inner.appendChild(w));
    lineEl.appendChild(inner);
    el.appendChild(lineEl);
    inners.push(inner);
  });
  return inners;
}

/* ---------- Reduced-motion: minimal, fully visible ---------- */
function bootReduced() {
  const pre = $('[data-preloader]');
  if (pre) pre.style.display = 'none';
  document.documentElement.classList.add('ready');
}

/* ---------- Full experience ---------- */
function boot() {
  /* Lenis smooth scroll */
  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // anchor smooth scroll
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id && id.length > 1) { e.preventDefault(); lenis.scrollTo(id, { duration: 1.4 }); }
    });
  });

  /* Custom cursor */
  const cursor = $('[data-cursor]');
  const dot = $('[data-cursor-dot]');
  if (cursor && dot && window.matchMedia('(hover: hover)').matches) {
    gsap.set([cursor, dot], { xPercent: -50, yPercent: -50, x: window.innerWidth / 2, y: window.innerHeight / 2 });
    let mx = window.innerWidth / 2, my = window.innerHeight / 2, cx = mx, cy = my;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      gsap.set(dot, { x: mx, y: my });
    });
    gsap.ticker.add(() => {
      cx += (mx - cx) * 0.16; cy += (my - cy) * 0.16;
      gsap.set(cursor, { x: cx, y: cy });
    });
    $$('[data-cursor-hover]').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  }

  /* Magnetic buttons */
  $$('.magnetic').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      gsap.to(el, { x: x * 0.3, y: y * 0.45, duration: 0.6, ease: 'power3.out' });
    });
    el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.4)' }));
  });

  /* Scroll progress */
  gsap.to('[data-progress]', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  /* Hero background parallax */
  gsap.to('[data-hero-bg]', { yPercent: 35, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* Marquee (seamless two-copy loop) */
  gsap.to('[data-marquee-track]', { xPercent: -100, repeat: -1, duration: 22, ease: 'none' });

  /* ---- Build hero entrance (after fonts so chars measure right) ---- */
  const heroTitle = $('.hero__title');
  const heroChars = heroTitle ? splitChars(heroTitle) : [];
  const heroReveals = $$('.hero [data-reveal]');
  heroReveals.forEach((el) => el.removeAttribute('data-reveal')); // owned by hero timeline
  gsap.set(heroChars, { yPercent: 115, opacity: 0 });
  gsap.set(heroReveals, { y: 30, opacity: 0 });

  const heroIn = gsap.timeline({ paused: true });
  heroIn
    .to(heroChars, { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.04, ease: 'expo.out' })
    .to(heroReveals, { y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out' }, '-=0.75');

  /* ---- Generic reveals ---- */
  gsap.set('[data-reveal]', { y: 32, opacity: 0 });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 0.9, stagger: 0.09, ease: 'power3.out', overwrite: true }),
  });

  /* ---- Section titles: line masks ---- */
  $$('[data-split-lines]').forEach((el) => {
    const inners = splitLines(el);
    gsap.set(inners, { yPercent: 115 });
    ScrollTrigger.create({
      trigger: el, start: 'top 86%',
      onEnter: () => gsap.to(inners, { yPercent: 0, duration: 1, stagger: 0.09, ease: 'expo.out' }),
    });
  });

  /* ---- Email char reveal ---- */
  $$('[data-split-chars]').forEach((el) => {
    if (el.classList.contains('hero__title')) return;
    const chars = splitChars(el);
    gsap.set(chars, { yPercent: 110, opacity: 0 });
    ScrollTrigger.create({
      trigger: el, start: 'top 90%',
      onEnter: () => gsap.to(chars, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.015, ease: 'power3.out' }),
    });
  });

  /* ---- Portrait reveal ---- */
  const portrait = $('[data-portrait]');
  if (portrait) {
    const img = portrait.querySelector('img, svg');
    // Auto-swap to a real photo if portrait.jpg exists (public/portrait.jpg in the Vite
    // project, or a portrait.jpg sitting next to preview.html). No code edit needed.
    const realPhoto = portrait.querySelector('img');
    if (realPhoto) {
      const probe = new Image();
      probe.onload = () => { realPhoto.src = 'portrait.jpg'; };
      probe.src = 'portrait.jpg';
    }
    gsap.set(portrait, { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.to(portrait, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: portrait, start: 'top 82%' } });
    if (img) gsap.fromTo(img, { scale: 1.35 }, { scale: 1.06, duration: 1.5, ease: 'expo.out', scrollTrigger: { trigger: portrait, start: 'top 82%' } });
  }

  /* ---- Timeline progress + dots ---- */
  const tlProgress = $('[data-timeline-progress]');
  if (tlProgress) {
    gsap.to(tlProgress, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '[data-timeline]', start: 'top 65%', end: 'bottom 75%', scrub: true } });
  }
  gsap.set('[data-tl]', { opacity: 0, y: 44 });
  $$('[data-tl]').forEach((item) => {
    ScrollTrigger.create({
      trigger: item, start: 'top 80%',
      onEnter: () => { gsap.to(item, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', overwrite: true }); item.classList.add('is-active'); },
      onLeaveBack: () => item.classList.remove('is-active'),
    });
  });

  /* ---- Nav: hide on scroll down, show on up ---- */
  const nav = $('[data-nav]');
  if (nav) {
    let last = 0;
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => {
        const y = self.scroll();
        if (y > last && y > 200) gsap.to(nav, { yPercent: -120, duration: 0.4, ease: 'power2.out' });
        else gsap.to(nav, { yPercent: 0, duration: 0.4, ease: 'power2.out' });
        last = y;
      },
    });
  }

  /* ---- Preloader → hero ---- */
  const counter = { v: 0 };
  const countEl = $('[data-count]');
  const intro = gsap.timeline();
  intro
    .to('[data-bar]', { scaleX: 1, duration: 1.2, ease: 'power2.inOut' }, 0)
    .to(counter, { v: 100, duration: 1.2, ease: 'power2.inOut', onUpdate: () => { if (countEl) countEl.textContent = Math.round(counter.v); } }, 0)
    .to('.preloader__inner, .preloader__bar', { opacity: 0, duration: 0.35 }, '+=0.15')
    .to('[data-preloader]', { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '-=0.05')
    .set('[data-preloader]', { display: 'none' })
    .add(() => heroIn.play(), '-=0.45');

  ScrollTrigger.refresh();
}

/* ---------- Init after fonts load (accurate line splitting) ---------- */
function init() {
  if (reduced) { bootReduced(); return; }
  try { boot(); } catch (err) { console.error(err); bootReduced(); }
}

const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
Promise.race([fontsReady, new Promise((r) => setTimeout(r, 1500))]).then(init);

// Safety net: never let the preloader trap the page
setTimeout(() => {
  const pre = $('[data-preloader]');
  if (pre && getComputedStyle(pre).display !== 'none' && !pre.dataset.done) {
    gsap.to(pre, { autoAlpha: 0, duration: 0.4, onComplete: () => (pre.style.display = 'none') });
  }
}, 6000);

window.addEventListener('load', () => ScrollTrigger.refresh());
