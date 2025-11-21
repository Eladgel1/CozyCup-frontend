import { test, expect } from '@playwright/test';

async function loginAsCustomer(page) {
  await page.addInitScript(() => {
    window.sessionStorage.setItem(
      'cozycup_auth',
      JSON.stringify({
        accessToken: 'AT_USER',
        refreshToken: 'RT_USER',
      })
    );
  });

  await page.route('**/auth/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'u1', email: 'user@example.com', role: 'customer' },
      }),
    })
  );
}

async function stubOrdersMine(page, orders) {
  await page.route('**/orders/me', (route) => {
    if (route.request().resourceType() === 'document') return route.fallback();
    if (route.request().method() !== 'GET') return route.fallback();
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ orders }),
    });
  });
}

async function stubBookingsMine(page, bookings) {
  await page.route('**/bookings/me', (route) => {
    if (route.request().resourceType() === 'document') return route.fallback();
    if (route.request().method() !== 'GET') return route.fallback();
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ bookings }),
    });
  });
}

test.describe('HistoryPage (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test('shows orders history and bookings history in tabs', async ({ page }) => {
    const now = new Date().toISOString();
    const later = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const orders = [
      {
        id: 'o1',
        status: 'CONFIRMED',
        windowStartAt: now,
        windowEndAt: later,
        totalCents: 1500,
      },
    ];
    const bookings = [
      {
        id: 'b1',
        status: 'BOOKED',
        slotStartAt: now,
        slotEndAt: later,
      },
    ];

    await stubOrdersMine(page, orders);
    await stubBookingsMine(page, bookings);

    await page.goto('/history');
    await page.waitForLoadState('networkidle');

    // Hero heading
    await expect(page.getByRole('heading', { name: /history/i })).toBeVisible();

    // Orders tab is default; table should show our order
    const ordersTab = page.getByRole('tab', { name: /orders/i }).first();
    await expect(ordersTab).toBeVisible();

    await expect(page.getByText(/my orders/i)).toBeVisible();
    await expect(page.getByText(/CONFIRMED/i)).toBeVisible();
    await expect(page.getByText('$15.00')).toBeVisible();
    await expect(page.getByRole('link', { name: /open orders/i })).toBeVisible();

    // Switch to bookings tab
    const bookingsTab = page.getByRole('tab', { name: /bookings/i }).first();
    await bookingsTab.click();

    await expect(page.getByText(/my bookings/i)).toBeVisible();
    await expect(page.getByText(/BOOKED/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /open bookings/i })).toBeVisible();
    await expect(page.getByText(/included in pass/i)).toBeVisible();
  });

  test('shows empty states for orders and bookings when none exist', async ({ page }) => {
    await stubOrdersMine(page, []);
    await stubBookingsMine(page, []);

    await page.goto('/history');
    await page.waitForLoadState('networkidle');

    // Orders tab empty
    await expect(page.getByText(/no orders yet\./i)).toBeVisible();
    await expect(page.getByRole('button', { name: /go to menu/i })).toBeVisible();

    // Switch to bookings and see its empty state
    const bookingsTab = page.getByRole('tab', { name: /bookings/i }).first();
    await bookingsTab.click();

    await expect(page.getByText(/no bookings yet\./i)).toBeVisible();
    await expect(page.getByRole('button', { name: /find a seat/i })).toBeVisible();
  });
});
