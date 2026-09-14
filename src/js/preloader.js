/** شاشة التحميل الافتتاحية */
import { gsap } from 'gsap';

export function runPreloader({ lenis, onDone }) {
  const loader = document.getElementById('loader');
  const fill = document.getElementById('loaderFill');
  const pct = document.getElementById('loaderPct');
  const curtain = document.getElementById('curtain');
  const name = document.querySelector('.loader__name');
  const logo = document.querySelector('.loader__logo');

  if (!loader) { onDone?.(); return; }

  lenis?.stop();
  document.body.classList.add('is-locked');

  gsap.set(name, { y: 14 });
  gsap.set(logo, { scale: 0.72, opacity: 0, rotate: -14 });

  const counter = { v: 0 };
  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onComplete: () => {
      loader.style.display = 'none';
      document.body.classList.remove('is-locked');
      lenis?.start();
      onDone?.();
    },
  });

  tl.to(logo, { scale: 1, opacity: 1, rotate: 0, duration: 1.25, ease: 'elastic.out(1, 0.62)' }, 0)
    .to(name, { opacity: 1, y: 0, duration: 0.7 }, 0.35)
    .to(counter, {
      v: 100,
      duration: 1.5,
      ease: 'power1.inOut',
      onUpdate: () => {
        const v = Math.round(counter.v);
        if (pct) pct.textContent = v;
        if (fill) gsap.set(fill, { scaleX: v / 100 });
      },
    }, 0.2)
    .to('.loader__inner', { y: -18, opacity: 0, duration: 0.55, ease: 'power2.in' }, '+=0.15')
    .to(curtain, { y: '0%', duration: 0.7, ease: 'power3.inOut' }, '<0.1')
    .set(loader, { opacity: 0 })
    .to(curtain, { y: '-100%', duration: 0.85, ease: 'power3.inOut' }, '+=0.05');

  return tl;
}
