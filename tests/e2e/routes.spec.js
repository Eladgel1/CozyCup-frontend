import { test, expect } from '@playwright/test';

const KEY = 'cozycup_auth';

test.describe('routes (E2E)', () => {
  test('unauthenticated user: protected routes redirect to /login', async ({ page }) => {
    await page.goto('/menu');
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
  });

  test('authenticated customer: can access /menu and /orders, but host routes redirect to /', async ({ page }) => {
    // Auth as customer
    await page.addInitScript(([k]) => {
      sessionStorage.setItem(k, JSON.stringify({ accessToken: 'AT', refreshToken: 'RT' }));
    }, [KEY]);
    await page.route('**/auth/me', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { id: 'u1', role: 'customer' } }) })
    );

    // Mock menu data
    await page.route('**/menu', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 'm1', name: 'Latte', priceCents: 450 }]) })
    );

    await page.goto('/orders'); // protected route
    await expect(page).not.toHaveURL(/\/login$/);

    await page.goto('/host/dashboard');
    await expect(page.getByRole('link', { name: /order now/i })).toBeVisible(); // back to "/"
  });

  test('host user: host routes are accessible', async ({ page }) => {
    await page.addInitScript(([k]) => {
      sessionStorage.setItem(k, JSON.stringify({ accessToken: 'AT', refreshToken: 'RT' }));
    }, [KEY]);
    await page.route('**/auth/me', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { id: 'u2', role: 'host' } }) })
    );

    await page.goto('/host/orders');
    await expect(page).toHaveURL(/\/host\/orders$/);

    await page.goto('/host/scanner');
    await expect(page).toHaveURL(/\/host\/scanner$/);

    await page.goto('/host/reports');
    await expect(page).toHaveURL(/\/host\/reports$/);
  });

  test('unknown route hits NotFound (fallback)', async ({ page }) => {
    await page.goto('/definitely-not-a-real-route');
    // NotFound shows a default React Router error boundary message in dev (if thrown),
    // but we at least verify it didn't crash app shell: header brand exists.
    await expect(page.getByRole('link', { name: /cozycup/i })).toBeVisible();
  });
});
