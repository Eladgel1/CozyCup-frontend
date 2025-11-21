import { test, expect } from '@playwright/test';

const KEY = 'cozycup_auth';

test.describe('PublicOnlyRoute (E2E)', () => {
  test('renders children when not authenticated', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
  });

  test('redirects to / when authenticated', async ({ page }) => {
    await page.addInitScript(([k]) => {
      sessionStorage.setItem(k, JSON.stringify({ accessToken: 'AT', refreshToken: 'RT' }));
    }, [KEY]);
    await page.route('**/auth/me', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { id: 'u1', role: 'customer' } }) })
    );

    await page.goto('/login');
    // Auth guard should bounce us to "/"
    await expect(page).toHaveURL('/');
  });
});
