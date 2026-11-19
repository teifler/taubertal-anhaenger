import { expect, test } from '@playwright/test';

test('phones get a fixed contact bar, desktops the section navigation', async ({ page, isMobile }) => {
  await page.goto('/');
  const contactBar = page.getByRole('complementary', { name: 'Schnellkontakt' });
  const nav = page.getByRole('navigation', { name: 'Seitenabschnitte' });

  if (isMobile) {
    await expect(contactBar).toBeVisible();
    await expect(nav).toBeHidden();
  } else {
    await expect(contactBar).toBeHidden();
    await expect(nav).toBeVisible();
  }
});

test('the price table has no horizontal overflow on a phone', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone layout only');
  await page.goto('/#preise');
  const overflow = await page.locator('#preise .table-scroll').evaluate((el) => el.scrollWidth - el.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('the skip link moves focus to the main content', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard navigation');
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Zum Inhalt' });
  await expect(skip).toBeFocused();
  await skip.press('Enter');
  await expect(page).toHaveURL(/#inhalt$/);
});
