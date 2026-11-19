/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// getViteConfig gives the tests the same Vite setup as the site (astro:assets, import.meta.glob,
// the Container API for rendering components).
export default getViteConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
  },
});
