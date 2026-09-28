/**
 * مشهد ثلاثي الأبعاد للواجهة الرئيسية (Three.js)
 * ----------------------------------------------
 * «وسام المعالي»: ميدالية معدنية تحمل شعار المدرسة، بإطار ذهبي مصقول،
 * تطفو داخل حلقات مدارية وسحابة من الغبار الذهبي وتتفاعل مع حركة المؤشّر.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const LOGO_SRC = './media/logo-hd.webp'; // 2048px — دقة عالية لوجه الوسام

/* نسيج دائري ناعم للجسيمات */
function makeDotTexture() {
  const s = 64;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.35, 'rgba(255,248,226,0.75)');
  grd.addColorStop(1, 'rgba(255,248,226,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* هالة ضوئية خلف الوسام */
function makeGlowTexture() {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grd.addColorStop(0, 'rgba(255,231,160,0.6)');
  grd.addColorStop(0.22, 'rgba(214,170,64,0.3)');
  grd.addColorStop(0.58, 'rgba(150,112,32,0.08)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* بديل نصّي للشعار إن تعذّر تحميل الصورة */
function makeFallbackLogoTexture() {
  const s = 512;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d');
  g.fillStyle = '#F6F3EA';
  g.beginPath();
  g.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#0B1A5E';
  g.lineWidth = 14;
  g.beginPath();
  g.arc(s / 2, s / 2, s * 0.36, -0.6, Math.PI * 1.45);
  g.stroke();
  g.fillStyle = '#0B1A5E';
  g.font = `600 ${s * 0.2}px "Reem Kufi", sans-serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('المعالي', s / 2, s / 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function initHero3D(canvas) {
  if (!canvas) return null;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let gl;
  try {
    gl = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: window.devicePixelRatio < 2,
      powerPreference: 'high-performance',
    });
  } catch {
    return null; // لا يوجد دعم WebGL — الواجهة تبقى جميلة بدونه
  }

  const host = canvas.parentElement;
  const size = () => ({ w: host.clientWidth, h: host.clientHeight || window.innerHeight });

  let { w, h } = size();
  const dpr = () => Math.min(window.devicePixelRatio, 2);

  gl.setPixelRatio(dpr());
  gl.setSize(w, h, false);
  gl.setClearColor(0x000000, 0);
  gl.outputColorSpace = THREE.SRGBColorSpace;
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
  camera.position.set(0, 0, 7);

  /* ——— بيئة انعكاس تمنح الذهب لمعانه ——— */
  const pmrem = new THREE.PMREMGenerator(gl);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  /* ——— إضاءة ——— */
  scene.add(new THREE.AmbientLight(0xffe9bd, 0.55));

  const key = new THREE.DirectionalLight(0xfff3d6, 2.6);
  key.position.set(3.4, 3.2, 5);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x6f8cff, 1.1);
  fill.position.set(-4.2, -1.6, 2.4);
  scene.add(fill);

  const rim = new THREE.PointLight(0xffc766, 18, 18, 2);
  rim.position.set(-2.2, 1.6, -3.2);
  scene.add(rim);

  /* ——— المجموعة الرئيسية ——— */
  const root = new THREE.Group();
  scene.add(root);

  /* الهالة */
  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: makeGlowTexture(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      opacity: 0.9,
    })
  );
  glow.scale.setScalar(8.2);
  glow.position.z = -1.6;
  root.add(glow);

  /* ——— الوسام ——— */
  const medal = new THREE.Group();
  root.add(medal);

  const R = 1.5;

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xd7ad4e,
    metalness: 1,
    roughness: 0.22,
    envMapIntensity: 1.5,
    transparent: true,
  });

  const faceMat = new THREE.MeshStandardMaterial({
    // مجموع الإضاءة على الوجه ≈ 2.7 ضعف، فنخفّض لون القاعدة كي تظهر ألوان الشعار الحقيقية
    color: 0xcbcbcb,
    metalness: 0,
    roughness: 0.9,
    envMapIntensity: 0.25,
    transparent: true,
    // نستثني الشعار من ضغط الألوان (ACES) حتى يبقى الأزرق والذهبي بألوانهما الأصلية
    toneMapped: false,
  });

  const backMat = new THREE.MeshStandardMaterial({
    color: 0xb9903c,
    metalness: 1,
    roughness: 0.34,
    envMapIntensity: 1.25,
    transparent: true,
  });

  // جسم الوسام: [الجانب، الوجه الأمامي، الوجه الخلفي]
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(R, R, 0.17, 128, 1),
    [goldMat, backMat, backMat]
  );
  body.rotation.x = Math.PI / 2;
  medal.add(body);

  // وجه الشعار: قرص مستقل يواجه الكاميرا مباشرة، فاتجاه الصورة مضمون
  const face = new THREE.Mesh(new THREE.CircleGeometry(R * 0.995, 128), faceMat);
  face.position.z = 0.0865;
  medal.add(face);

  // إطار مصقول حول الوسام
  const bezel = new THREE.Mesh(
    new THREE.TorusGeometry(R + 0.015, 0.085, 28, 180),
    new THREE.MeshStandardMaterial({
      color: 0xe9c568, metalness: 1, roughness: 0.14,
      envMapIntensity: 1.9, transparent: true,
    })
  );
  medal.add(bezel);

  // خيط ذهبي خارجي رفيع
  const hairline = new THREE.Mesh(
    new THREE.TorusGeometry(R + 0.18, 0.012, 12, 180),
    new THREE.MeshStandardMaterial({
      color: 0xf3e2ac, metalness: 1, roughness: 0.2,
      envMapIntensity: 2.2, transparent: true, opacity: 0.75,
    })
  );
  medal.add(hairline);

  /* تحميل شعار المدرسة على وجه الوسام */
  const loader = new THREE.TextureLoader();
  loader.load(
    LOGO_SRC,
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = gl.capabilities.getMaxAnisotropy();
      faceMat.map = tex;
      faceMat.needsUpdate = true;
    },
    undefined,
    () => {
      faceMat.map = makeFallbackLogoTexture();
      faceMat.needsUpdate = true;
    }
  );

  /* ——— حلقات مدارية ——— */
  const rings = new THREE.Group();
  const ringSpecs = [
    { r: 2.25, t: 0.006, rx: 1.18, rz: 0.26, o: 0.55 },
    { r: 2.68, t: 0.005, rx: -0.74, rz: -0.48, o: 0.38 },
    { r: 3.15, t: 0.004, rx: 0.34, rz: 1.02, o: 0.22 },
  ];
  ringSpecs.forEach((s) => {
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(s.r, s.t, 3, 220),
      new THREE.MeshBasicMaterial({
        color: 0xe7cc7c, transparent: true, opacity: s.o, depthWrite: false,
      })
    );
    m.rotation.set(s.rx, 0, s.rz);
    rings.add(m);
  });
  root.add(rings);

  /* ——— غبار ذهبي ——— */
  const COUNT = window.innerWidth < 760 ? 2200 : 4600;
  const pos = new Float32Array(COUNT * 3);
  const seed = new Float32Array(COUNT);
  const scale = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    const r = 2.5 + Math.pow(Math.random(), 1.7) * 7.4;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.74;
    pos[i * 3 + 2] = r * Math.cos(ph) * 0.55;
    seed[i] = Math.random() * 100;
    scale[i] = 0.5 + Math.random() * 1.6;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  pGeo.setAttribute('aScale', new THREE.BufferAttribute(scale, 1));

  const pUniforms = {
    uTime: { value: 0 },
    uSize: { value: 30 * dpr() },
    uTex: { value: makeDotTexture() },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uFade: { value: 1 },
  };

  const pMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: pUniforms,
    vertexShader: /* glsl */ `
      attribute float aSeed;
      attribute float aScale;
      uniform float uTime;
      uniform float uSize;
      uniform vec2  uPointer;
      varying float vAlpha;

      void main() {
        vec3 p = position;
        float t = uTime * 0.32 + aSeed;
        p.x += sin(t * 0.7) * 0.28;
        p.y += cos(t * 0.55) * 0.26;
        p.z += sin(t * 0.42) * 0.2;
        p.xy += uPointer * (0.5 + aScale * 0.55);

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float twinkle = 0.45 + 0.55 * sin(uTime * 1.5 + aSeed * 3.1);
        vAlpha = twinkle * smoothstep(26.0, 5.0, -mv.z);

        gl_PointSize = (uSize * aScale) / max(-mv.z, 0.001);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uTex;
      uniform float uFade;
      varying float vAlpha;
      void main() {
        vec4 tex = texture2D(uTex, gl_PointCoord);
        float a = tex.a * vAlpha * uFade;
        if (a < 0.01) discard;
        gl_FragColor = vec4(mix(vec3(1.0, 0.93, 0.74), vec3(0.86, 0.68, 0.28), 1.0 - vAlpha), a);
      }`,
  });

  const points = new THREE.Points(pGeo, pMat);
  root.add(points);

  /* ——— تفاعل المؤشّر ——— */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = (e) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = -((e.clientY / window.innerHeight) * 2 - 1);
  };
  window.addEventListener('pointermove', onMove, { passive: true });

  /* ——— حالة التمرير ——— */
  const state = { progress: 0 };

  /* ——— التموضع حسب حجم الشاشة ———
     على الشاشات الواسعة: الوسام إلى يسار الشاشة والنص العربي إلى يمينها.
     على الشاشات الضيّقة: لا تتوفّر مساحة خالية، فيتحوّل الوسام إلى
     علامة مائية خافتة خلف النص بينما يبقى الغبار الذهبي ظاهراً. */
  const layout = { baseX: 0, baseY: 0, scale: 1, dim: 1, medalDim: 1 };

  function computeLayout() {
    const vw = window.innerWidth;
    const visH = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360);
    const visW = visH * (w / h);

    if (vw >= 1280) {
      layout.baseX = (0.28 - 0.5) * visW;
      layout.baseY = 0.1;
      layout.scale = 1;
      layout.dim = 1;
      layout.medalDim = 1;
    } else if (vw >= 1024) {
      layout.baseX = (0.26 - 0.5) * visW;
      layout.baseY = 0.08;
      layout.scale = 0.84;
      layout.dim = 0.95;
      layout.medalDim = 1;
    } else if (vw >= 760) {
      layout.baseX = (0.3 - 0.5) * visW;
      layout.baseY = 0.05;
      layout.scale = 0.66;
      layout.dim = 0.8;
      layout.medalDim = 0.8;
    } else {
      // هاتف: علامة مائية خلف العنوان
      layout.baseX = 0;
      layout.baseY = visH * 0.04;
      layout.scale = 0.62;
      layout.dim = 0.6;
      layout.medalDim = 0.26;
    }
  }
  computeLayout();

  /* ——— إيقاف الحلقة خارج الشاشة ——— */
  let visible = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
  io.observe(host);

  const setOpacity = (v) => {
    goldMat.opacity = v;
    faceMat.opacity = v;
    backMat.opacity = v;
    bezel.material.opacity = v;
    hairline.material.opacity = 0.75 * v;
  };

  /* ——— حلقة الرسم ——— */
  const clock = new THREE.Clock();
  let raf = 0;
  let t = 0;

  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!visible) return;
    t += dt * (reduced ? 0.25 : 1);

    pointer.x += (pointer.tx - pointer.x) * Math.min(dt * 3.2, 1);
    pointer.y += (pointer.ty - pointer.y) * Math.min(dt * 3.2, 1);

    const sp = state.progress;

    // الوسام يتمايل ويتبع المؤشّر دون أن يخفي الشعار
    medal.rotation.y = Math.sin(t * 0.34) * 0.36 + pointer.x * 0.42;
    medal.rotation.x = Math.cos(t * 0.27) * 0.16 - pointer.y * 0.3 + sp * 0.85;
    medal.rotation.z = Math.sin(t * 0.19) * 0.05;
    medal.position.y = Math.sin(t * 0.8) * 0.09;

    rings.rotation.y = t * 0.09 + sp * 0.9;
    rings.rotation.x = Math.sin(t * 0.13) * 0.24;
    rings.children.forEach((r, i) => { r.material.opacity = ringSpecs[i].o * (1 - sp) * layout.dim; });

    points.rotation.y = t * 0.018;
    pUniforms.uTime.value = t;
    pUniforms.uPointer.value.set(pointer.x * 0.45, pointer.y * 0.45);
    pUniforms.uFade.value = (1 - sp * 0.9) * layout.dim;

    setOpacity(Math.max(0, 1 - sp * 1.1) * layout.medalDim);
    glow.material.opacity = 0.9 * (1 - sp * 0.85) * layout.dim;

    root.position.x = layout.baseX + pointer.x * 0.34;
    root.position.y = layout.baseY + pointer.y * 0.24 - sp * 1.5;
    root.scale.setScalar(layout.scale * (1 + sp * 0.28));

    camera.position.z = 7 + sp * 1.5;
    camera.lookAt(0, 0, 0);

    gl.render(scene, camera);
  }
  frame();

  /* ——— تغيير الحجم ——— */
  let resizeRaf = 0;
  function resize() {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      const s = size();
      if (!s.w || !s.h) return;
      w = s.w; h = s.h;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      gl.setPixelRatio(dpr());
      gl.setSize(w, h, false);
      pUniforms.uSize.value = 30 * dpr();
      computeLayout();
    });
  }
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);

  return {
    /** تُستدعى من ScrollTrigger بقيمة 0 → 1 */
    setProgress(p) { state.progress = p; },
    destroy() {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('orientationchange', resize);
      window.removeEventListener('pointermove', onMove);
      pmrem.dispose();
      gl.dispose();
    },
  };
}
