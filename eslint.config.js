// @ts-check
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import astro from 'eslint-plugin-astro';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores(['dist/', '.astro/', 'node_modules/', 'playwright-report/', 'test-results/', 'coverage/']),

  js.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  astro.configs['flat/recommended'],
  astro.configs['flat/jsx-a11y-strict'],

  {
    languageOptions: { globals: { ...globals.node } },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      eqeqeq: ['error', 'always'],
      'no-console': 'error',
      'prefer-const': 'error',
      // Scrollable regions (price table, photo strip) must be keyboard-focusable (WCAG 2.1.1).
      'astro/jsx-a11y/no-noninteractive-tabindex': ['error', { roles: ['region'] }],
    },
  },

  // Client-side scripts inside .astro files run in the browser.
  {
    files: ['**/*.astro/*.ts', '**/*.astro/*.js'],
    languageOptions: { globals: { ...globals.browser } },
  },

  // Command-line scripts report progress on stdout.
  {
    files: ['scripts/**'],
    rules: { 'no-console': 'off' },
  },

  // Must stay last: turns off rules that would fight Prettier.
  prettier,
);
