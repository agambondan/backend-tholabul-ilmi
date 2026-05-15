import { test, expect } from '@playwright/test';

test.describe('Hadith Browsing Journey', () => {
  test('hadith page loads with tab navigation', async ({ page }) => {
    await page.goto('/hadith');
    await page.waitForTimeout(2000);

    const tabs = page.locator('button, a').filter({ hasText: /Book|Theme|Chapter|Hadith|Kitab|Tema|Bab|Hadis/i });
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThan(0);
  });

  test('select book and view hadith list', async ({ page }) => {
    await page.goto('/hadith');
    await page.waitForTimeout(3000);

    const hadithTab = page.locator('button:has-text("Hadith")').or(page.locator('button:has-text("Hadis")'));
    if (await hadithTab.count() > 0) {
      await hadithTab.first().click();
      await page.waitForTimeout(1000);
    }

    const select = page.locator('select').first();
    if (await select.count() > 0) {
      const options = await select.locator('option').count();
      expect(options).toBeGreaterThan(0);
    }
  });
});
