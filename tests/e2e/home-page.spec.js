import { test, expect } from '@playwright/test';

// Simple customer login stub so protected pages are accessible
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

  await page.route('**/auth/me', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'u1', email: 'hello@world.com', role: 'customer' },
      }),
    })
  );
}

test.describe('Home page (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);

    // Menu: return empty list
    await page.route('**/menu', route => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }
      return route.fallback();
    });

    // Slots - empty
    await page.route('**/slots', route => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }
      return route.fallback();
    });

    await page.route('**/wallet/me', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ balanceCents: 0, expiresAt: null }),
      }),
    );
    await page.route('**/wallet/history', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      }),
    );
    await page.route('**/wallet/packages', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      }),
    );
  });

  test('renders hero, quick actions, popular items and how-it-works sections', async ({ page }) => {
    await page.goto('/');

    // Hero heading + tagline
    await expect(
      page.getByRole('heading', { name: /cozy up your day/i }),
    ).toBeVisible();
    await expect(page.getByText(/fresh .* cozy/i)).toBeVisible();

    // Hero CTAs
    await expect(
      page.getByRole('button', { name: /order now/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /book a seat/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /check wallet/i }),
    ).toBeVisible();

    // Quick actions cards
    await expect(page.getByText(/discover classics and seasonal specials/i)).toBeVisible();
    await expect(page.getByText(/reserve your spot and skip the wait/i)).toBeVisible();
    await expect(page.getByText(/manage passes and track your balance/i)).toBeVisible();

    // Popular today section
    await expect(
      page.getByRole('heading', { name: /popular today/i }),
    ).toBeVisible();
    await expect(page.getByText(/iced latte/i)).toBeVisible();
    await expect(page.getByText(/almond croissant/i)).toBeVisible();
    await expect(page.getByText(/affogato/i)).toBeVisible();

    // How it works steps
    await expect(page.getByRole('heading', { name: /how it works/i })).toBeVisible();
    await expect(page.getByText(/pick your favorite/i)).toBeVisible();
    await expect(page.getByText(/select pickup window/i)).toBeVisible();
    await expect(page.getByText(/enjoy & earn/i)).toBeVisible();

    // Cozy vibe section
    await expect(page.getByText(/the cozy vibe/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /grab a coffee/i }),
    ).toBeVisible();
  });

  test('hero CTAs navigate to menu and bookings', async ({ page }) => {
    await page.goto('/');

    // "Order now" -> /menu
    await page.getByRole('button', { name: /order now/i }).click();
    await expect(page).toHaveURL(/\/menu/);
    await expect(
      page.getByRole('heading', { name: /our menu/i }),
    ).toBeVisible();

    // Back home
    await page.goto('/');

    // "Book a seat" -> /bookings
    await page.getByRole('button', { name: /book a seat/i }).click();
    await expect(page).toHaveURL(/\/bookings/);
    // Slots page hero heading "Find a seat"
    await expect(
      page.getByRole('heading', { name: /find a seat/i }).first(),
    ).toBeVisible();
  });

  test('quick action cards have working links', async ({ page }) => {
    await page.goto('/');

    // Quick action "Menu" card
    const menuLink = page.getByRole('link', { name: /menu/i }).first();
    await expect(menuLink).toBeVisible();
    await menuLink.click();
    await expect(page).toHaveURL(/\/menu/);

    // Back home
    await page.goto('/');

    // Quick action "Book a Seat"
    const bookingsLink = page.getByRole('link', { name: /book a seat/i }).first();
    await expect(bookingsLink).toBeVisible();
    await bookingsLink.click();
    await expect(page).toHaveURL(/\/bookings/);

    // Back home
    await page.goto('/');

    // Quick action "Wallet"
    const walletLink = page.getByRole('link', { name: /wallet/i }).first();
    await expect(walletLink).toBeVisible();
    await walletLink.click();
    await expect(page).toHaveURL(/\/wallet/);
    await expect(
      page.getByRole('heading', { name: /wallet/i }),
    ).toBeVisible();
  });
});
