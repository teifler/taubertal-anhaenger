import type { PricePeriod, Trailer } from '../data';

/**
 * Rental periods in display order. The labels are the only place these strings exist:
 * `label` for table headers and price lists, `shortLabel` for the stacked phone table,
 * `inText` for running text where "Wochenende" is already explained.
 */
export const PRICE_PERIODS: readonly { key: PricePeriod; label: string; shortLabel: string; inText: string }[] = [
  { key: 'day', label: '1 Tag', shortLabel: '1 Tag', inText: '1 Tag' },
  { key: 'weekend', label: 'Wochenende (Fr–So)', shortLabel: 'Fr–So', inText: 'Wochenende' },
  { key: 'fiveDays', label: '5 Tage', shortLabel: '5 Tage', inText: '5 Tage' },
  { key: 'week', label: '7 Tage', shortLabel: '7 Tage', inText: '7 Tage' },
];

export const DEPOSIT_LABEL = 'Kaution';
export const ON_REQUEST = 'auf Anfrage';

/**
 * Price note required for consumer prices (§ 3 and § 6 Abs. 1 PAngV). A Kleinunternehmer charges no VAT, so the
 * prices can't "include" it; the note says so instead.
 */
export function priceTaxNote(vatExempt: boolean, form: 'long' | 'short' = 'long'): string {
  if (form === 'short')
    return vatExempt ? 'Endpreise, ohne Umsatzsteuer nach § 19 UStG' : 'Endpreise inkl. Umsatzsteuer';
  return vatExempt
    ? 'Alle Preise sind Endpreise. Nach § 19 UStG wird keine Umsatzsteuer berechnet (Kleinunternehmerregelung).'
    : 'Alle Preise sind Endpreise inklusive Umsatzsteuer.';
}

/** True if at least one price beyond the daily rate is known. */
export function hasLongTermPrices(trailer: Trailer): boolean {
  return PRICE_PERIODS.some(({ key }) => key !== 'day' && trailer.prices[key] !== null);
}

export function dayPriceRange(trailers: readonly Trailer[]): { min: number; max: number } {
  if (trailers.length === 0) throw new Error('dayPriceRange: no trailers');
  const prices = trailers.map((t) => t.prices.day);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
