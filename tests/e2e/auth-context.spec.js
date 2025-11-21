import { test, expect } from '@playwright/test';

const KEY = 'cozycup_auth';

test.describe('AuthProvider (E2E)', () => {
  test('initializes tokens, fetches me when access token exists', async ({ page }) => {
    // Put tokens before navigation
    await page.addInitScript(([k]) => {
      sessionStorage.setItem(k, JSON.stringify({ accessToken: 'AT', refreshToken: 'RT' }));
    }, [KEY]);

    await page.route('**/auth/me', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id: 'u1', email: 'x@y.z', role: 'customer' } }),
      })
    );

    await page.goto('/');

    // Authenticated header shows "Sign out"
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
  });

  test('login stores tokens (remember) and sets user', async ({ page }) => {
    // Fake backend
    await page.route('**/auth/login', async route => {
      const body = { tokens: { accessToken: 'AT', refreshToken: 'RT' } };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });
    await page.route('**/auth/me', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id: 'u1', email: 'x@y.z', role: 'customer' } }),
      })
    );

    await page.goto('/login');

    await page.getByPlaceholder('Email').fill('x@y.z');
    await page.getByPlaceholder('Password').fill('password123'); // >= 8 chars
    // Remember me -> store to localStorage
    await page.getByLabel(/remember me/i).check();

    await page.getByRole('button', { name: /sign in/i }).click();

    // Redirect to "/" and authenticated header
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();

    // Verify tokens persisted to localStorage (remember=true)
    const saved = await page.evaluate((k) => localStorage.getItem(k), KEY);
    expect(saved).toBeTruthy();
    const parsed = JSON.parse(saved);
    expect(parsed.accessToken).toBe('AT');
    expect(parsed.refreshToken).toBe('RT');
  });

  test('logout clears tokens and unsets user', async ({ page }) => {
    await page.addInitScript(([k]) => {
      sessionStorage.setItem(k, JSON.stringify({ accessToken: 'AT', refreshToken: 'RT' }));
    }, [KEY]);

    await page.route('**/auth/me', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { id: 'u1', role: 'customer' } }) })
    );
    await page.route('**/auth/logout', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
    );

    await page.goto('/');

    // Sign out (desktop)
    await page.getByRole('button', { name: /sign out/i }).click();

    // We should be on /login and no tokens present
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();

    const session = await page.evaluate((k) => sessionStorage.getItem(k), KEY);
    const local = await page.evaluate((k) => localStorage.getItem(k), KEY);
    expect(session).toBeNull();
    expect(local).toBeNull();
  });
});
