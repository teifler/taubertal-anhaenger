import { describe, expect, it } from 'vitest';

import { faq, site, trailers } from '../../src/data';
import { buildStructuredData, serializeJsonLd } from '../../src/lib/structured-data';

const siteUrl = new URL('https://www.example.de/');
const imageUrls = Object.fromEntries(trailers.map((t) => [t.id, `https://www.example.de/_astro/${t.id}.webp`]));
const graph = buildStructuredData(siteUrl, imageUrls)['@graph'];
const byType = (type: string) => graph.find((node) => node['@type'] === type) as Record<string, unknown>;

describe('buildStructuredData', () => {
  it('describes the business with one offer per trailer', () => {
    const business = byType('LocalBusiness');
    const catalog = business.hasOfferCatalog as { itemListElement: { price: string; url: string }[] };
    expect(catalog.itemListElement).toHaveLength(trailers.length);
    expect(catalog.itemListElement.map((o) => o.price)).toEqual(trailers.map((t) => String(t.prices.day)));
    expect(catalog.itemListElement[0].url).toBe(`https://www.example.de/#${trailers[0].id}`);
  });

  it('derives the price range from the data', () => {
    const prices = trailers.map((t) => t.prices.day);
    expect(byType('LocalBusiness').priceRange).toBe(`${Math.min(...prices)}–${Math.max(...prices)}\u00A0€ pro Tag`);
  });

  it('mirrors the visible FAQ, with placeholders resolved', () => {
    const questions = byType('FAQPage').mainEntity as { name: string; acceptedAnswer: { text: string } }[];
    expect(questions.map((q) => q.name)).toEqual(faq.map((f) => f.question));
    expect(questions.map((q) => q.acceptedAnswer.text).join(' ')).not.toContain('{');
  });

  it('uses the content date, not the build date, so builds are reproducible', () => {
    expect(byType('WebPage').dateModified).toBe(site.lastUpdated);
  });

  it('leaves illustrations out of the business images', () => {
    const illustrations = trailers.filter((t) => t.isIllustration).map((t) => imageUrls[t.id]);
    expect(byType('LocalBusiness').image).not.toEqual(expect.arrayContaining(illustrations));
  });
});

describe('serializeJsonLd', () => {
  it('escapes "<" so content cannot close the script tag', () => {
    const json = serializeJsonLd({ text: '</script><script>alert(1)</script>' });
    expect(json).not.toContain('<');
    expect(JSON.parse(json)).toEqual({ text: '</script><script>alert(1)</script>' });
  });
});
