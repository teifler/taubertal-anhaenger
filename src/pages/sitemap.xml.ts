import type { APIRoute } from 'astro';
import { getImage } from 'astro:assets';

import { site as siteData, trailers } from '../data';
import { imageByFile } from '../lib/images';
import { siteRoot } from '../lib/site-url';

// Only the start page: Impressum and Datenschutz are noindex and must not be listed.
// Drawings (isIllustration) are left out of the image sitemap.
export const GET: APIRoute = async ({ site }) => {
  const root = siteRoot(site);
  const photoUrls: string[] = [];
  for (const trailer of trailers.filter((t) => !t.isIllustration)) {
    for (const image of trailer.images) {
      const result = await getImage({ src: imageByFile(image.file), width: 800, quality: 72 });
      photoUrls.push(new URL(result.src, root).href);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${root.href}</loc>
    <lastmod>${siteData.lastUpdated}</lastmod>
${photoUrls.map((url) => `    <image:image><image:loc>${url}</image:loc></image:image>`).join('\n')}
  </url>
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
