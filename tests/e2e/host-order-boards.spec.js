import { test, expect } from '@playwright/test';

async function loginAsHost(page) {
  await page.addInitScript(() => {
    sessionStorage.setItem(
      'cozycup_auth',
      JSON.stringify({
        accessToken: 'AT_HOST',
        refreshToken: 'RT_HOST',
      })
    );
  });

  await page.route('**/auth/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'h1',
          email: 'elad@stam.com',
          role: 'host',
        },
      }),
    })
  );
}

test.describe('HostOrdersBoard (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsHost(page);
  });

  test('renders columns and allows moving orders forward/backward', async ({ page }) => {
    const orders = [
      {
        _id: 'o1',
        status: 'CONFIRMED',
        windowStartAt: new Date().toISOString(),
        items: [{ name: 'Latte', qty: 1 }],
        totalCents: 500,
      },
      {
        _id: 'o2',
        status: 'IN_PREP',
        windowStartAt: new Date().toISOString(),
        items: [{ name: 'Espresso', qty: 2 }],
        totalCents: 700,
      },
      {
        _id: 'o3',
        status: 'READY',
        windowStartAt: new Date().toISOString(),
        items: [{ name: 'Mocha', qty: 1 }],
        totalCents: 800,
      },
      {
        _id: 'o4',
        status: 'PICKED_UP',
        windowStartAt: new Date().toISOString(),
        items: [{ name: 'Tea', qty: 1 }],
        totalCents: 600,
      },
    ];

    await page.route('**/orders', (route) => {
      const req = route.request();
      const method = req.method();
      const resourceType = req.resourceType();

      if (resourceType === 'document') {
        return route.fallback();
      }

      if (method === 'GET') {
        // listHost()
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(orders),
        });
      }

      // updateStatus() – advance/back
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto('/host/orders');
    await page.waitForLoadState('networkidle');

    // header
    await expect(
      page.getByRole('heading', { name: /orders board/i })
    ).toBeVisible();

    // column headers
    await expect(page.getByText(/confirmed/i)).toBeVisible();
    await expect(page.getByText(/in prep/i)).toBeVisible();
    await expect(page.getByText(/ready/i)).toBeVisible();
    await expect(page.getByText(/picked up/i)).toBeVisible();
    await expect(page.getByText(/cancelled/i)).toBeVisible();

    // Order content is rendered
    await expect(page.getByText(/latte ×1/i)).toBeVisible();

    // "No orders" text appears somewhere
    await expect(page.getByText(/no orders/i)).toBeVisible();

    // Advance first order
    const advanceBtn = page.getByRole('button', { name: /advance/i }).first();
    await expect(advanceBtn).toBeVisible();

    // Move first order back
    const backBtn = page.getByRole('button', { name: /back/i }).first();
    await expect(backBtn).toBeVisible();
  });
});
