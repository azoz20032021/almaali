/** حركات الظهور عند التمرير + المنظر المتوازي (parallax) */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initReveals() {
  const soft = reduced();

  /* ——— العناوين: كشف تدريجي من الأسفل ———
     ملاحظة: لا نقسّم النص العربي إلى أسطر/حروف لأن ذلك يكسر
     اتصال الحروف ويُسقِط علامات التشكيل. نستخدم قناع clip-path
     على العنصر كاملاً بدل ذلك. */
  document.querySelectorAll('[data-reveal="lines"]').forEach((el) => {
    gsap.fromTo(el,
      { clipPath: 'inset(0% 0% 106% 0%)', y: 22, opacity: 0 },
      {
        clipPath: 'inset(0% 0% 0% 0%)', y: 0, opacity: 1,
        duration: soft ? 0.01 : 1.25,
        ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        onComplete: () => gsap.set(el, { clearProps: 'clipPath' }),
      });
  });

  /* ——— صعود بسيط ——— */
  document.querySelectorAll('[data-reveal="up"]').forEach((el) => {
    gsap.from(el, {
      y: 46,
      opacity: 0,
      duration: soft ? 0.01 : 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });

  /* ——— تلاشٍ وتكبير ——— */
  document.querySelectorAll('[data-reveal="fade"]').forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      scale: 0.965,
      duration: soft ? 0.01 : 1.25,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    });
  });

  /* ——— تتابع للعناصر الداخلية ——— */
  document.querySelectorAll('[data-reveal="stagger"]').forEach((el) => {
    gsap.from(el.children, {
      y: 26,
      opacity: 0,
      duration: soft ? 0.01 : 0.85,
      ease: 'power3.out',
      stagger: 0.11,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  /* ——— تتابع تلقائي لبطاقات الشبكات ——— */
  [
    ['.bento', '.bento__cell'],
    ['.dept__grid', '.dept__card'],
    ['.gal__grid', '.gal__item'],
    ['.adm__steps', '.adm__step'],
    ['.info__list', '.info__item'],
    ['.stages', '.stage'],
  ].forEach(([parent, child]) => {
    const p = document.querySelector(parent);
    if (!p) return;
    const kids = p.querySelectorAll(child);
    if (!kids.length) return;
    gsap.set(kids, { clearProps: 'opacity' });
    gsap.from(kids, {
      y: 40,
      opacity: 0,
      duration: soft ? 0.01 : 0.95,
      ease: 'power3.out',
      stagger: 0.075,
      scrollTrigger: { trigger: p, start: 'top 84%', once: true },
    });
  });

  if (soft) return;

  /* ——— منظر متوازي لصورة «عن المدرسة» ——— */
  const frame = document.querySelector('[data-parallax-frame]');
  const img = document.querySelector('[data-parallax-img]');
  if (frame && img) {
    gsap.fromTo(img,
      { scale: 1.22, yPercent: -7 },
      {
        scale: 1.02, yPercent: 7, ease: 'none',
        scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: 1 },
      });
    gsap.fromTo(frame,
      { clipPath: 'inset(14% 10% round 34px)' },
      {
        clipPath: 'inset(0% 0% round 34px)',
        duration: 1.5, ease: 'power3.out',
        scrollTrigger: { trigger: frame, start: 'top 88%', once: true },
      });
  }

  /* ——— العلامة المائية في التذييل ——— */
  const wm = document.querySelector('.watermark');
  if (wm) {
    gsap.fromTo(wm, { yPercent: 34, opacity: 0 }, {
      yPercent: 0, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: 1 },
    });
  }

  /* ——— انزياح لطيف للوحة التسجيل ——— */
  const panel = document.querySelector('.adm__panel');
  if (panel) {
    gsap.fromTo(panel, { yPercent: 6 }, {
      yPercent: -4, ease: 'none',
      scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
    });
  }
}

/** حركة دخول الواجهة الرئيسية بعد انتهاء شاشة التحميل */
export function playHeroIntro() {
  const soft = reduced();
  const q = (n) => document.querySelector(`[data-hero="${n}"]`);

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  tl.from(q(1), { y: 24, opacity: 0, duration: soft ? 0.01 : 0.9 }, 0)
    .from([q(2), q(3)], { yPercent: 112, opacity: 0, duration: soft ? 0.01 : 1.25, stagger: 0.1 }, 0.1)
    .from(q(4), { y: 28, opacity: 0, duration: soft ? 0.01 : 1 }, 0.5)
    .from(q(5), { y: 26, opacity: 0, duration: soft ? 0.01 : 0.9 }, 0.62)
    .from(q(6)?.children ?? [], { y: 24, opacity: 0, duration: soft ? 0.01 : 0.85, stagger: 0.1 }, 0.74)
    .from('.nav__inner > *', { y: -18, opacity: 0, duration: soft ? 0.01 : 0.8, stagger: 0.08 }, 0.15)
    .from('.hero__scroll', { opacity: 0, duration: 0.8 }, 0.9);

  return tl;
}
