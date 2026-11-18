/**
 * Blurs licence plates in the trailer photos. Licence plates are personal data under the GDPR,
 * so they must not appear on the website or in the public repository.
 *
 * Reads the unredacted originals from private/original-photos (git-ignored) and writes the
 * redacted versions to src/assets/images. Regions are { left, top, width, height } in pixels
 * of the source image (most are 949×1265, planenanhaenger-2 is 670×893).
 * Every photo was checked by eye; trailer plates and the plates of towing cars are covered.
 *
 * Usage: node scripts/redact-plates.mjs
 */
import { existsSync } from 'node:fs';

import sharp from 'sharp';

const SOURCE = 'private/original-photos';
const TARGET = 'src/assets/images';

/** @type {Record<string, { left: number; top: number; width: number; height: number }[]>} */
const REGIONS = {
  'tandemanhaenger-2.jpg': [{ left: 712, top: 672, width: 116, height: 56 }],
  'tandemanhaenger-3.jpg': [{ left: 230, top: 694, width: 156, height: 60 }],
  'planenanhaenger-5.jpg': [{ left: 408, top: 822, width: 168, height: 54 }],
  'autotransporter-2.jpg': [
    { left: 658, top: 620, width: 130, height: 74 },
    { left: 104, top: 336, width: 80, height: 36 },
  ],
  'autotransporter-5.jpg': [
    { left: 194, top: 522, width: 78, height: 60 },
    { left: 744, top: 432, width: 66, height: 34 },
  ],
  'autotransporter-3.jpg': [{ left: 368, top: 442, width: 100, height: 80 }],
  'planenanhaenger-2.jpg': [{ left: 186, top: 826, width: 200, height: 54 }],
  'planenanhaenger-3.jpg': [
    { left: 94, top: 720, width: 74, height: 40 },
    { left: 670, top: 848, width: 74, height: 64 },
  ],
  'planenanhaenger-4.jpg': [
    { left: 112, top: 948, width: 98, height: 88 },
    { left: 728, top: 758, width: 60, height: 40 },
  ],
};

for (const [file, regions] of Object.entries(REGIONS)) {
  const source = `${SOURCE}/${file}`;
  if (!existsSync(source)) throw new Error(`Missing original: ${source}`);

  const overlays = await Promise.all(
    regions.map(async (region) => ({
      // Pixelate (shrink + enlarge without smoothing) and blur, so no characters can be recovered.
      input: await sharp(source)
        .extract(region)
        .resize(Math.max(1, Math.round(region.width / 28)), null)
        .resize(region.width, region.height, { kernel: 'nearest', fit: 'fill' })
        .blur(6)
        .toBuffer(),
      left: region.left,
      top: region.top,
    })),
  );

  await sharp(source).composite(overlays).jpeg({ quality: 90, mozjpeg: true }).toFile(`${TARGET}/${file}`);
  console.log(`redacted ${regions.length} region(s) in ${file}`);
}
