/** تفاعلات الأقسام: العدّادات، الشريط المتحرك، معاينة المراحل،
 *  الخط الزمني، آراء أولياء الأمور، المعرض، ونموذج التواصل. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const AR = new Intl.NumberFormat('en-US');

/* ——————————————— العدّادات ——————————————— */
export function initCounters() {
  document.querySelectorAll('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          v: end,
          duration: reduced() ? 0.01 : 2.1,
          ease: 'power2.out',
          onUpdate: () => { el.textContent = AR.format(Math.round(obj.v)); },
        });
      },
    });
  });
}

/* ——————————————— الشريط المتحرك ——————————————— */
export function initMarquee() {
  const track = document.getElementById('marqueeTrack');
  if (!track) return;

  const item = track.querySelector('.marquee__item');
  if (!item) return;

  // نكرّر المحتوى حتى يملأ ضعف عرض الشاشة على الأقل
  const need = Math.ceil((window.innerWidth * 2) / Math.max(item.offsetWidth, 1)) + 1;
  for (let i = 0; i < need; i++) track.appendChild(item.cloneNode(true));

  const total = item.offsetWidth + 41.6; // العنصر + الفجوة
  if (reduced()) return;

  const tween = gsap.to(track, {
    x: total,                    // من اليسار إلى اليمين ليطابق اتجاه القراءة
    duration: total / 55,
    ease: 'none',
    repeat: -1,
    modifiers: { x: (x) => `${parseFloat(x) % total}px` },
  });

  // يتباطأ ويتسارع مع سرعة التمرير
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      const v = gsap.utils.clamp(0.6, 3.2, 1 + Math.abs(self.getVelocity()) / 1400);
      gsap.to(tween, { timeScale: v, duration: 0.4, overwrite: true });
    },
  });
}

/* ——————————————— معاينة المراحل ——————————————— */
export function initStagePeek() {
  const peek = document.getElementById('stagePeek');
  const img = peek?.querySelector('img');
  const rows = document.querySelectorAll('.stage[data-peek]');
  if (!peek || !rows.length) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const xTo = gsap.quickTo(peek, 'x', { duration: 0.55, ease: 'power3' });
  const yTo = gsap.quickTo(peek, 'y', { duration: 0.55, ease: 'power3' });
  const rTo = gsap.quickTo(peek, 'rotate', { duration: 0.7, ease: 'power3' });
  gsap.set(peek, { xPercent: -50, yPercent: -50 });

  let lastX = 0;

  rows.forEach((row) => {
    row.addEventListener('pointerenter', () => {
      img.src = row.dataset.peek;
      gsap.to(peek, { opacity: 1, scale: 1, duration: 0.45, ease: 'power3.out' });
    });
    row.addEventListener('pointerleave', () => {
      gsap.to(peek, { opacity: 0, scale: 0.9, duration: 0.35, ease: 'power2.out' });
    });
    row.addEventListener('pointermove', (e) => {
      xTo(e.clientX); yTo(e.clientY);
      rTo(gsap.utils.clamp(-12, 12, (e.clientX - lastX) * 0.6));
      lastX = e.clientX;
    });
  });
}

