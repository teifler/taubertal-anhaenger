import { expect, test } from '@playwright/test';

// Separate from the describe block below: listeners must be attached before the first navigation.
test('the start page loads without console errors or missing files', async ({ page }) => {
  const problems: string[] = [];
  // Console errors include Content-Security-Policy violations.
  page.on('console', (msg) => {
    if (msg.type() === 'error') problems.push(msg.text());
  });
  page.on('response', (res) => {
    if (res.status() >= 400) problems.push(`${res.status()} ${res.url()}`);
  });

  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); // trigger lazy images
  await page.waitForLoadState('networkidle');
  expect(problems).toEqual([]);
});

test.describe('start page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has the SEO essentials', async ({ page }) => {
    await expect(page).toHaveTitle(/^Anhänger mieten Tauberbischofsheim ab \d+\s€/);
    await expect(page.locator('h1')).toHaveText('Anhänger mieten in Tauberbischofsheim');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{120,}/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.taubertal-anhaenger.de/');
  });

  test('ships valid JSON-LD with one offer per trailer card', async ({ page }) => {
    const json = await page.locator('script[type="application/ld+json"]').textContent();
    const graph = JSON.parse(json ?? '{}')['@graph'] as {
      '@type': string;
      hasOfferCatalog?: { itemListElement: unknown[] };
    }[];
    const business = graph.find((node) => node['@type'] === 'LocalBusiness');
    const cards = await page.locator('article[id]').count();
    expect(business?.hasOfferCatalog?.itemListElement).toHaveLength(cards);
  });

  test('every in-page link points to an element that exists', async ({ page }) => {
    const hrefs = await page
      .locator('a[href^="#"], a[href^="/#"]')
      .evaluateAll((links) => links.map((a) => a.getAttribute('href') ?? ''));
    expect(hrefs.length).toBeGreaterThan(10);
    for (const href of new Set(hrefs)) {
      const id = href.split('#')[1];
      await expect(page.locator(`[id="${id}"]`), `target of ${href}`).toHaveCount(1);
    }
  });

  test('sends trailer-specific WhatsApp messages', async ({ page }) => {
    const card = page.locator('#autotransporter');
    const href = await card.getByRole('link', { name: 'Autotransporter anfragen' }).getAttribute('href');
    const url = new URL(href ?? '');
    expect(url.hostname).toBe('wa.me');
    expect(url.searchParams.get('text')).toContain('den Autotransporter mieten');
  });

  test('opens the first FAQ answer and toggles the others', async ({ page }) => {
    const items = page.locator('#fragen details');
    await expect(items.first()).toHaveAttribute('open', '');
    const second = items.nth(1);
    await expect(second).not.toHaveAttribute('open');
    await second.locator('summary').click();
    await expect(second).toHaveAttribute('open', '');
  });
});
