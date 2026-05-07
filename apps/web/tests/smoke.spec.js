import { test, expect } from '@playwright/test';

const publicRoutes = [
  '/',
  '/hadith',
  '/panduan-sholat',
  '/kajian',
  '/wirid',
  '/tilawah',
  '/tafsir',
  '/jadwal-sholat',
  '/wirid-custom',
  '/contact',
  '/dev',
  '/quran/page-mushaf',
  '/quran',
  '/dzikir',
  '/tasbih',
  '/sholat-tracker',
  '/muroja-ah',
  '/doa',
  '/amalan',
  '/muhasabah',
  '/kamus',
  '/kiblat',
  '/search',
  '/asmaul-husna/flashcard',
  '/asmaul-husna',
  '/siroh',
  '/khatam',
  '/hafalan',
  '/manasik',
  '/perawi',
  '/zakat',
  '/stats',
  '/blog',
  '/auth/register',
  '/auth/login',
  '/leaderboard',
  '/imsakiyah',
  '/faraidh',
  '/tahlil',
  '/hijri',
  '/quiz',
  '/goals',
  '/sejarah',
  '/asbabun-nuzul',
  '/notes',
  '/fiqh',
];

const dashboardRoutes = [
  '/dashboard',
  '/dashboard/profile',
  '/dashboard/bookmarks',
  '/dashboard/notifications',
  '/dashboard/hadith',
  '/dashboard/panduan-sholat',
  '/dashboard/kajian',
  '/dashboard/wirid',
  '/dashboard/tilawah',
  '/dashboard/tafsir',
  '/dashboard/jadwal-sholat',
  '/dashboard/wirid-custom',
  '/dashboard/quran',
  '/dashboard/dzikir',
  '/dashboard/tasbih',
  '/dashboard/sholat-tracker',
  '/dashboard/muroja-ah',
  '/dashboard/doa',
  '/dashboard/amalan',
  '/dashboard/muhasabah',
  '/dashboard/kamus',
  '/dashboard/kiblat',
  '/dashboard/search',
  '/dashboard/asmaul-husna',
  '/dashboard/siroh',
  '/dashboard/khatam',
  '/dashboard/hafalan',
  '/dashboard/manasik',
  '/dashboard/perawi',
  '/dashboard/zakat',
  '/dashboard/stats',
  '/dashboard/blog',
  '/dashboard/leaderboard',
  '/dashboard/imsakiyah',
  '/dashboard/faraidh',
  '/dashboard/tahlil',
  '/dashboard/hijri',
  '/dashboard/quiz',
  '/dashboard/goals',
  '/dashboard/sejarah',
  '/dashboard/asbabun-nuzul',
  '/dashboard/notes',
  '/dashboard/fiqh',
];

test.describe('Public Routes Smoke Test', () => {
  for (const route of publicRoutes) {
    test(`Should successfully load public route: ${route}`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response.status()).toBeLessThan(400); // Should be 200-399
    });
  }
});

// For dashboard routes, we might get redirected to login if unauthenticated,
// but the server should still return a valid response (e.g. 200 or 30x), not 500.
test.describe('Dashboard Routes Smoke Test', () => {
  for (const route of dashboardRoutes) {
    test(`Should successfully load or redirect dashboard route: ${route}`, async ({ page }) => {
      const response = await page.goto(route);
      // Since it might redirect to /auth/login, we just ensure no 500 or 404
      expect(response.status()).toBeLessThan(400);
    });
  }
});