/* ——————————————— شعارات المدرسة (عارض دوّار) ——————————————— */
export function initQuotes() {
  const stage = document.getElementById('quotesStage');
  if (!stage) return;
  const slides = [...stage.querySelectorAll('.quotes__slide')];
  const dotsWrap = document.getElementById('qDots');
  let i = 0, timer = null;

  slides.forEach((_, k) => {
    const d = document.createElement('button');
    d.className = 'quotes__dot' + (k === 0 ? ' is-on' : '');
    d.setAttribute('aria-label', `الرأي ${k + 1}`);
    d.addEventListener('click', () => go(k, true));
    dotsWrap.appendChild(d);
  });
  const dots = [...dotsWrap.children];

  gsap.set(slides.slice(1), { opacity: 0, y: 26 });

  function go(next, manual) {
    if (next === i) return;
    const cur = slides[i];
    const nxt = slides[next];

    gsap.to(cur, { opacity: 0, y: -22, duration: 0.5, ease: 'power2.in',
      onComplete: () => cur.classList.remove('is-on') });
    nxt.classList.add('is-on');
    gsap.fromTo(nxt, { opacity: 0, y: 26 },
      { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out', delay: 0.16 });

    dots[i].classList.remove('is-on');
    dots[next].classList.add('is-on');
    i = next;
    if (manual) restart();
  }

  const step = (d) => go((i + d + slides.length) % slides.length, true);
  document.getElementById('qNext')?.addEventListener('click', () => step(1));
  document.getElementById('qPrev')?.addEventListener('click', () => step(-1));

  function restart() {
    clearInterval(timer);
    timer = setInterval(() => go((i + 1) % slides.length), 7000);
  }
  restart();
  stage.addEventListener('pointerenter', () => clearInterval(timer));
  stage.addEventListener('pointerleave', restart);
}

/* ——————————————— المعرض + العارض ——————————————— */
export function initGallery() {
  const grid = document.getElementById('galGrid');
  const box = document.getElementById('lightbox');
  const img = document.getElementById('lbImg');
  const cap = document.getElementById('lbCap');
  if (!grid || !box) return;

  const items = [...grid.querySelectorAll('.gal__item')];
  let idx = 0;

  const open = (k) => {
    idx = (k + items.length) % items.length;
    const src = items[idx].querySelector('img');
    img.src = src.src;
    img.alt = src.alt;
    cap.textContent = `${src.alt} — ${idx + 1} / ${items.length}`;
    box.classList.add('is-open');
    document.body.classList.add('is-locked');
  };
  const close = () => {
    box.classList.remove('is-open');
    document.body.classList.remove('is-locked');
  };

  items.forEach((el, k) => el.addEventListener('click', () => open(k)));
  document.getElementById('lbClose')?.addEventListener('click', close);
  box.addEventListener('click', (e) => { if (e.target === box) close(); });

  window.addEventListener('keydown', (e) => {
    if (!box.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') open(idx + 1);   // اتجاه عربي: يسار = التالي
    if (e.key === 'ArrowRight') open(idx - 1);
  });
}

/* ——————————————— نموذج التواصل ——————————————— */
/** رقم المدرسة بصيغة واتساب الدولية */
export const SCHOOL_WA = '9647745557734';

export function initForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  // تمييز القائمة المنسدلة عند الاختيار لرفع التسمية
  const sel = form.querySelector('select');
  sel?.addEventListener('change', () => { sel.dataset.filled = sel.value ? '1' : ''; });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = document.getElementById('formOk');
    let valid = true;

    form.querySelectorAll('[required]').forEach((f) => {
      const bad = !f.value.trim();
      f.style.borderColor = bad ? 'rgba(224,90,90,.6)' : '';
      if (bad) valid = false;
    });

    if (!valid) {
      gsap.fromTo(form, { x: -7 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.35)' });
      return;
    }

    // يفتح واتساب برسالة جاهزة إلى رقم المدرسة
    const val = (n) => (form.elements[n]?.value || '').trim();
    const lines = [
      'طلب تسجيل من موقع ثانوية المعالي',
      `اسم وليّ الأمر: ${val('name')}`,
      `رقم الهاتف: ${val('phone')}`,
      val('student') && `اسم الطالب: ${val('student')}`,
      `الصف المطلوب: ${val('stage')}`,
      val('message') && `الاستفسار: ${val('message')}`,
    ].filter(Boolean);

    window.open(
      `https://wa.me/${SCHOOL_WA}?text=${encodeURIComponent(lines.join('\n'))}`,
      '_blank',
      'noopener'
    );

    ok.classList.add('is-on');
    gsap.fromTo(ok, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 });
    form.reset();
    if (sel) sel.dataset.filled = '';
  });
}

/* ——————————————— الأسئلة الشائعة ——————————————— */
export function initFaq() {
  const items = [...document.querySelectorAll('.faq__item')];
  if (!items.length) return;

  items.forEach((item) => {
    const answer = item.querySelector('.faq__answer');

    item.addEventListener('toggle', () => {
      if (item.open) {
        // أكورديون: يُغلق الباقي
        items.forEach((other) => { if (other !== item) other.open = false; });
        gsap.fromTo(answer,
          { height: 0, opacity: 0 },
          { height: 'auto', opacity: 1, duration: 0.45, ease: 'power2.out',
            onComplete: () => gsap.set(answer, { clearProps: 'height' }) });
      }
      ScrollTrigger.refresh();
    });
  });
}

/* ——————————————— أزرار التواصل السريع ——————————————— */
export function initQuickContact() {
  const quick = document.getElementById('quick');
  if (!quick) return;

  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      // تظهر بعد مغادرة الواجهة الرئيسية وتختفي عند التذييل
      const nearFooter = self.progress > 0.97;
      quick.classList.toggle('is-on', self.scroll() > window.innerHeight * 0.75 && !nearFooter);
    },
  });
}

/* ——————————————— نسخ رقم الهاتف ——————————————— */
export function initCopyPhone() {
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const value = btn.dataset.copy;
      const label = btn.querySelector('[data-copy-label]');
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        return; // المتصفّح منع الوصول إلى الحافظة
      }
      const old = label ? label.textContent : '';
      if (label) label.textContent = 'تم النسخ ✓';
      btn.classList.add('is-copied');
      setTimeout(() => {
        if (label) label.textContent = old;
        btn.classList.remove('is-copied');
      }, 1800);
    });
  });
}
