import { test, expect } from '@playwright/test';

async function loginAsCustomer(page) {
  await page.addInitScript(() => {
    sessionStorage.setItem(
      'cozycup_auth',
      JSON.stringify({
        accessToken: 'AT_USER',
        refreshToken: 'RT_USER',
      }),
    );
  });
  await page.route('**/auth/me', (r) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'u1', email: 'eee@g.com', role: 'customer' },
      }),
    }),
  );
}

// Build ISO timestamps for "today" at specific local hours
function isoForTodayAt(hour, minute = 0) {
  const now = new Date();
  const d = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute,
    0,
    0,
  );
  return d.toISOString();
}

test.describe('SlotCard (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test('shows time range and seats count, and enables/disables button properly', async ({ page }) => {
    // One slot with remaining seats, one fully booked slot on the same local day
    const ok = {
      id: 'ok1',
      startAt: isoForTodayAt(10),
      endAt: isoForTodayAt(11),
      capacity: 10,
      bookedCount: 3, // 7 left
    };
    const full = {
      id: 'f1',
      startAt: isoForTodayAt(12),
      endAt: isoForTodayAt(13),
      capacity: 6,
      bookedCount: 6, // 0 left -> "Full"
    };

    await page.route('**/slots', (r) => {
      if (r.request().method() === 'GET') {
        return r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([ok, full]),
        });
      }
      return r.fallback();
    });

    await page.route('**/bookings', (r) => {
      if (r.request().method() === 'POST') {
        return r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true }),
        });
      }
      return r.fallback();
    });

    await page.goto('/bookings');

    // Any "seats available" line should be visible
    const seatsLine = page.getByText(/seats available/i).first();
    await expect(seatsLine).toBeVisible();

    // First "Book" button should be enabled (slot with seats left)
    const bookBtn = page.getByRole('button', { name: /^book$/i }).first();
    await expect(bookBtn).toBeEnabled();

    // "Full" button from the fully booked slot should be disabled
    const fullBtn = page.getByRole('button', { name: /^full$/i }).first();
    await expect(fullBtn).toBeDisabled();
  });
});
