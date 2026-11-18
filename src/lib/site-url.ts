/** `Astro.site` is optional in Astro's types. This site needs it for canonical URLs, sitemap and JSON-LD. */
export function requireSite(site: URL | undefined): URL {
  if (!site) throw new Error('Set `site` in astro.config.mjs — absolute URLs are required for SEO output.');
  return site;
}

/** Absolute URL without trailing slash, e.g. "https://www.example.de". */
export function origin(site: URL): string {
  return site.href.replace(/\/$/, '');
}
