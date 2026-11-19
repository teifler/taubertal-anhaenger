import { describe, expect, it } from 'vitest';

import { site, trailers } from '../../src/data';
import { buildLlmsTxt, buildPageMarkdown } from '../../src/lib/llms';

describe('buildLlmsTxt', () => {
  const text = buildLlmsTxt(new URL('https://www.example.de/'));

  it('follows the llms.txt layout: H1, then a blockquote summary', () => {
    const [h1, blank, summary] = text.split('\n');
    expect(h1).toBe(`# ${site.name} (${site.company})`);
    expect(blank).toBe('');
    expect(summary).toMatch(/^> /);
  });

  it('lists every trailer and links to its anchor on the given domain', () => {
    for (const trailer of trailers) {
      expect(text).toContain(`- ${trailer.name}:`);
      expect(text).toContain(`(https://www.example.de/#${trailer.id})`);
    }
  });

  it('says "längere Miete auf Anfrage" instead of listing unknown prices', () => {
    const dayOnly = trailers.find((t) => t.prices.weekend === null);
    expect(dayOnly).toBeDefined();
    expect(text).toMatch(new RegExp(`${dayOnly?.name}:.*längere Miete auf Anfrage`));
  });
});

describe('buildPageMarkdown', () => {
  it('matches the reviewed snapshot (update with `npm test -- -u` after content changes)', () => {
    expect(buildPageMarkdown()).toMatchSnapshot();
  });
});
