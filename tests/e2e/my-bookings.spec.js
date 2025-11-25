import { test, expect } from '@playwright/test';

// Login as customer
async function loginAsCustomer(page) {
  await page.addInitScript(() => {
    sessionStorage.setItem(
      'cozycup_auth',
      JSON.stringify({
        accessToken: 'AT_USER',
        refreshToken: 'RT_USER',
      })
    );
  });
  await page.route('**/auth/me', (r) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'u1', email: 'eee@g.com', role: 'customer' },
      }),
    })
  );
}

function addHoursISO(h) {
  return new Date(Date.now() + h * 3600_000).toISOString();
}

test.describe('MyBookings + QrDisplay (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
    // Keep slots list quiet
    await page.route('**/slots', (r) => {
      if (r.request().method() === 'GET') {
        return r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }
      return r.fallback();
    });
  });

  test('lists bookings, shows QR token modal and allows cancel', async ({ page }) => {
    const bookings = [
      {
        id: 'b1',
        status: 'BOOKED',
        code: 'CODE123456',
        slot: { id: 's1', startAt: addHoursISO(2), endAt: addHoursISO(3) },
      },
      {
        id: 'b2',
        status: 'BOOKED',
        code: 'CODE654321',
        slot: { id: 's2', startAt: addHoursISO(4), endAt: addHoursISO(5) },
      },
    ];

    await page.route('**/bookings/me', (r) => {
      if (r.request().method() === 'GET') {
        return r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ bookings }),
        });
      }
      return r.fallback();
    });

    // QR + Cancel routes for the first booking
    await page.route('**/bookings/b1/qr-token', (r) =>
      r.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'QR_B1_XYZ' }),
      })
    );
    await page.route('**/bookings/b1/cancel', (r) =>
      r.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      })
    );

    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');

    // Switch to "My bookings" tab if present
    const myTab = page.getByText(/my bookings/i).first();
    if (await myTab.count()) await myTab.click();

    // Wait until at least one booking with status BOOKED is rendered
    await expect(page.getByText(/BOOKED/i).first()).toBeVisible();

    // Open QR for the first booking using its "QR" button
    const firstQrButton = page.getByRole('button', { name: /^qr$/i }).first();
    await expect(firstQrButton).toBeVisible();
    await firstQrButton.click();

    await expect(page.getByText(/booking qr token/i)).toBeVisible();
    await expect(page.getByText(/QR_B1_XYZ/i)).toBeVisible();

    // Close modal and cancel the first booking using the first "Cancel" button
    await page.getByText(/^close$/i).click();
    const firstCancelButton = page.getByRole('button', { name: /cancel/i }).first();
    await expect(firstCancelButton).toBeVisible();
    await firstCancelButton.click();

    await expect(page.getByText(/booking canceled/i)).toBeVisible();
  });

  test('empty bookings shows empty state', async ({ page }) => {
    await page.route('**/bookings/mine', (r) =>
      r.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'failed' }),
      })
    );

    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');

    const myTab = page.getByText(/my bookings/i).first();
    if (await myTab.count()) await myTab.click();

    await expect(
      page.getByText(/failed to load your bookings\./i)
    ).toBeVisible({ timeout: 20000 });
  });
});
