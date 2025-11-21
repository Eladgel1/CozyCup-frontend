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
        user: { id: 'u1', email: 'hello@world.com', role: 'customer' },
      }),
    })
  );
}

// Stub for ordersApi.mine() – return either { orders: [...] } or an array.
async function stubOrdersMine(page, payload, status = 200) {
  await page.route('**/orders/me', (route) => {
    if (route.request().resourceType() === 'document') return route.fallback();
    if (route.request().method() !== 'GET') return route.fallback();

    if (status !== 200) {
      return route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'fail' }),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: Array.isArray(payload)
        ? JSON.stringify({ orders: payload })
        : JSON.stringify(payload),
    });
  });
}

test.describe('OrdersPage (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test('shows list of orders when mine returns data', async ({ page }) => {
    const now = new Date().toISOString();
    const orders = [
      {
        id: 'o1',
        status: 'CONFIRMED',
        windowStartAt: now,
        windowEndAt: now,
        totalCents: 1200,
        items: [
          { name: 'Latte', quantity: 1 },
          { name: 'Muffin', quantity: 2 },
        ],
      },
      {
        id: 'o2',
        status: 'READY',
        startAt: now,
        endAt: now,
        subtotalCents: 500,
        items: [{ name: 'Espresso', quantity: 1 }],
      },
    ];

    await stubOrdersMine(page, { orders });

    await page.goto('/orders');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /my orders/i })).toBeVisible();

    // First order: CONFIRMED + Latte ×1, Muffin ×2, $12.00
    await expect(page.getByText(/CONFIRMED/i)).toBeVisible();
    await expect(page.getByText(/Latte ×1/)).toBeVisible();
    await expect(page.getByText(/Muffin ×2/)).toBeVisible();
    await expect(page.getByText('$12.00')).toBeVisible();

    // Second order: READY + Espresso ×1, $5.00
    await expect(page.getByText(/READY/i)).toBeVisible();
    await expect(page.getByText(/Espresso ×1/)).toBeVisible();
    await expect(page.getByText('$5.00')).toBeVisible();

  });

  test('shows empty state when no orders', async ({ page }) => {
    await stubOrdersMine(page, { orders: [] });

    await page.goto('/orders');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/no orders yet\./i)).toBeVisible();
  });

  test('shows error card when orders load fails', async ({ page }) => {
    await stubOrdersMine(page, null, 500);

    await page.goto('/orders');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/failed to load orders\./i)).toBeVisible();
  });
});
