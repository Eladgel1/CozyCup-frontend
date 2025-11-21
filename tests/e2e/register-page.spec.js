import { test, expect } from '@playwright/test';

/**
 * Stub auth endpoints for registration flows.
 */
async function stubAuthMe(page) {
  await page.route('**/auth/me', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: null }),
    }),
  );
}

test.describe('Register page (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await stubAuthMe(page);
  });

  test('registers successfully and redirects to home', async ({ page }) => {
    // Successful registration stub
    await page.route('**/auth/register', async route => {
      if (route.request().method() !== 'POST') return route.fallback();
      const body = JSON.parse(route.request().postData() || '{}');

      if (!body.email || !body.password) {
        return route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Email and password are required' }),
        });
      }

      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'AT_USER',
          refreshToken: 'RT_USER',
          user: {
            id: 'u2',
            email: body.email,
            name: body.name || 'New User',
            role: 'customer',
          },
        }),
      });
    });

    await page.goto('/register');

    await expect(
      page.getByRole('heading', { name: /register/i }),
    ).toBeVisible();

    await page.getByPlaceholder('Name').fill('New User');
    await page.getByPlaceholder('Email').fill('newuser@example.com');
    await page.getByPlaceholder('Password').fill('strongpass123');

    await page.getByRole('button', { name: /create account/i }).click();

    // Redirect to home
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole('heading', { name: /cozy up your day/i }),
    ).toBeVisible();
  });

  test('shows backend error when email is already taken', async ({ page }) => {
    // Backend rejects registration with 409
    await page.route('**/auth/register', route =>
      route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Email already in use' }),
      }),
    );

    await page.goto('/register');

    await page.getByPlaceholder('Name').fill('Existing User');
    await page.getByPlaceholder('Email').fill('existing@example.com');
    await page.getByPlaceholder('Password').fill('password1234');

    await page.getByRole('button', { name: /create account/i }).click();

    await expect(
      page.getByText(/an account with this email already exists./i),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /register/i }),
    ).toBeVisible();
  });

  test('shows validation error when email/password are missing', async ({ page }) => {
    await page.goto('/register');

    const emailInput = page.getByPlaceholder('Email');
    const passwordInput = page.getByPlaceholder('Password');

    // Remove native validation so the React check can run
    await page.evaluate(el => {
      el.removeAttribute('required');
    }, await emailInput.elementHandle());
    await page.evaluate(el => {
      el.removeAttribute('required');
      el.removeAttribute('minlength');
    }, await passwordInput.elementHandle());

    // Leave email/password empty, only fill name
    await page.getByPlaceholder('Name').fill('No Email User');
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(
      page.getByText(/something went wrong. please try again./i),
    ).toBeVisible();
  });
});
