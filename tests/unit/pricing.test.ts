import { describe, expect, it } from 'vitest';

import { dayPriceRange, hasLongTermPrices, PRICE_PERIODS } from '../../src/lib/pricing';
import { makeTrailer } from './fixtures';

describe('hasLongTermPrices', () => {
  it('is false when only the daily rate is known', () => {
    const trailer = makeTrailer({ prices: { day: 50, weekend: null, fiveDays: null, week: null } });
    expect(hasLongTermPrices(trailer)).toBe(false);
  });

  it('is true as soon as one longer period has a price', () => {
    const trailer = makeTrailer({ prices: { day: 50, weekend: null, fiveDays: null, week: 200 } });
    expect(hasLongTermPrices(trailer)).toBe(true);
  });
});

describe('dayPriceRange', () => {
  it('returns the cheapest and most expensive daily rate', () => {
    const trailers = [30, 20, 50].map((day) =>
      makeTrailer({ prices: { day, weekend: null, fiveDays: null, week: null } }),
    );
    expect(dayPriceRange(trailers)).toEqual({ min: 20, max: 50 });
  });

  it('throws for an empty list instead of returning Infinity', () => {
    expect(() => dayPriceRange([])).toThrow();
  });
});

describe('PRICE_PERIODS', () => {
  it('covers every price key exactly once, daily rate first', () => {
    const keys = PRICE_PERIODS.map((p) => p.key);
    expect(keys[0]).toBe('day');
    expect(new Set(keys)).toEqual(new Set(Object.keys(makeTrailer().prices)));
  });
});
