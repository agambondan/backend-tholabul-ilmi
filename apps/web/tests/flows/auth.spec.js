import { test, expect } from '@playwright/test';

test.describe('Auth Pages Journey', () => {
  test('login page renders form', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForTimeout(2000);

    await expect(page.locator('button:has-text("Masuk")').or(page.locator('button:has-text("Login")'))).toBeVisible();
  });

  test('register page renders form', async ({ page }) => {
    await page.goto('/auth/register');
    await page.waitForTimeout(2000);

    await expect(page.locator('button[type="submit"]').or(page.locator('button:has-text("Daftar")'))).toBeVisible();
  });
});
