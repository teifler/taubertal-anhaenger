import { expect, test } from '@playwright/test';

// The generated files only differ by viewport in theory, so run them once.
test.skip(({ isMobile }) => isMobile, 'viewport-independent');

test('robots.txt allows crawling and points to the sitemap', async ({ request }) => {
  const res = await request.get('/robots.txt');
  expect(res.ok()).toBe(true);
  const body = await res.text();
  expect(body).toContain('User-agent: *\nAllow: /');
  expect(body).toContain('Sitemap: https://www.taubertal-anhaenger.de/sitemap.xml');
});

test('sitemap.xml lists only the start page, with a fixed lastmod', async ({ request }) => {
  const body = await (await request.get('/sitemap.xml')).text();
  expect(body.match(/<loc>/g)).toHaveLength(1);
  expect(body).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
  expect(body).not.toContain('impressum');
  expect(body).not.toContain('750kg-zeichnung');
});

test('llms.txt and the Markdown version are served as text', async ({ request }) => {
  const llms = await request.get('/llms.txt');
  expect(llms.ok()).toBe(true);
  expect(await llms.text()).toMatch(/^# Taubertal Anhänger/);

  const md = await request.get('/index.html.md');
  expect(md.ok()).toBe(true);
  expect(await md.text()).toMatch(/^# Anhänger mieten in Tauberbischofsheim/);
});

test('the legal pages and the 404 page stay out of the index', async ({ page }) => {
  for (const path of ['/impressum/', '/datenschutz/']) {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  }
  const res = await page.goto('/gibt-es-nicht/');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('Seite nicht gefunden');
});
