import type { PricePeriod, Site, Trailer } from '../data';
import { formatEuro } from './format';
import { dayPriceRange } from './pricing';

const TOKEN = /\{([a-zA-Z]+)(?::([a-z0-9-]+))?\}/g;
const PRICE_KEYS: readonly string[] = ['day', 'weekend', 'fiveDays', 'week'] satisfies PricePeriod[];

/**
 * Returns a function that replaces placeholders in content text with values from the data:
 *
 * - `{minPrice}` `{phone}` `{street}` `{city}`             site-wide values
 * - `{day:<id>}` `{weekend:<id>}` `{fiveDays:<id>}` `{week:<id>}` price of one trailer
 * - `{deposit:<id>}` `{note:<id>}`                         deposit / note of one trailer
 *
 * Unknown placeholders, unknown ids and missing values throw, so mistakes fail the build.
 */
export function createPlaceholderResolver({ site, trailers }: { site: Site; trailers: readonly Trailer[] }) {
  const globals: Record<string, string> = {
    minPrice: formatEuro(dayPriceRange(trailers).min),
    phone: site.phone.display,
    street: site.address.street,
    city: site.address.city,
  };

  return function resolve(text: string): string {
    return text.replace(TOKEN, (token, name: string, id: string | undefined) => {
      const fail = (reason: string): never => {
        throw new Error(`Placeholder ${token} in "${text.slice(0, 60)}…": ${reason}`);
      };

      if (id === undefined) return globals[name] ?? fail(`unknown name. Known: ${Object.keys(globals).join(', ')}`);

      const trailer = trailers.find((t) => t.id === id) ?? fail(`unknown trailer id "${id}"`);
      if (name === 'deposit') return formatEuro(trailer.deposit);
      if (name === 'note') return trailer.note ?? fail('trailer has no note');
      if (PRICE_KEYS.includes(name)) {
        const price = trailer.prices[name as PricePeriod];
        return price === null ? fail(`price "${name}" is not set (null)`) : formatEuro(price);
      }
      return fail(`unknown name "${name}"`);
    });
  };
}
