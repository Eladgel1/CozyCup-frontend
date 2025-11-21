import { test, expect } from '@playwright/test';

const KEY = 'cozycup_auth';

test.describe('HostRoute (E2E)', () => {
  test('shows loading then redirects unauthenticated to /login', async ({ page }) => {
    // No tokens
    await page.goto('/host/dashboard');
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
  });

  test('redirects non-host to "/"', async ({ page }) => {
    await page.addInitScript(([k]) => {
      sessionStorage.setItem(k, JSON.stringify({ accessToken: 'AT', refreshToken: 'RT' }));
    }, [KEY]);
    await page.route('**/auth/me', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { id: 'u1', role: 'customer' } }) })
    );

    await page.goto('/host/dashboard');
    // Home CTA is a reliable indicator
    await expect(page.getByRole('link', { name: /order now/i })).toBeVisible();
  });

  test('renders child for host user', async ({ page }) => {
    await page.addInitScript(([k]) => {
      sessionStorage.setItem(k, JSON.stringify({ accessToken: 'AT', refreshToken: 'RT' }));
    }, [KEY]);
    await page.route('**/auth/me', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { id: 'h1', role: 'host' } }) })
    );

    await page.goto('/host/dashboard');
    await expect(page).toHaveURL(/\/host\/dashboard$/);
  });
});
