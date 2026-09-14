/**
 * يولّد صوراً بديلة (SVG) بنمط هندسي ذهبي لاستخدامها مؤقتاً
 * إلى حين استبدالها بصور المدرسة الحقيقية.
 *
 *   node tools/gen-placeholders.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../public/media');
mkdirSync(OUT, { recursive: true });

/* ---------- أنماط هندسية ---------- */

// نجمة ثمانية مكررة
const starTile = (size, stroke, w = 1) => {
  const s = size;
  const h = s / 2;
  const q = s / 4;
  return `
  <pattern id="p" width="${s}" height="${s}" patternUnits="userSpaceOnUse">
    <g fill="none" stroke="${stroke}" stroke-width="${w}">
      <path d="M${h} 0 L${s - q} ${q} L${s} ${h} L${s - q} ${s - q} L${h} ${s} L${q} ${s - q} L0 ${h} L${q} ${q} Z"/>
      <path d="M${h} ${q} L${s - q} ${h} L${h} ${s - q} L${q} ${h} Z"/>
      <path d="M0 0 L${s} ${s} M${s} 0 L0 ${s}" opacity=".45"/>
    </g>
  </pattern>`;
};

// شبكة معينات
const diamondTile = (size, stroke, w = 1) => `
  <pattern id="p" width="${size}" height="${size}" patternUnits="userSpaceOnUse">
    <g fill="none" stroke="${stroke}" stroke-width="${w}">
      <path d="M${size / 2} 0 L${size} ${size / 2} L${size / 2} ${size} L0 ${size / 2} Z"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 6}" opacity=".5"/>
    </g>
  </pattern>`;

// أقواس متشابكة
const archTile = (size, stroke, w = 1) => `
  <pattern id="p" width="${size}" height="${size}" patternUnits="userSpaceOnUse">
    <g fill="none" stroke="${stroke}" stroke-width="${w}">
      <path d="M0 ${size} L0 ${size / 2} A${size / 2} ${size / 2} 0 0 1 ${size} ${size / 2} L${size} ${size}"/>
      <path d="M${size / 4} ${size} L${size / 4} ${size * 0.62} A${size / 4} ${size / 4} 0 0 1 ${size * 0.75} ${size * 0.62} L${size * 0.75} ${size}" opacity=".55"/>
    </g>
  </pattern>`;

// خطوط قطرية دقيقة
const lineTile = (size, stroke, w = 1) => `
  <pattern id="p" width="${size}" height="${size}" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
    <g stroke="${stroke}" stroke-width="${w}">
      <line x1="0" y1="0" x2="0" y2="${size}"/>
      <line x1="${size / 2}" y1="0" x2="${size / 2}" y2="${size}" opacity=".4"/>
    </g>
  </pattern>`;

const TILES = { star: starTile, diamond: diamondTile, arch: archTile, line: lineTile };

/* ---------- مولّد الصورة ---------- */

