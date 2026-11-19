import { expect, test } from '@playwright/test';

test.describe('photo gallery', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#autotransporter');
  });

  test('shows prev/next buttons once the script has run', async ({ page }) => {
    const gallery = page.locator('#autotransporter [data-gallery]');
    await expect(gallery.getByRole('button', { name: 'Nächstes Foto' })).toBeVisible();
    await expect(gallery.getByRole('button', { name: 'Vorheriges Foto' })).toBeVisible();
    await expect(gallery.locator('.gallery__counter')).toHaveText('1 / 6');
  });

  test('advances with "next" and wraps around with "previous"', async ({ page }) => {
    const gallery = page.locator('#autotransporter [data-gallery]');
    const counter = gallery.locator('.gallery__counter');

    await gallery.getByRole('button', { name: 'Nächstes Foto' }).click();
    await expect(counter).toHaveText('2 / 6');

    await gallery.getByRole('button', { name: 'Vorheriges Foto' }).click();
    await expect(counter).toHaveText('1 / 6');

    await gallery.getByRole('button', { name: 'Vorheriges Foto' }).click();
    await expect(counter).toHaveText('6 / 6');
  });

  test('can be scrolled with the keyboard', async ({ page, isMobile }) => {
    test.skip(isMobile, 'no hardware keyboard on phones');
    const track = page.getByRole('region', { name: 'Fotos Autotransporter' });
    await track.focus();
    await expect(track).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#autotransporter .gallery__counter')).toHaveText('2 / 6');
  });

  test('marks the drawing as "Symbolbild" and has no navigation for a single image', async ({ page }) => {
    const gallery = page.locator('#anhaenger-750-kg [data-gallery]');
    await expect(gallery.getByText('Symbolbild')).toBeVisible();
    await expect(gallery.getByRole('button')).toHaveCount(0);
  });
});
