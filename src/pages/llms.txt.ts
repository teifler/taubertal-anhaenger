import type { APIRoute } from 'astro';

import { buildLlmsTxt } from '../lib/llms';
import { siteRoot } from '../lib/site-url';

export const GET: APIRoute = ({ site }) =>
  new Response(buildLlmsTxt(siteRoot(site)), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
