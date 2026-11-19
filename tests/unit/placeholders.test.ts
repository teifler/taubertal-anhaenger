import { describe, expect, it } from 'vitest';

import { createPlaceholderResolver } from '../../src/lib/placeholders';
import { makeTrailer, testSite } from './fixtures';

const small = makeTrailer({ id: 'klein', prices: { day: 20, weekend: 50, fiveDays: null, week: 100 }, deposit: 80 });
const large = makeTrailer({
  id: 'gross',
  prices: { day: 50, weekend: null, fiveDays: null, week: null },
  note: 'Gurte 10 €.',
});
const resolve = createPlaceholderResolver({ site: testSite, trailers: [small, large] });

describe('createPlaceholderResolver', () => {
  it('fills site-wide values', () => {
    expect(resolve('ab {minPrice}, Tel. {phone}, {street} in {city}')).toBe(
      'ab 20 €, Tel. 01234 567890, Teststraße 1 in Teststadt',
    );
  });

  it('fills per-trailer prices, deposit and note', () => {
    expect(resolve('{day:klein} / {weekend:klein} / {week:klein} / {deposit:klein} / {note:gross}')).toBe(
      '20 € / 50 € / 100 € / 80 € / Gurte 10 €.',
    );
  });

  it('leaves text without placeholders untouched', () => {
    expect(resolve('Kein Platzhalter, nur {Klammern mit Leerzeichen}.')).toBe(
      'Kein Platzhalter, nur {Klammern mit Leerzeichen}.',
    );
  });

  it.each([
    ['{unknown}', /unknown name/],
    ['{day:missing}', /unknown trailer id "missing"/],
    ['{fiveDays:klein}', /not set/],
    ['{note:klein}', /no note/],
    ['{colour:klein}', /unknown name "colour"/],
  ])('fails loudly for %s so a typo breaks the build', (text, message) => {
    expect(() => resolve(text)).toThrow(message);
  });
});
