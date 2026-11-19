import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';

import PriceTable from '../../src/components/PriceTable.astro';
import { trailers } from '../../src/data';

describe('<PriceTable />', () => {
  let html: string;

  beforeAll(async () => {
    const container = await AstroContainer.create();
    html = await container.renderToString(PriceTable);
  });

  it('orders the rows from cheapest to most expensive', () => {
    const names = [...html.matchAll(/<th scope="row"[^>]*><a [^>]*>([^<]+)<\/a>/g)].map((m) => m[1]);
    const expected = [...trailers].sort((a, b) => a.prices.day - b.prices.day).map((t) => t.name);
    expect(names).toEqual(expected);
  });

  it('merges the long-term columns for trailers that only have a daily rate', () => {
    const merged = html.match(/<td class="is-unknown is-merged" colspan="(\d)"/);
    expect(merged?.[1]).toBe('3');
    expect(html).toContain('längere Miete auf Anfrage');
  });

  it('labels every value cell for the stacked phone layout', () => {
    const valueCells = [...html.matchAll(/<td(?![^>]*is-merged)[^>]*>/g)];
    expect(valueCells.length).toBeGreaterThan(0);
    for (const [cell] of valueCells) expect(cell).toContain('data-label=');
  });
});
