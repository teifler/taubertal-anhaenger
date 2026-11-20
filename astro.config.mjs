// @ts-check
import { defineConfig, envField } from 'astro/config';

// The GitHub Pages preview is the same site served from a sub-path (https://<user>.github.io/<repo>/).
// The Pages job in .github/workflows/ci.yml sets these variables; every other build targets the real domain.
const isPagesPreview = process.env.DEPLOY_TARGET === 'github-pages';
if (isPagesPreview && !(process.env.PAGES_ORIGIN && process.env.PAGES_BASE_PATH)) {
  throw new Error('DEPLOY_TARGET=github-pages needs PAGES_ORIGIN and PAGES_BASE_PATH.');
}

// To move to another domain, change `site` here and the redirect target in public/.htaccess.
export default defineConfig({
  site: isPagesPreview ? process.env.PAGES_ORIGIN : 'https://www.taubertal-anhaenger.de',
  base: isPagesPreview ? process.env.PAGES_BASE_PATH : undefined,
  trailingSlash: 'always',
  build: { inlineStylesheets: 'always' },
  env: {
    schema: {
      // Read by BaseLayout: the preview is noindex, so it never competes with the real domain in search.
      DEPLOY_TARGET: envField.enum({
        context: 'server',
        access: 'public',
        values: ['production', 'github-pages'],
        default: 'production',
      }),
    },
  },
  // Emits a Content-Security-Policy <meta> with hashes for every inline script and style,
  // so no 'unsafe-inline' is needed.
  security: { csp: true },
  // No Markdown code blocks on this site; Shiki's inline styles would conflict with the CSP.
  markdown: { syntaxHighlight: false },
});
