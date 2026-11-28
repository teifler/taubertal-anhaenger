/**
 * Plain-text versions of the start page for AI assistants:
 * `/llms.txt` (https://llmstxt.org) and `/index.html.md`.
 */
import { faq, site, steps, trailers, useCases, type Trailer } from '../data';
import { capitalize, formatEuro, formatRating, numberWord } from './format';
import { dayPriceRange, DEPOSIT_LABEL, hasLongTermPrices, ON_REQUEST, PRICE_PERIODS, priceTaxNote } from './pricing';
import { origin } from './site-url';

const { street, postalCode, city } = site.address;

function priceSummary(trailer: Trailer): string {
  if (!hasLongTermPrices(trailer)) return `1 Tag ${formatEuro(trailer.prices.day)}, längere Miete auf Anfrage`;
  return PRICE_PERIODS.map(({ key, inText }) => {
    const price = trailer.prices[key];
    return `${inText} ${price === null ? ON_REQUEST : formatEuro(price)}`;
  }).join(', ');
}

/** llms.txt: H1, blockquote summary, body text, then link lists. */
export function buildLlmsTxt(siteUrl: URL): string {
  const base = origin(siteUrl);
  const lines: string[] = [
    `# ${site.name} (${site.company})`,
    '',
    `> Anhängerverleih in ${city}, Baden-Württemberg. ${capitalize(numberWord(trailers.length))} PKW-Anhänger von 750 bis 2.700 kg zulässigem Gesamtgewicht, ab ${formatEuro(dayPriceRange(trailers).min)} pro Tag. Anfrage per WhatsApp oder Telefon unter ${site.phone.display}, Abholung in der ${street}, ${postalCode} ${city}.`,
    '',
    `Stand aller Angaben: ${site.pricesAsOf}. Preise in Euro, Miete pro Tag, Wochenende heißt Freitag bis Sonntag. ${priceTaxNote(site.vatExempt)} Online buchen geht nicht, der Termin wird per WhatsApp oder am Telefon ausgemacht. Wo „${ON_REQUEST}“ steht, liegt keine Angabe vor.`,
    '',
    'Anhänger und Preise:',
    '',
  ];

  for (const trailer of trailers) {
    const specs = trailer.specs
      .filter((spec) => spec.value !== null)
      .map((spec) => `${spec.label} ${spec.value}`)
      .join(', ');
    const note = trailer.note ? ` ${trailer.note}` : '';
    lines.push(
      `- ${trailer.name}: ${specs}. ${priceSummary(trailer)}. ${DEPOSIT_LABEL} ${formatEuro(trailer.deposit)}.${note}`,
    );
  }

  lines.push(
    '',
    `Kontakt: ${site.company}, ${street}, ${postalCode} ${city}, Telefon und WhatsApp ${site.phone.display}. Bewertung bei Google: ${formatRating(site.rating.value)} von 5 bei ${site.rating.count} Rezensionen.`,
    '',
    '## Seiten',
    '',
    `- [Startseite als Markdown](${base}/index.html.md): alle Anhänger mit technischen Daten, Mietpreisen, Ablauf, Fragen und Kontakt`,
    `- [Startseite](${base}/): dieselben Inhalte als Webseite mit Fotos`,
    '',
    '## Abschnitte der Startseite',
    '',
    ...trailers.map((t) => `- [${t.name}](${base}/#${t.id}): ${t.summary}`),
    `- [Mietpreise](${base}/#preise): Preistabelle aller Anhänger nach Mietdauer`,
    `- [Ablauf](${base}/#ablauf): Anfrage, Termin, Abholung, Rückgabe`,
    `- [Häufige Fragen](${base}/#fragen): Kosten, Führerschein, Kaution, Abholung`,
    `- [Kontakt und Anfahrt](${base}/#kontakt): Adresse, Telefon, WhatsApp`,
    '',
    '## Optional',
    '',
    `- [Rezensionen bei Google](${site.rating.url}): Unternehmensprofil mit allen Bewertungen`,
    `- [Sitemap](${base}/sitemap.xml): XML-Sitemap für Suchmaschinen`,
    '',
  );
  return lines.join('\n');
}

/** The start page as Markdown. */
export function buildPageMarkdown(): string {
  const lines: string[] = [
    '# Anhänger mieten in Tauberbischofsheim',
    '',
    `${site.copy.lead} Anfrage per WhatsApp oder Telefon: ${site.phone.display}.`,
    '',
    `Stand: ${site.pricesAsOf}. ${priceTaxNote(site.vatExempt)}`,
    '',
    `## ${capitalize(numberWord(trailers.length))} PKW-Anhänger zum Mieten`,
    '',
  ];

  for (const trailer of trailers) {
    lines.push(
      `### ${trailer.name} mieten`,
      '',
      `${trailer.tagline}. ${trailer.description}`,
      '',
      '| Technische Daten | |',
      '|---|---|',
      ...trailer.specs.map((spec) => `| ${spec.label} | ${spec.value ?? ON_REQUEST} |`),
      '',
      '| Mietdauer | Preis |',
      '|---|---|',
      ...PRICE_PERIODS.map(({ key, label }) => {
        const price = trailer.prices[key];
        return `| ${label} | ${price === null ? ON_REQUEST : formatEuro(price)} |`;
      }),
      `| ${DEPOSIT_LABEL} | ${formatEuro(trailer.deposit)} |`,
    );
    if (trailer.note) lines.push('', trailer.note);
    lines.push('');
  }

  lines.push(
    '## Welcher Anhänger wofür',
    '',
    ...useCases.map((u) => `- ${u.task}: ${u.trailer.name}`),
    '',
    '## So mieten Sie einen Anhänger',
    '',
    ...steps.map((step, i) => `${i + 1}. ${step.title}. ${step.text}`),
    '',
    '## Bewertungen',
    '',
    `${formatRating(site.rating.value)} von 5 bei Google, ${site.rating.count} Rezensionen (Stand ${site.rating.asOf}).`,
    '',
    '## Häufige Fragen',
    '',
  );
  for (const item of faq) lines.push(`### ${item.question}`, '', item.answer, '');
  lines.push(
    '## Kontakt und Anfahrt',
    '',
    site.company,
    street,
    `${postalCode} ${city}`,
    '',
    `Telefon und WhatsApp: ${site.phone.display}`,
    '',
    `${site.copy.pickup} ${site.copy.travelTimes}`,
    '',
  );
  return lines.join('\n');
}
