import { test, expect } from '@playwright/test';

async function loginAsHost(page) {
  await page.addInitScript(() => {
    sessionStorage.setItem(
      'cozycup_auth',
      JSON.stringify({
        accessToken: 'AT_HOST',
        refreshToken: 'RT_HOST',
      })
    );
  });

  await page.route('**/auth/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'h1', email: 'host@example.com', role: 'host' },
      }),
    })
  );
}

test.describe('HostScannerPage (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsHost(page);
  });

  test('checks in with a pasted token and clears input on success', async ({ page }) => {
    const token = 'ONE_TIME_TOKEN_123';

    await page.route('**/checkin/**', (route) => {
      if (route.request().method() !== 'POST') {
        return route.fallback();
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto('/host/scanner');
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('heading', { name: /scanner \(placeholder\)/i })
    ).toBeVisible();

    const input = page.getByPlaceholder(/paste qr token/i);
    await expect(input).toBeVisible();

    const button = page.getByRole('button', { name: /check in/i });
    await expect(button).toBeDisabled();

    await input.fill(token);
    await expect(button).toBeEnabled();

    await button.click();

    await expect(
      page.getByText(/checked in successfully/i)
    ).toBeVisible();

    await expect(input).toHaveValue('');
    await expect(button).toBeDisabled();
  });
});
