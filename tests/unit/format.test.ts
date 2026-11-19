import { describe, expect, it } from 'vitest';

import { capitalize, formatEuro, formatRating, numberWord } from '../../src/lib/format';

describe('formatEuro', () => {
  it('uses German grouping and a non-breaking space before the euro sign', () => {
    expect(formatEuro(20)).toBe('20 €');
    expect(formatEuro(1500)).toBe('1.500 €');
  });

  it('rounds to whole euros', () => {
    expect(formatEuro(19.6)).toBe('20 €');
  });
});

describe('formatRating', () => {
  it('always shows one decimal with a comma', () => {
    expect(formatRating(5)).toBe('5,0');
    expect(formatRating(4.66)).toBe('4,7');
  });
});

describe('numberWord', () => {
  it('writes small counts as German words', () => {
    expect(numberWord(3)).toBe('drei');
    expect(numberWord(4)).toBe('vier');
  });

  it('falls back to digits above ten', () => {
    expect(numberWord(12)).toBe('12');
  });
});

describe('capitalize', () => {
  it('uppercases the first letter only', () => {
    expect(capitalize('vier PKW')).toBe('Vier PKW');
    expect(capitalize('')).toBe('');
  });
});
