import { test, expect } from '@playwright/test';

const KEY = 'cozycup_auth';

test.describe('App (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticated customer before navigation (safe)
    await page.addInitScript(([k]) => {
      sessionStorage.setItem(k, JSON.stringify({ accessToken: 'AT', refreshToken: 'RT' }));
    }, [KEY]);

    await page.route('**/auth/me', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id: 'u1', role: 'customer' } }),
      })
    );
  });

  test('sign out from mobile closes sheet and navigates to /login', async ({ page }) => {
    // Force mobile so שה־sheet יופיע
    await page.setViewportSize({ width: 390, height: 844 });

    await page.route('**/auth/logout', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
    );

    await page.goto('/');

    // Open mobile sheet
    await page.getByRole('button', { name: /toggle menu/i }).click();

    // Click "Sign out" inside the sheet
    await page.getByRole('button', { name: /sign out/i }).click();

    // Assert redirect to /login and presence of the Login form
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });
});
