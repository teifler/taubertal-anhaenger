import { expect, test } from '@playwright/test';

// A new external link (say, an Instagram profile) must come with a section in the privacy policy.
// Map each linked host to the name the policy uses for that service.
const SERVICE_BY_HOST: Record<string, string> = {
  'wa.me': 'WhatsApp',
  'www.google.com': 'Google Maps',
  'share.google': 'Google-Rezensionen',
};

test.skip(({ isMobile }) => isMobile, 'viewport-independent');

test('the privacy policy covers every external service the start page links to', async ({ page }) => {
  await page.goto('/');
  const hosts = await page
    .locator('a[href^="http"]')
    .evaluateAll((links) => [...new Set(links.map((a) => new URL((a as HTMLAnchorElement).href).hostname))]);
  expect(hosts.length).toBeGreaterThan(0);

  await page.goto('/datenschutz/');
  const policy = await page.locator('main').innerText();
  for (const host of hosts) {
    const service = SERVICE_BY_HOST[host];
    expect(service, `${host} is linked from the start page but missing from SERVICE_BY_HOST`).toBeDefined();
    expect(policy, `privacy policy does not mention ${service}`).toContain(service);
  }
});

test('the Impressum lists the provider, phone and e-mail', async ({ page }) => {
  await page.goto('/impressum/');
  const main = page.locator('main');
  await expect(main.getByRole('heading', { name: 'Angaben gemäß § 5 DDG' })).toBeVisible();
  await expect(main.locator('a[href^="tel:"]')).toHaveCount(1);
  await expect(main.locator('a[href^="mailto:"]')).toHaveCount(1);
  await expect(main.locator('.placeholder-note')).toHaveCount(0);
});

// Astro drops a line break between text and a following element, so "gilt die\n<a>Datenschutz…" renders as
// "gilt dieDatenschutz…" once Prettier wraps the line. Catch that on the text-heavy pages.
test('links are separated from the surrounding text', async ({ page }) => {
  for (const path of ['/', '/impressum/', '/datenschutz/']) {
    await page.goto(path);
    const glued = await page.locator('main a').evaluateAll((links) =>
      links
        .filter((a) => {
          const before = a.previousSibling?.nodeType === Node.TEXT_NODE ? (a.previousSibling.textContent ?? '') : '';
          const after = a.nextSibling?.nodeType === Node.TEXT_NODE ? (a.nextSibling.textContent ?? '') : '';
          return /[\p{L}\d]$/u.test(before) || /^[\p{L}\d]/u.test(after);
        })
        .map((a) => a.textContent?.trim()),
    );
    expect(glued, path).toEqual([]);
  }
});
