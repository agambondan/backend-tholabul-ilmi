import { test, expect } from '@playwright/test';

test.describe('Dashboard Routes', () => {
  const dashboardPages = [
    '/dashboard', '/dashboard/bookmarks', '/dashboard/notes',
    '/dashboard/hadith', '/dashboard/quran', '/dashboard/doa',
    '/dashboard/dzikir', '/dashboard/profile',
  ];

  for (const route of dashboardPages) {
    test(`dashboard route ${route} loads without error`, async ({ page }) => {
      test.setTimeout(30000);
      const response = await page.goto(route);
      expect(response.status()).toBeLessThan(400);
    });
  }
});
