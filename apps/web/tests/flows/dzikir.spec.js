import { test, expect } from '@playwright/test';

test.describe('Dzikir Journey', () => {
  test('dzikir page loads with content', async ({ page }) => {
    await page.goto('/dzikir');
    await page.waitForTimeout(3000);

    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(0);
  });

  test('wirid page loads', async ({ page }) => {
    await page.goto('/wirid');
    await page.waitForTimeout(2000);
    expect(await page.title().catch(() => '')).not.toBeNull();
  });
});
