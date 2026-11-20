import { faq, site, trailers } from '../data';
import { formatEuro } from './format';
import { mapsPlaceUrl } from './links';
import { dayPriceRange } from './pricing';
import { origin } from './site-url';

/**
 * schema.org JSON-LD graph for the start page: WebSite, WebPage, LocalBusiness with one Offer per
 * trailer, and FAQPage. Deliberately without AggregateRating: Google ignores self-served review
 * stars for LocalBusiness.
 *
 * @param siteUrl  site root including `base` (see `siteRoot`)
 * @param imageUrls absolute URL of the first image per trailer id
 */
export function buildStructuredData(siteUrl: URL, imageUrls: Readonly<Record<string, string>>) {
  const base = origin(siteUrl);
  const businessId = `${base}/#business`;
  const { min, max } = dayPriceRange(trailers);

  const offers = trailers.map((trailer) => ({
    '@type': 'Offer',
    name: `${trailer.name} mieten`,
    url: `${base}/#${trailer.id}`,
    price: String(trailer.prices.day),
    priceCurrency: 'EUR',
    availability: 'https://schema.org/InStock',
    businessFunction: 'http://purl.org/goodrelations/v1#LeaseOut',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: String(trailer.prices.day),
      priceCurrency: 'EUR',
      unitCode: 'DAY',
      referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'DAY' },
    },
    itemOffered: {
      '@type': 'Product',
      name: trailer.name,
      description: trailer.summary,
      image: imageUrls[trailer.id],
      additionalProperty: [
        ...trailer.specs
          .filter((spec) => spec.value !== null)
          .map((spec) => ({ '@type': 'PropertyValue', name: spec.label, value: spec.value })),
        { '@type': 'PropertyValue', name: 'Kaution', value: formatEuro(trailer.deposit) },
      ],
    },
  }));

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${base}/#website`,
        url: `${base}/`,
        name: site.name,
        alternateName: site.company,
        inLanguage: 'de-DE',
        publisher: { '@id': businessId },
      },
      {
        '@type': 'WebPage',
        '@id': `${base}/#webpage`,
        url: `${base}/`,
        name: site.seo.title,
        description: site.seo.description,
        inLanguage: 'de-DE',
        isPartOf: { '@id': `${base}/#website` },
        about: { '@id': businessId },
        primaryImageOfPage: `${base}/og-bild.jpg`,
        dateModified: site.lastUpdated,
      },
      {
        '@type': 'LocalBusiness',
        '@id': businessId,
        name: site.company,
        alternateName: site.name,
        description: site.seo.businessDescription,
        url: `${base}/`,
        telephone: site.phone.e164,
        image: [`${base}/og-bild.jpg`, ...trailers.filter((t) => !t.isIllustration).map((t) => imageUrls[t.id])],
        priceRange: `${min}–${formatEuro(max)} pro Tag`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: site.address.street,
          postalCode: site.address.postalCode,
          addressLocality: site.address.city,
          addressRegion: site.address.region,
          addressCountry: site.address.country,
        },
        geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
        hasMap: mapsPlaceUrl,
        areaServed: site.serviceArea.map((name) => ({ '@type': 'City', name })),
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: site.phone.e164,
          contactType: 'customer service',
          availableLanguage: 'de',
        },
        sameAs: [site.profiles.kleinanzeigen],
        hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Mietanhänger', itemListElement: offers },
      },
      {
        '@type': 'FAQPage',
        '@id': `${base}/#faq`,
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };
}

/**
 * Serialises JSON-LD for an inline `<script>`. Escaping `<` keeps a stray `</script>` in the
 * content from closing the tag early (HTML injection).
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
