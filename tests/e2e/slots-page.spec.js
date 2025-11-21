import { test, expect } from '@playwright/test';

// Login as customer
async function loginAsCustomer(page) {
  await page.addInitScript(() => {
    sessionStorage.setItem('cozycup_auth', JSON.stringify({
      accessToken: 'AT_USER',
      refreshToken: 'RT_USER',
    }));
  });
  await page.route('**/auth/me', r => r.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ user: { id: 'u1', email: 'eee@g.com', role: 'customer' } }),
  }));
}

function isoAtLocalYMDPlus(days, startH = 10, endH = 11) {
  const now = new Date();
  const s = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days, startH, 0, 0, 0);
  const e = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days, endH,   0, 0, 0);
  return { startAt: s.toISOString(), endAt: e.toISOString() };
}
function addHoursISO(h) { return new Date(Date.now() + h * 3_600_000).toISOString(); }

test.describe('SlotsPage (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test('loads, shows seats and can book a future slot; also supports tomorrow', async ({ page }) => {

    const now = new Date();
    const currentHour = now.getHours();

    // next hour (wrap after 23 → 0)
    const nextHour = (currentHour + 1) % 24;

    // hour after that (wrap too)
    const nextNextHour = (currentHour + 2) % 24;

    // Use them:
    const t1 = isoAtLocalYMDPlus(0, nextHour, nextNextHour);
    const tFull = isoAtLocalYMDPlus(0, 18, 19);
    const tm1   = isoAtLocalYMDPlus(1, 10, 11);

    const slots = [
      { id: 't1',  startAt: t1.startAt,   endAt: t1.endAt,   capacity: 8,  bookedCount: 2 },
      { id: 'tf',  startAt: tFull.startAt, endAt: tFull.endAt, capacity: 10, bookedCount: 10 },
      { id: 'tm1', startAt: tm1.startAt,  endAt: tm1.endAt,  capacity: 6,  bookedCount: 1 },
    ];

    await page.route('**/slots', r => {
      if (r.request().method() === 'GET') {
        return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(slots) });
      }
      return r.fallback();
    });
    await page.route('**/bookings', r => {
      if (r.request().method() === 'POST') {
        return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
      }
      return r.fallback();
    });

    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/find a seat/i).first()).toBeVisible();
    const anyCard = page.locator('.card', { hasText: /seats? available/i }).first();
    await expect(anyCard).toBeVisible();

    const firstBook = anyCard.getByRole('button', { name: /^book$/i });
    await expect(firstBook).toBeEnabled();
    await firstBook.click();
    await expect(page.getByText(/booking created successfully/i)).toBeVisible();

    const fullBtn = page.getByRole('button', { name: /^full$/i }).first();
    await expect(fullBtn).toBeDisabled();
  });

  test('blocks booking for past slot and shows error toast', async ({ page }) => {
    const past  = { id: 'p1', startAt: addHoursISO(-2), endAt: addHoursISO(-1), capacity: 6, bookedCount: 1 };
    const ok    = { id: 'o1', startAt: addHoursISO(2),  endAt: addHoursISO(3),  capacity: 6, bookedCount: 1 };

    await page.route('**/slots', r => {
      if (r.request().method() === 'GET') {
        return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([past, ok]) });
      }
      return r.fallback();
    });
    await page.route('**/bookings', r => {
      if (r.request().method() === 'POST') {
        return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
      }
      return r.fallback();
    });

    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /^book$/i }).first().click();
    await expect(page.getByText(/already passed/i)).toBeVisible();
  });
});
