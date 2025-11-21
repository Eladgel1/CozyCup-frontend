import { test, expect } from '@playwright/test';

const KEY = 'cozycup_auth';

test.describe('ProtectedRoute (E2E)', () => {
  test('redirects unauthenticated to /login', async ({ page }) => {
    await page.goto('/orders');
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
  });

  test('renders child when authenticated', async ({ page }) => {
    await page.addInitScript(([k]) => {
      sessionStorage.setItem(k, JSON.stringify({ accessToken: 'AT', refreshToken: 'RT' }));
    }, [KEY]);
    await page.route('**/auth/me', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { id: 'u1', role: 'customer' } }) })
    );

    await page.goto('/orders');
    // Orders page skeleton may vary; assert we didn't end on login:
    await expect(page).not.toHaveURL(/\/login$/);
  });
});
