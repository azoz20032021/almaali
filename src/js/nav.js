/** شريط التنقّل + القائمة الجانبية للجوّال + تمييز القسم النشط */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initNav(lenis) {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  const items = menu ? [...menu.querySelectorAll('.menu__link')] : [];
  const links = [...document.querySelectorAll('.nav__link')];

  let menuOpen = false;

  /* ——— إظهار/إخفاء الشريط حسب اتجاه التمرير ——— */
  let last = 0;
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle('is-stuck', y > 40);
      if (!menuOpen) {
        nav.classList.toggle('is-hidden', y > 420 && y > last + 4);
      }
      last = y;
    },
  });

  /* ——— القائمة المنسدلة ——— */
  gsap.set(items, { y: 46, opacity: 0 });

  const tl = gsap.timeline({ paused: true })
    .to(menu, { clipPath: 'inset(0 0 0% 0)', duration: 0.75, ease: 'power4.inOut' })
    .to(items, { y: 0, opacity: 1, duration: 0.62, stagger: 0.055, ease: 'power3.out' }, 0.22)
    .from('.menu__foot', { opacity: 0, y: 20, duration: 0.5 }, 0.5);

  function toggleMenu(open) {
    menuOpen = open ?? !menuOpen;
    burger.classList.toggle('is-open', menuOpen);
    burger.setAttribute('aria-expanded', String(menuOpen));
    menu.classList.toggle('is-open', menuOpen);
    document.body.classList.toggle('is-locked', menuOpen);
    if (menuOpen) { lenis?.stop(); tl.play(); }
    else { lenis?.start(); tl.reverse(); }
  }

  burger?.addEventListener('click', () => toggleMenu());
  items.forEach((a) => a.addEventListener('click', () => toggleMenu(false)));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) toggleMenu(false); });

  /* ——— القسم النشط ——— */
  links.forEach((link) => {
    const id = link.getAttribute('href');
    const sec = document.querySelector(id);
    if (!sec) return;
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (self) => {
        if (self.isActive) {
          links.forEach((l) => l.classList.remove('is-active'));
          link.classList.add('is-active');
        }
      },
    });
  });
}
