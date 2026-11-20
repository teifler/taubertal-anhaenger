import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// The GitHub Pages preview serves the site from a sub-path (/<repo>/), so internal links must go through
// withBase(). A plain href="/impressum/" works locally and in production but breaks the preview.
const ROOT_RELATIVE_LINK = /\b(?:href|src)=\{?["'`]\/(?!\/)|\bhref:\s*["'`]\/(?!\/)/;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && /\.(astro|ts)$/.test(entry.name))
    .map((entry) => join(entry.parentPath, entry.name));
}

describe('base path', () => {
  it('has no root-relative links outside withBase()', () => {
    const offenders = sourceFiles('src').flatMap((file) =>
      readFileSync(file, 'utf8')
        .split('\n')
        .flatMap((line, i) => (ROOT_RELATIVE_LINK.test(line) ? [`${file}:${i + 1}: ${line.trim()}`] : [])),
    );
    expect(offenders).toEqual([]);
  });
});
