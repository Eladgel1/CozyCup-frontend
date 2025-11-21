import { test, expect } from '@playwright/test';

const KEY = 'cozycup_auth';

test.describe('App + Routes happy-path navigation (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/auth/me', route =>
      route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'unauth' }) })
    );

    // Only mock JSON fetch/XHR to /menu. Let document navigation load normally.
    await page.route('**/menu', route => {
      const req = route.request();
      const type = req.resourceType();
      const accept = (req.headers()['accept'] || '').toLowerCase();
      const isApi = (type === 'fetch' || type === 'xhr') && accept.includes('application/json');
      if (!isApi) return route.continue();
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 'm1', name: 'Latte', priceCents: 450 }]),
      });
    });
  });

  test('redirects to /login on protected route and then shows target after auth flips', async ({ page }) => {
    // Clean storage ONCE before first navigation
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
        localStorage.removeItem('cozycup_auth');
        sessionStorage.removeItem('cozycup_auth');
      } catch {}
    });

    // Go directly to a protected route
    await page.goto('/menu');

    // The guard may briefly show a loading indicator
    await page.waitForSelector('text=Loading…', { timeout: 3000 }).catch(() => {});

    const sawLogin = await Promise.race([
      page.waitForURL(/\/login$/, { timeout: 12000 }).then(() => true).catch(() => false),
      page
        .waitForSelector('input[placeholder="Email"], h2:has-text("Login"), button:has-text("Sign in")', { timeout: 12000 })
        .then(() => true)
        .catch(() => false),
    ]);
    expect(sawLogin).toBeTruthy();

    // Flip auth to "customer": allow /auth/me and set tokens
    await page.route('**/auth/me', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { _id: 'u1', email: 'hello@world.com', role: 'customer' } }),
      })
    );
    await page.evaluate(([k]) => {
      sessionStorage.setItem(k, JSON.stringify({ accessToken: 'AT', refreshToken: 'RT' }));
    }, [KEY]);

    // Reload so AuthProvider re-inits and fetches /auth/me with the new token
    await page.reload();

    // Navigate again to the protected page
    await page.goto('/menu');
    await page.waitForSelector('text=Loading menu…', { timeout: 3000 }).catch(() => {});

    await expect(page.getByRole('heading', { name: /our menu/i })).toBeVisible();
  });

  test('host route stays hidden for customer and works for host', async ({ page }) => {
    // Set tokens BEFORE the first navigation using addInitScript
    await page.addInitScript(([k]) => {
      try {
        sessionStorage.setItem(k, JSON.stringify({ accessToken: 'AT', refreshToken: 'RT' }));
      } catch {}
    }, [KEY]);

    // Start as authenticated customer
    await page.route('**/auth/me', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { _id: 'u1', email: 'hello@world.com', role: 'customer' } }),
      })
    );

    await page.goto('/host/dashboard');
    // Non-host is redirected to Home - assert a stable Home element
    await expect(page.getByRole('link', { name: /order now/i })).toBeVisible();

    // Become host and try again
    await page.route('**/auth/me', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { _id: 'h1', email: 'host@world.com', role: 'host' } }),
      })
    );
    await page.goto('/host/dashboard');
    await expect(page).toHaveURL(/\/host\/dashboard$/);
  });
});
