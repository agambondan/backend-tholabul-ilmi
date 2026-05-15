import { test, expect } from '@playwright/test';

test.describe('Siroh & History Journey', () => {
  test('siroh page loads', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto('/siroh');
    await page.waitForTimeout(3000);
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(50);
  });

  test('sejarah page loads', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto('/sejarah');
    await page.waitForTimeout(3000);
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(50);
  });
});
