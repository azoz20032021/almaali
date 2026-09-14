/** مؤشّر مخصّص، أزرار مغناطيسية، إمالة ثلاثية الأبعاد، شريط التقدّم، زر الصعود */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const fine = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ——————————————— المؤشّر ——————————————— */
export function initCursor() {
  if (!fine()) return;
  const ring = document.getElementById('cursor');
  const dot = document.getElementById('cursorDot');
  if (!ring || !dot) return;

  const setR = { x: gsap.quickTo(ring, 'x', { duration: 0.42, ease: 'power3' }),
                 y: gsap.quickTo(ring, 'y', { duration: 0.42, ease: 'power3' }) };
  const setD = { x: gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power3' }),
                 y: gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power3' }) };

  gsap.set([ring, dot], { xPercent: -50, yPercent: -50 });

  window.addEventListener('pointermove', (e) => {
    setR.x(e.clientX); setR.y(e.clientY);
    setD.x(e.clientX); setD.y(e.clientY);
  }, { passive: true });

  document.addEventListener('pointerleave', () => ring.classList.add('is-hidden'));
  document.addEventListener('pointerenter', () => ring.classList.remove('is-hidden'));

  const hot = 'a, button, [data-tilt], .gal__item, .stage, input, textarea, select';
  document.querySelectorAll(hot).forEach((el) => {
    el.addEventListener('pointerenter', () => ring.classList.add('is-hover'));
    el.addEventListener('pointerleave', () => ring.classList.remove('is-hover'));
  });
}

/* ——————————————— أزرار مغناطيسية ——————————————— */
export function initMagnetic() {
  if (!fine()) return;
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'elastic.out(1, 0.42)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'elastic.out(1, 0.42)' });

    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.32);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.42);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

/* ——————————————— إمالة + بقعة ضوء ——————————————— */
export function initTilt() {
  const cards = document.querySelectorAll('[data-tilt]');
  const canTilt = fine();

  cards.forEach((card) => {
    // بقعة الضوء تعمل على جميع الأجهزة عبر متغيّرات CSS
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', `${px * 100}%`);
      card.style.setProperty('--my', `${py * 100}%`);

      if (!canTilt) return;
      gsap.to(card, {
        rotateY: (px - 0.5) * 9,
        rotateX: -(py - 0.5) * 9,
        transformPerspective: 900,
        duration: 0.6,
        ease: 'power2.out',
      });
    });

    card.addEventListener('pointerleave', () => {
      if (!canTilt) return;
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.9, ease: 'elastic.out(1, 0.5)' });
    });
  });
}

/* ——————————————— شريط التقدّم + زر الصعود + السنة ——————————————— */
export function initChrome(lenis) {
  const bar = document.getElementById('progress');
  const top = document.getElementById('toTop');
  const year = document.getElementById('year');

  if (year) year.textContent = new Date().getFullYear();

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      if (bar) gsap.set(bar, { scaleX: self.progress });
      if (top) top.classList.toggle('is-on', self.scroll() > window.innerHeight * 0.9);
    },
  });

  top?.addEventListener('click', () => lenis?.scrollTo(0, { duration: 1.5 }));
}
