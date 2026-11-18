// @ts-check
import { defineConfig } from 'astro/config';

// To move to another domain, change `site` here and the redirect target in public/.htaccess.
export default defineConfig({
  site: 'https://www.taubertal-anhaenger.de',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'always' },
  // Emits a Content-Security-Policy <meta> with hashes for every inline script and style,
  // so no 'unsafe-inline' is needed.
  security: { csp: true },
  // No Markdown code blocks on this site; Shiki's inline styles would conflict with the CSP.
  markdown: { syntaxHighlight: false },
});
