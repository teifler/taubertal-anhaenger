/** `Astro.site` is optional in Astro's types. This site needs it for canonical URLs, sitemap and JSON-LD. */
export function requireSite(site: URL | undefined): URL {
  if (!site) throw new Error('Set `site` in astro.config.mjs — absolute URLs are required for SEO output.');
  return site;
}

/**
 * Absolute URL of the site root, including Astro's `base`.
 * "https://www.taubertal-anhaenger.de/" in production, "https://<user>.github.io/<repo>/" on GitHub Pages.
 */
export function siteRoot(site: URL | undefined): URL {
  return new URL(import.meta.env.BASE_URL, requireSite(site));
}

/** Absolute URL without trailing slash, e.g. "https://www.example.de" or "https://user.github.io/repo". */
export function origin(site: URL): string {
  return site.href.replace(/\/$/, '');
}

/**
 * Prefixes a root-relative path with Astro's `base`, so links keep working when the site is served from a
 * sub-path: `withBase('/impressum/')` is "/impressum/" in production and "/<repo>/impressum/" on GitHub Pages.
 */
export function withBase(path: `/${string}`): string {
  return import.meta.env.BASE_URL.replace(/\/$/, '') + path;
}
