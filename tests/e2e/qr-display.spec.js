import { test, expect } from '@playwright/test';

/** Login as customer */
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

function addHoursISO(h) { return new Date(Date.now() + h * 3600_000).toISOString(); }

test.describe('QrDisplay (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
    await page.route('**/slots', r => {
      if (r.request().method() === 'GET') {
        return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      }
      return r.fallback();
    });
  });

  test('opens and shows token, can close', async ({ page }) => {
    const booking = { id: 'b1', status: 'BOOKED', code: 'ABC1234567', slot: { id: 's1', startAt: addHoursISO(1), endAt: addHoursISO(2) } };

    await page.route('**/bookings/me', r => r.fulfill({
      status: 200, contentType: 'application/json', body: JSON.stringify({ bookings: [booking] }),
    }));
    await page.route('**/bookings/b1/qr-token', r => r.fulfill({
      status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'ONE_TIME_TOKEN' }),
    }));

    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');

    const myTab = page.getByText(/my bookings/i).first();
    if (await myTab.count()) await myTab.click();

    // Click "QR" using text instead of role to avoid role mismatches
    await page.getByText(/^qr$/i).first().click();

    await expect(page.getByText(/booking qr token/i)).toBeVisible();
    await expect(page.getByText(/ONE_TIME_TOKEN/i)).toBeVisible();

    await page.getByText(/^close$/i).click();
    await expect(page.getByText(/booking qr token/i)).toHaveCount(0);
  });
});
