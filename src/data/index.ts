/**
 * Single entry point for all site content.
 *
 * The JSON files are validated with Zod when this module is imported, so a typo in the data
 * fails the build instead of shipping a broken page. Placeholders such as `{day:autotransporter}`
 * in text fields are resolved here, so prices and addresses are written down exactly once.
 */
import { z } from 'astro/zod';

import { createPlaceholderResolver } from '../lib/placeholders';
import faqJson from './faq.json';
import reviewsJson from './reviews.json';
import siteJson from './site.json';
import stepsJson from './steps.json';
import trailersJson from './trailers.json';
import useCasesJson from './use-cases.json';

const euro = z.number().int().positive();
const slug = z.string().regex(/^[a-z0-9-]+$/, 'lowercase letters, digits and dashes only');

const trailerSchema = z.strictObject({
  /** Used as the HTML anchor (`/#autotransporter`), so it is part of the public URL. */
  id: slug,
  name: z.string().min(1),
  shortName: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1),
  /** One sentence for structured data and llms.txt. */
  summary: z.string().min(1),
  /** True when the only image is a drawing, not a photo of the real trailer. */
  isIllustration: z.boolean(),
  images: z.array(z.strictObject({ file: z.string().min(1), alt: z.string().min(10) })).min(1),
  /** `value: null` is rendered as "auf Anfrage" (not known yet). */
  specs: z.array(z.strictObject({ label: z.string().min(1), value: z.string().min(1).nullable() })).min(1),
  prices: z.strictObject({
    day: euro,
    weekend: euro.nullable(),
    fiveDays: euro.nullable(),
    week: euro.nullable(),
  }),
  deposit: euro,
  note: z.string().min(1).nullable(),
  /** Completes the WhatsApp text "Hallo, ich möchte … mieten". */
  inquiryObject: z.string().min(1),
  ctaLabel: z.string().min(1),
});

const siteSchema = z.strictObject({
  name: z.string().min(1),
  company: z.string().min(1),
  /** Full name of the sole proprietor. Required in the Impressum (§ 5 DDG). */
  owner: z.string().min(1),
  address: z.strictObject({
    street: z.string().min(1),
    /** Ortsteil. Only the legal pages show it, where the address has to be unambiguous. */
    district: z.string().min(1),
    postalCode: z.string().regex(/^\d{5}$/),
    city: z.string().min(1),
    region: z.string().min(1),
    country: z.string().length(2),
  }),
  phone: z.strictObject({
    e164: z.string().regex(/^\+\d{8,15}$/, 'E.164 format, e.g. +4916012345678'),
    display: z.string().min(1),
  }),
  /** Required in the Impressum (§ 5 Abs. 1 Nr. 2 DDG). null until the client provides one. */
  email: z.email().nullable(),
  /** USt-IdNr. null = none (e.g. Kleinunternehmer); the Impressum then leaves the line out. */
  vatId: z
    .string()
    .regex(/^DE\d{9}$/, 'DE followed by 9 digits')
    .nullable(),
  /** Wirtschafts-Identifikationsnummer (W-IdNr., § 139c AO). null = not assigned yet; then the line is left out. */
  businessId: z
    .string()
    .regex(/^DE\d{9}-\d{5}$/, 'DE, 9 digits, a dash and 5 digits, e.g. DE123456789-00001')
    .nullable(),
  geo: z.strictObject({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }),
  seo: z.strictObject({
    title: z.string().min(1),
    description: z.string().min(1),
    ogTitle: z.string().min(1),
    ogDescription: z.string().min(1),
    ogImageAlt: z.string().min(1),
    businessDescription: z.string().min(1),
  }),
  copy: z.strictObject({ lead: z.string().min(1), pickup: z.string().min(1), travelTimes: z.string().min(1) }),
  pricesAsOf: z.string().min(1),
  /** ISO date of the last content change. Drives `dateModified` and the sitemap `lastmod`. */
  lastUpdated: z.iso.date(),
  rating: z.strictObject({
    value: z.number().min(1).max(5),
    count: z.number().int().nonnegative(),
    asOf: z.string().min(1),
    url: z.url(),
  }),
  profiles: z.strictObject({ kleinanzeigen: z.url() }),
  /**
   * Web host of the production site, named in the privacy policy. null until the client has chosen one; the
   * production build then shows a notice. Assumes a host in the EU: a host elsewhere needs a transfer section
   * like the GitHub Pages one in datenschutz.astro.
   */
  hosting: z.strictObject({ name: z.string().min(1), address: z.string().min(1), privacyUrl: z.url() }).nullable(),
  serviceArea: z.array(z.string().min(1)).min(1),
});

const faqSchema = z.array(z.strictObject({ question: z.string().min(1), answer: z.string().min(1) }));

const reviewSchema = z.strictObject({
  quote: z.string().min(1),
  /** null = anonymous, shown as "Google-Rezension". */
  author: z.string().min(1).nullable(),
  context: z.string().min(1).nullable(),
  showInHero: z.boolean(),
  showInTopBar: z.boolean(),
});

const stepSchema = z.strictObject({ title: z.string().min(1), text: z.string().min(1) });
const useCaseSchema = z.strictObject({ task: z.string().min(1), trailerId: slug });

export type Trailer = z.infer<typeof trailerSchema>;
export type Site = z.infer<typeof siteSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type PricePeriod = keyof Trailer['prices'];

function parse<T extends z.ZodType>(schema: T, data: unknown, file: string): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Invalid data in src/data/${file}:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

export const trailers = parse(
  z.array(trailerSchema).min(1).refine(uniqueIds, 'trailer ids must be unique'),
  trailersJson,
  'trailers.json',
);

const rawSite = parse(siteSchema, siteJson, 'site.json');
const resolve = createPlaceholderResolver({ site: rawSite, trailers });

/** Site settings with all placeholders in `seo` and `copy` resolved. */
export const site: Site = {
  ...rawSite,
  seo: mapValues(rawSite.seo, resolve),
  copy: mapValues(rawSite.copy, resolve),
};

export const faq = parse(faqSchema, faqJson, 'faq.json').map((item) => ({ ...item, answer: resolve(item.answer) }));

export const reviews = parse(z.array(reviewSchema).min(1), reviewsJson, 'reviews.json');

export const steps = parse(z.array(stepSchema).min(1), stepsJson, 'steps.json').map((step) => ({
  ...step,
  text: resolve(step.text),
}));

export const useCases = parse(z.array(useCaseSchema), useCasesJson, 'use-cases.json').map((useCase) => ({
  ...useCase,
  trailer: trailerById(useCase.trailerId),
}));

export function trailerById(id: string): Trailer {
  const trailer = trailers.find((t) => t.id === id);
  if (!trailer) throw new Error(`Unknown trailer id "${id}". Known ids: ${trailers.map((t) => t.id).join(', ')}`);
  return trailer;
}

function uniqueIds(items: { id: string }[]): boolean {
  return new Set(items.map((i) => i.id)).size === items.length;
}

function mapValues<T extends Record<string, string>>(obj: T, fn: (value: string) => string): T {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v)])) as T;
}
