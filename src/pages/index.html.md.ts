import type { APIRoute } from 'astro';

import { buildPageMarkdown } from '../lib/llms';

export const GET: APIRoute = () =>
  new Response(buildPageMarkdown(), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
