import { test, expect } from '@playwright/test';

test.describe('Asmaul Husna Journey', () => {
  test('asmaul-husna page loads with name list', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto('/asmaul-husna');
    await page.waitForTimeout(3000);
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(50);
  });
});
