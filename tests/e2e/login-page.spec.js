import { test, expect } from '@playwright/test';

async function stubAuthMe(page) {
  await page.route('**/auth/me', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: null }),
    }),
  );
}

test.describe('Login page (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await stubAuthMe(page);
  });

  test('logs in successfully and redirects to home', async ({ page }) => {
    // Successful login stub
    await page.route('**/auth/login', async route => {
      if (route.request().method() !== 'POST') return route.fallback();
      const body = JSON.parse(route.request().postData() || '{}');

      // Basic sanity: email and password are present
      if (!body.email || !body.password) {
        return route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Missing credentials' }),
        });
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'AT_USER',
          refreshToken: 'RT_USER',
          user: { id: 'u1', email: body.email, role: 'customer' },
        }),
      });
    });

    await page.goto('/login');

    // Form fields
    await expect(
      page.getByRole('heading', { name: /login/i }),
    ).toBeVisible();

    await page.getByPlaceholder('Email').fill('user@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Redirect to home
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole('heading', { name: /cozy up your day/i }),
    ).toBeVisible();
  });

  test('shows backend error when credentials are invalid', async ({ page }) => {
    // Error response from backend
    await page.route('**/auth/login', route =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid email or password' }),
      }),
    );

    await page.goto('/login');

    await page.getByPlaceholder('Email').fill('wrong@example.com');
    await page.getByPlaceholder('Password').fill('wrongpass123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Friendly mapped error
    await expect(
      page.getByText(/invalid email or password/i),
    ).toBeVisible();
    // Still on login page
    await expect(
      page.getByRole('heading', { name: /login/i }),
    ).toBeVisible();
  });

  test('shows validation error when email/password are missing', async ({ page }) => {
    // Remove native required attributes so the React validation can run
    await page.goto('/login');

    const emailInput = page.getByPlaceholder('Email');
    const passwordInput = page.getByPlaceholder('Password');

    await page.evaluate(el => {
      el.removeAttribute('required');
    }, await emailInput.elementHandle());
    await page.evaluate(el => {
      el.removeAttribute('required');
      el.removeAttribute('minlength');
    }, await passwordInput.elementHandle());

    // Leave both empty and submit
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(
      page.getByText(/something went wrong. please try again/i),
    ).toBeVisible();
  });

  test('has link to registration page', async ({ page }) => {
    await page.goto('/login');

    const registerLink = page.getByRole('button', { name: /register/i });
    await expect(registerLink).toBeVisible();

    await registerLink.click();
    await expect(page).toHaveURL(/\/register/);
    await expect(
      page.getByRole('heading', { name: /register/i }),
    ).toBeVisible();
  });
});
