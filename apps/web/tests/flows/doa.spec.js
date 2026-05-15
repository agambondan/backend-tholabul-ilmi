import { test, expect } from '@playwright/test';

test.describe('Doa Journey', () => {
  test('doa page loads with content', async ({ page }) => {
    await page.goto('/doa');
    await page.waitForTimeout(3000);

    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(0);
  });
});
