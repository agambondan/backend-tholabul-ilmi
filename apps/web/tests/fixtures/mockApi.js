export const defaultMockUser = {
  id: 1, name: 'Test User', email: 'test@example.com',
};

const defaultMockData = {
  surah: [],
  ayah: [],
  hadith: [],
  doa: [],
  dzikir: [],
  kajian: [],
  perawi: [],
  book: [],
  blog: [],
  tafsir: [],
  fiqh: [],
  manasik: [],
  siroh: [],
  history: [],
  asmaul: [],
  dictionary: [],
  quiz: [],
  goals: [],
  notes: [],
  bookmark: [],
  notification: [],
};

export async function setupApiMocks(page, options = {}) {
  const { isAuthenticated = false } = options;

  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();

    if (path.includes('/auth/login') && method === 'POST') {
      return route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ token: 'mock-token-123', user: defaultMockUser }),
      });
    }

    if (path.includes('/auth/me')) {
      if (isAuthenticated) {
        return route.fulfill({
          status: 200, contentType: 'application/json',
          body: JSON.stringify(defaultMockUser),
        });
      }
      return route.fulfill({
        status: 401, contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized' }),
      });
    }

    if (path.includes('/auth/refresh')) {
      return route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ token: 'mock-refreshed-token' }),
      });
    }

    if (path.includes('/surah')) return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify(defaultMockData.surah),
    });

    if (path.includes('/search')) return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ ayahs: [], hadiths: [], doas: [], kajians: [], dictionaries: [], perawis: [], total: 0 }),
    });

    if (method === 'GET') {
      return route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ data: [], message: 'ok' }),
      });
    }

    return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ message: 'ok' }),
    });
  });
}

export async function setupAuthenticatedPage(page) {
  await page.addInitScript(() => {
    localStorage.setItem('auth_token', 'mock-token-123');
  });
  await setupApiMocks(page, { isAuthenticated: true });
}