function svg({ w, h, tile = 'star', tileSize = 96, hue = 'gold', seed = 0 }) {
  const accents = {
    gold: ['#D9B44A', '#8C6D1F'],
    jade: ['#2FBFA0', '#12705C'],
    azure: ['#5B8CFF', '#1D3A86'],
    ember: ['#E08A3C', '#7A3F12'],
  };
  const [a1, a2] = accents[hue] || accents.gold;
  const rot = (seed * 37) % 360;
  const gx = 18 + ((seed * 23) % 64);
  const gy = 12 + ((seed * 41) % 60);

  // نجمة ثمانية كبيرة في المنتصف تعطي الصورة شخصية بصرية
  const cx = w / 2, cy = h / 2;
  const R = Math.min(w, h) * 0.34;
  const star = (rad, rot2) => {
    const pts = [];
    for (let k = 0; k < 8; k++) {
      const a = (Math.PI / 4) * k + rot2;
      pts.push(`${(cx + Math.cos(a) * rad).toFixed(1)} ${(cy + Math.sin(a) * rad).toFixed(1)}`);
    }
    return `M${pts.join(' L')} Z`;
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#16203A"/>
      <stop offset=".5" stop-color="#0D1428"/>
      <stop offset="1" stop-color="#070B18"/>
    </linearGradient>
    <radialGradient id="glow" cx="${gx}%" cy="${gy}%" r="58%">
      <stop offset="0" stop-color="${a1}" stop-opacity=".3"/>
      <stop offset=".55" stop-color="${a2}" stop-opacity=".1"/>
      <stop offset="1" stop-color="${a2}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="1"/>
      <stop offset=".7" stop-color="#fff" stop-opacity=".6"/>
      <stop offset="1" stop-color="#fff" stop-opacity=".15"/>
    </linearGradient>
    <mask id="m"><rect width="${w}" height="${h}" fill="url(#fade)"/></mask>
    ${TILES[tile](tileSize, a1, 1.2)}
  </defs>

  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>

  <g transform="rotate(${rot} ${cx} ${cy})">
    <rect x="${-w}" y="${-h}" width="${w * 3}" height="${h * 3}"
          fill="url(#p)" opacity=".55" mask="url(#m)"/>
  </g>

  <g fill="none" stroke="${a1}" stroke-linejoin="round">
    <path d="${star(R, 0)}"          stroke-opacity=".42" stroke-width="1.6"/>
    <path d="${star(R, Math.PI / 8)}" stroke-opacity=".28" stroke-width="1.2"/>
    <path d="${star(R * 0.62, 0)}"   stroke-opacity=".2"  stroke-width="1"/>
    <circle cx="${cx}" cy="${cy}" r="${(R * 1.12).toFixed(1)}" stroke-opacity=".16"/>
    <circle cx="${cx}" cy="${cy}" r="${(R * 0.3).toFixed(1)}"  stroke-opacity=".3"/>
  </g>

  <rect x="14" y="14" width="${w - 28}" height="${h - 28}" rx="10"
        fill="none" stroke="${a1}" stroke-opacity=".26"/>
  <rect x="23" y="23" width="${w - 46}" height="${h - 46}" rx="6"
        fill="none" stroke="#F6F3EA" stroke-opacity=".06"/>
</svg>`;
}

/* ---------- القائمة ---------- */

const FILES = [
  ['about.svg',      { w: 900,  h: 1035, tile: 'star',    tileSize: 110, hue: 'gold',  seed: 1 }],
  ['principal.svg',  { w: 800,  h: 800,  tile: 'diamond', tileSize: 80,  hue: 'gold',  seed: 2 }],
  ['feature.svg',    { w: 1000, h: 700,  tile: 'arch',    tileSize: 120, hue: 'gold',  seed: 3 }],
  ['cine.svg',       { w: 1920, h: 1080, tile: 'star',    tileSize: 150, hue: 'gold',  seed: 4 }],

  ['facility-1.svg', { w: 840,  h: 1120, tile: 'arch',    tileSize: 110, hue: 'gold',  seed: 5 }],
  ['facility-2.svg', { w: 840,  h: 1120, tile: 'diamond', tileSize: 92,  hue: 'jade',  seed: 6 }],
  ['facility-3.svg', { w: 840,  h: 1120, tile: 'star',    tileSize: 104, hue: 'gold',  seed: 7 }],
  ['facility-4.svg', { w: 840,  h: 1120, tile: 'line',    tileSize: 40,  hue: 'gold',  seed: 8 }],
  ['facility-5.svg', { w: 840,  h: 1120, tile: 'arch',    tileSize: 96,  hue: 'gold',  seed: 9 }],
  ['facility-6.svg', { w: 840,  h: 1120, tile: 'star',    tileSize: 120, hue: 'jade',  seed: 10 }],

  ['stage-1.svg',    { w: 720,  h: 540,  tile: 'star',    tileSize: 84,  hue: 'gold',  seed: 11 }],
  ['stage-2.svg',    { w: 720,  h: 540,  tile: 'diamond', tileSize: 72,  hue: 'jade',  seed: 12 }],
  ['stage-3.svg',    { w: 720,  h: 540,  tile: 'arch',    tileSize: 90,  hue: 'gold',  seed: 13 }],
  ['stage-4.svg',    { w: 720,  h: 540,  tile: 'line',    tileSize: 34,  hue: 'gold',  seed: 14 }],

  ['gal-1.svg',      { w: 1200, h: 900,  tile: 'star',    tileSize: 120, hue: 'gold',  seed: 15 }],
  ['gal-2.svg',      { w: 1000, h: 700,  tile: 'diamond', tileSize: 86,  hue: 'jade',  seed: 16 }],
  ['gal-3.svg',      { w: 800,  h: 700,  tile: 'arch',    tileSize: 92,  hue: 'gold',  seed: 17 }],
  ['gal-4.svg',      { w: 800,  h: 700,  tile: 'line',    tileSize: 38,  hue: 'gold',  seed: 18 }],
  ['gal-5.svg',      { w: 1000, h: 700,  tile: 'star',    tileSize: 100, hue: 'gold',  seed: 19 }],
  ['gal-6.svg',      { w: 1200, h: 700,  tile: 'diamond', tileSize: 96,  hue: 'gold',  seed: 20 }],
  ['gal-7.svg',      { w: 1000, h: 700,  tile: 'arch',    tileSize: 104, hue: 'jade',  seed: 21 }],
  ['gal-8.svg',      { w: 800,  h: 700,  tile: 'star',    tileSize: 88,  hue: 'gold',  seed: 22 }],
];

for (const [name, cfg] of FILES) {
  writeFileSync(resolve(OUT, name), svg(cfg), 'utf8');
}

console.log(`تم توليد ${FILES.length} صورة في public/media`);
