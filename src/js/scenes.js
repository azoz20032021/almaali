/** المشاهد المرتبطة بالتمرير: الجولة السينمائية + شريط المرافق الأفقي */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ————————————————————————————————————————————
   ربط تقدّم التمرير في الواجهة الرئيسية بالمشهد ثلاثي الأبعاد
   ———————————————————————————————————————————— */
export function linkHeroScroll(scene) {
  if (!scene) return;
  ScrollTrigger.create({
    trigger: '#home',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => scene.setProgress(self.progress),
  });

  if (reduced()) return;
  gsap.to('.hero__inner', {
    yPercent: -14,
    opacity: 0.2,
    ease: 'none',
    scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true },
  });
}

/* ————————————————————————————————————————————
   الجولة السينمائية: إطار يتّسع مع التمرير
   ———————————————————————————————————————————— */
export function initCinematic() {
  const section = document.getElementById('cine');
  const media = document.getElementById('cineMedia');
  const phone = document.getElementById('cinePhone');
  const video = document.getElementById('cineVideo');
  const playBtn = document.getElementById('cinePlay');
  const hint = document.getElementById('cineHint');
  if (!section || !media) return;

  if (!reduced()) {
    // الخلفية تتّسع من إطار مصغّر إلى ملء الشاشة
    gsap.fromTo(media,
      { clipPath: 'inset(24% 26% round 28px)' },
      {
        clipPath: 'inset(0% 0% round 0px)',
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top top', end: '55% top', scrub: 0.6 },
      });

    gsap.fromTo('.cine__stage',
      { scale: 0.92, opacity: 0.55 },
      {
        scale: 1, opacity: 1, ease: 'power2.out',
        scrollTrigger: { trigger: section, start: 'top 75%', end: '30% top', scrub: 0.6 },
      });

    // دخول الهاتف: انزلاق وتكبير فقط — بلا دوران يشوّه صورة الفيديو
    gsap.fromTo(phone,
      { y: 46, scale: 0.94, opacity: 0 },
      {
        y: 0, scale: 1, opacity: 1, ease: 'power3.out', duration: 1.1,
        scrollTrigger: { trigger: section, start: 'top 72%', once: true },
      });

    // طفوٌ لطيف ومستمر
    gsap.to(phone, {
      y: -12, duration: 3.4, ease: 'sine.inOut',
      repeat: -1, yoyo: true, delay: 1.1,
    });

    gsap.to('.cine__stage', {
      opacity: 0, y: -40, ease: 'none',
      scrollTrigger: { trigger: section, start: '80% top', end: 'bottom bottom', scrub: 0.6 },
    });
  }

  /* ——— الفيديو: يُحمَّل فقط إن كان الملف موجوداً ——— */
  const SRC = './media/campus.mp4';
  let ready = false;

  fetch(SRC, { method: 'HEAD' })
    .then((r) => {
      if (!r.ok) throw new Error('no video');
      ready = true;

      // لا نُحمّل الملف إلا عند اقتراب القسم — توفيراً لباقة الزائر
      let loaded = false;
      ScrollTrigger.create({
        trigger: section,
        start: 'top 90%',
        end: 'bottom top',
        onToggle: (self) => {
          if (!self.isActive) { video.pause(); return; }
          if (!loaded) { loaded = true; video.src = SRC; }
          video.play().catch(() => {});
        },
      });
    })
    .catch(() => {
      if (hint) hint.textContent = 'شاهد قاعاتنا';
    });

  playBtn?.addEventListener('click', () => {
    if (!ready) {
      document.getElementById('facilities')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (!video.src) video.src = SRC;
    if (video.muted || video.paused) {
      video.muted = false;
      video.play().catch(() => {});
      playBtn.classList.add('is-playing');
      if (hint) hint.textContent = 'اضغط لكتم الصوت';
    } else {
      video.muted = true;
      playBtn.classList.remove('is-playing');
      if (hint) hint.textContent = 'اضغط لتشغيل الصوت';
    }
  });
}

/* ————————————————————————————————————————————
   شريط المرافق: تمرير أفقي مثبّت
   ———————————————————————————————————————————— */
export function initHorizontal() {
  const section = document.querySelector('.facil');
  const track = document.getElementById('facilTrack');
  if (!section || !track) return;

  const mm = gsap.matchMedia();

  mm.add('(min-width: 861px) and (prefers-reduced-motion: no-preference)', () => {
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 48);

    const tween = gsap.to(track, {
      x: () => distance(),           // اتجاه موجب لأن التخطيط من اليمين إلى اليسار
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${distance() + window.innerHeight * 0.4}`,
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    return () => { tween.scrollTrigger?.kill(); tween.kill(); gsap.set(track, { x: 0 }); };
  });

  /* على الشاشات الصغيرة: سحب أفقي طبيعي */
  mm.add('(max-width: 860px)', () => {
    const vp = document.getElementById('facilViewport');
    vp.style.overflowX = 'auto';
    vp.style.scrollSnapType = 'x mandatory';
    vp.style.paddingBottom = '.5rem';
    track.querySelectorAll('.facil__card').forEach((c) => (c.style.scrollSnapAlign = 'center'));
    return () => { vp.style.overflowX = ''; vp.style.scrollSnapType = ''; };
  });
}
