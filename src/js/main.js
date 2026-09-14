/**
 * ثانوية المعالي الأهلية للبنين — نقطة الدخول
 * -------------------------------------------
 * ترتيب التشغيل: تمرير انسيابي ← شاشة التحميل ← المشهد ثلاثي الأبعاد ←
 * حركات الظهور ← تفاعلات الأقسام.
 */
import { initSmoothScroll, ScrollTrigger } from './smooth.js';
import { runPreloader } from './preloader.js';
import { initNav } from './nav.js';
import { initCursor, initMagnetic, initTilt, initChrome } from './ui.js';
import { initReveals, playHeroIntro } from './reveal.js';
import { initHero3D } from './hero3d.js';
import { linkHeroScroll, initCinematic, initHorizontal } from './scenes.js';
import {
  initCounters, initMarquee, initStagePeek,
  initQuotes, initGallery, initForm,
  initFaq, initQuickContact, initCopyPhone,
} from './interactions.js';

function boot() {
  // نبدأ دائماً من الأعلى حتى لا تتعارض شاشة التحميل مع موضع محفوظ أو رابط داخلي
  const deepLink = location.hash;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  const lenis = initSmoothScroll();

  /* المشهد ثلاثي الأبعاد — يبدأ مبكراً ليكون جاهزاً عند رفع الستار */
  let scene = null;
  try {
    scene = initHero3D(document.getElementById('hero-canvas'));
  } catch (err) {
    console.warn('تعذّر تشغيل المشهد ثلاثي الأبعاد:', err);
  }

  initNav(lenis);
  initChrome(lenis);
  initCursor();
  initMagnetic();
  initTilt();

  initReveals();
  linkHeroScroll(scene);
  initCinematic();
  initHorizontal();

  initCounters();
  initMarquee();
  initStagePeek();
  initQuotes();
  initGallery();
  initForm();
  initFaq();
  initQuickContact();
  initCopyPhone();

  runPreloader({
    lenis,
    onDone: () => {
      playHeroIntro();
      ScrollTrigger.refresh();
      // ننتقل إلى القسم المطلوب بعد اكتمال حسابات التثبيت (pin)
      const target = deepLink && document.querySelector(deepLink);
      if (target) {
        // أقسام مثبّتة (pin) تغيّر ارتفاع الصفحة، لذا نعيد الضبط عدة مرات حتى يستقر
        const settle = () => {
          ScrollTrigger.refresh();
          lenis.scrollTo(target, { offset: -70, immediate: true });
        };
        [200, 500, 900, 1600].forEach((ms) => setTimeout(settle, ms));
      }
    },
  });

  // إعادة الحساب بعد تحميل الخطوط حتى لا تختل مواضع التثبيت
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
