const integer = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Non-breaking space: keeps "50" and "€" on the same line (DIN 5008). */
const NBSP = ' ';

/** 1500 → "1.500 €" */
export function formatEuro(amount: number): string {
  return `${integer.format(amount)}${NBSP}€`;
}

/** 5 → "5,0" */
export function formatRating(value: number): string {
  return oneDecimal.format(value);
}

const NUMBER_WORDS = ['null', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn'];

/** 4 → "vier". German style writes small counts as words; larger numbers stay digits. */
export function numberWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
