import { test, expect } from '@playwright/test';

test.describe('Tafsir Journey', () => {
  test('tafsir page loads with content', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto('/tafsir');
    await page.waitForTimeout(3000);
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(50);
  });

  test('asbabun-nuzul page loads', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto('/asbabun-nuzul');
    await page.waitForTimeout(3000);
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(50);
  });
});
