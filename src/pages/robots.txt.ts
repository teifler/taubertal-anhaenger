import type { APIRoute } from 'astro';

import { siteRoot } from '../lib/site-url';

/** Listed explicitly so the intent is visible; the `*` rule already allows them. */
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Google-Extended',
];

export const GET: APIRoute = ({ site }) => {
  const text = [
    '# Alle Suchmaschinen und KI-Assistenten dürfen die Seite lesen.',
    'User-agent: *',
    'Allow: /',
    '',
    '# KI-Crawler ausdrücklich erlaubt (gilt schon über die Regel oben)',
    ...AI_CRAWLERS.map((bot) => `User-agent: ${bot}`),
    'Allow: /',
    '',
    `Sitemap: ${new URL('sitemap.xml', siteRoot(site)).href}`,
    '',
  ].join('\n');
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
