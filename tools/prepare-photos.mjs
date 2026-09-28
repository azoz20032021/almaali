/**
 * يقصّ صور الموقع من ملصقات المدرسة الأصلية.
 *
 *   node tools/prepare-photos.mjs
 *
 * المصادر المتوقّعة في public/media/photos/ :
 *   room-teaching.jpg      ملصق «غرفة التعليم»      1440×1440
 *   room-lab.jpg           ملصق «غرفة المختبرات»    1440×1440
 *   room-achievements.jpg  ملصق «غرفة الإنجازات»    1440×960
 *
 * إحداثيات القصّ مضبوطة لتتفادى نصوص الملصق وشرائط الإحصاءات.
 * إن استبدلت الملصقات بصور جديدة فعدّل الأرقام أدناه.
 */
import sharp from 'sharp';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../public/media/photos');
const p = (n) => resolve(DIR, n);

/** [المصدر, x, y, العرض, الارتفاع, الناتج, عرض الإخراج] */
const CROPS = [
  ['room-teaching.jpg',     150, 400, 800, 500, 'fac-teaching.jpg',  1120],
  ['room-lab.jpg',          120, 430, 800, 500, 'fac-lab.jpg',       1120],
  ['room-lab.jpg',          600, 495, 500, 313, 'fac-equipment.jpg', 1120],
  ['room-achievements.jpg', 355, 175, 800, 500, 'fac-honours.jpg',   1120],
  ['room-teaching.jpg',     100, 400, 1000, 500, 'cine-poster.jpg',  1600],
  ['room-lab.jpg',          250, 430, 520, 440, 'about.jpg',          900],
  ['room-achievements.jpg', 352, 268, 836, 382, 'crop-students.jpg',  836],
];

/** صور الطلبة المتفوّقين — تُقصّ من crop-students.jpg بعد توليده */
const PORTRAITS = [
  ['p-yahya.jpg',      12, 8, 232, 278],
  ['p-abdullah.jpg',  288, 8, 244, 278],
  ['p-mohammed.jpg',  566, 8, 252, 278],
];

/** الشعار الدائري — يُقصّ من ترويسة ملصق المختبرات ثم تُوحَّد خلفيته */
async function buildLogo() {
  const S = 720;
  const INNER = 592;
  const pad = (S - INNER) / 2;

  const { data, info } = await sharp(p('room-lab.jpg'))
    .extract({ left: 454, top: 42, width: 246, height: 206 })
    .resize({ width: INNER, height: INNER, fit: 'contain', background: '#ffffff', kernel: 'lanczos3' })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: '#ffffff' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  // البكسلات القريبة من الكريمي تصبح أبيض نقياً
  for (let i = 0; i < data.length; i += info.channels) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    if (r > 212 && g > 206 && b > 194 && Math.max(r, g, b) - Math.min(r, g, b) < 36) {
      data[i] = data[i + 1] = data[i + 2] = 255;
    }
  }

  const mask = Buffer.from(
    `<svg width="${S}" height="${S}"><circle cx="${S / 2}" cy="${S / 2}" r="${S / 2}" fill="#fff"/></svg>`
  );

  await sharp(data, { raw: info })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png({ compressionLevel: 9 })
    .toFile(resolve(DIR, '../logo.png'));
}

const run = async () => {
  for (const [src, left, top, width, height, out, outW] of CROPS) {
    await sharp(p(src))
      .extract({ left, top, width, height })
      .resize({ width: outW, kernel: 'lanczos3' })
      .jpeg({ quality: 88 })
      .toFile(p(out));
  }

  for (const [out, left, top, width, height] of PORTRAITS) {
    await sharp(p('crop-students.jpg'))
      .extract({ left, top, width, height })
      .resize({ width: 600, fit: 'cover' })
      .jpeg({ quality: 92 })
      .toFile(p(out));
  }

  await buildLogo();
  console.log(`تم توليد ${CROPS.length + PORTRAITS.length} صورة + الشعار`);
};

run().catch((err) => { console.error(err); process.exit(1); });
