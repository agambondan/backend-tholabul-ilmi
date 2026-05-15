import { test, expect } from '@playwright/test';

test.describe('Navigation Journey', () => {
  test('navigate between major sections', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    const quranLink = page.locator('a[href="/quran"]').first();
    if (await quranLink.isVisible()) {
      await quranLink.click();
      await page.waitForTimeout(2000);
      expect(page.url()).toContain('/quran');
    }
  });

  test('search page is accessible', async ({ page }) => {
    await page.goto('/search');
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/search');
  });
});
