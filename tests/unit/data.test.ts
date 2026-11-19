import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { faq, reviews, site, steps, trailers, useCases } from '../../src/data';
import { imageByFile } from '../../src/lib/images';

const raw = (file: string) => readFileSync(new URL(`../../src/data/${file}`, import.meta.url), 'utf8');

describe('content data', () => {
  it('has an image file for every image listed in trailers.json', () => {
    for (const trailer of trailers) {
      for (const image of trailer.images) {
        expect(() => imageByFile(image.file), image.file).not.toThrow();
      }
    }
  });

  it('only links use cases to existing trailers', () => {
    const ids = new Set(trailers.map((t) => t.id));
    for (const useCase of useCases) expect(ids).toContain(useCase.trailerId);
  });

  it('resolves every placeholder in FAQ answers and site texts', () => {
    const texts = [
      ...faq.map((f) => f.answer),
      ...steps.map((s) => s.text),
      ...Object.values(site.seo),
      ...Object.values(site.copy),
    ];
    for (const text of texts) expect(text).not.toMatch(/\{[a-zA-Z]+(:[a-z0-9-]+)?\}/);
  });

  // Prices live in trailers.json only. Other content must use placeholders such as {day:<id>}.
  it.each(['faq.json', 'site.json', 'steps.json', 'use-cases.json'])(
    '%s contains no hard-coded euro amounts',
    (file) => {
      expect(raw(file)).not.toMatch(/\d\s?€/);
    },
  );

  it.each(['faq.json', 'steps.json', 'use-cases.json'])('%s uses {street} instead of the address', (file) => {
    expect(raw(file)).not.toContain(site.address.street);
  });

  it('shows exactly one quote in the top bar and at most three in the hero', () => {
    expect(reviews.filter((r) => r.showInTopBar)).toHaveLength(1);
    expect(reviews.filter((r) => r.showInHero).length).toBeLessThanOrEqual(3);
  });

  it('keeps the page title within what Google displays', () => {
    expect(site.seo.title.length).toBeLessThanOrEqual(65);
    expect(site.seo.description.length).toBeLessThanOrEqual(160);
  });
});
