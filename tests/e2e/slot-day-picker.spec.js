import { test, expect } from '@playwright/test';

async function loginAsCustomer(page) {
  await page.addInitScript(() => {
    sessionStorage.setItem('cozycup_auth', JSON.stringify({
      accessToken: 'AT_USER', refreshToken: 'RT_USER',
    }));
  });
  await page.route('**/auth/me', r => r.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ user: { id: 'u1', email: 'eee@g.com', role: 'customer' } }),
  }));
}

test.describe('SlotDayPicker (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
    await page.route('**/slots', r => r.fulfill({
      status: 200, contentType: 'application/json', body: JSON.stringify([]),
    }));
  });

  test('renders 3 day tabs (today, +1, +2) and is visible', async ({ page }) => {
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');

    const dayTabs = page.getByRole('tablist').nth(1);
    await expect(dayTabs).toBeVisible();
    await expect(dayTabs.getByRole('tab')).toHaveCount(3);
  });
});
