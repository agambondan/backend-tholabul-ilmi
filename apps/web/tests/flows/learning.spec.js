import { test, expect } from '@playwright/test';

test.describe('Learning Journey', () => {
  test('quiz page loads', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto('/quiz');
    await page.waitForTimeout(3000);
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(50);
  });

  test('kajian page loads', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto('/kajian');
    await page.waitForTimeout(3000);
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(50);
  });

  test('blog page loads', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto('/blog');
    await page.waitForTimeout(3000);
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(50);
  });

  test('kamus page loads', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto('/kamus');
    await page.waitForTimeout(3000);
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(50);
  });
});
