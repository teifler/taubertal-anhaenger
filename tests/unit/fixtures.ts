import type { Site, Trailer } from '../../src/data';

export function makeTrailer(overrides: Partial<Trailer> = {}): Trailer {
  return {
    id: 'test-trailer',
    name: 'Testanhänger 1.000 kg',
    shortName: 'Testanhänger',
    tagline: 'Zum Testen',
    description: 'Ein Anhänger für Tests.',
    summary: 'Testanhänger, 1.000 kg.',
    isIllustration: false,
    images: [{ file: 'test.jpg', alt: 'Testanhänger von der Seite' }],
    specs: [{ label: 'Gesamtgewicht', value: '1.000 kg' }],
    prices: { day: 30, weekend: 55, fiveDays: 110, week: 140 },
    deposit: 100,
    note: null,
    inquiryObject: 'den Testanhänger',
    ctaLabel: 'Testanhänger anfragen',
    ...overrides,
  };
}

export const testSite = {
  phone: { e164: '+491234567890', display: '01234 567890' },
  address: { street: 'Teststraße 1', postalCode: '12345', city: 'Teststadt', region: 'BW', country: 'DE' },
} as Site;
