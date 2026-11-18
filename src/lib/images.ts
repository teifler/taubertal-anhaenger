import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/images/*.{jpg,jpeg,png,webp}', { eager: true });

/** Looks up an image in src/assets/images by file name (as written in trailers.json). */
export function imageByFile(file: string): ImageMetadata {
  const match = Object.entries(files).find(([path]) => path.endsWith(`/${file}`));
  if (!match) throw new Error(`Image not found in src/assets/images: ${file}`);
  return match[1].default;
}
