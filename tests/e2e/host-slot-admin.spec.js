import { test, expect } from '@playwright/test';

async function loginAsHost(page) {
  await page.addInitScript(() => {
    sessionStorage.setItem(
      'cozycup_auth',
      JSON.stringify({ accessToken: 'AT_HOST', refreshToken: 'RT_HOST' })
    );
    window.__E2E_USER__ = { id: 'h1', email: 'elad@stam.com', role: 'host' };
  });

  await page.route('**/auth/me', r =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: { id: 'h1', email: 'elad@stam.com', role: 'host' } }),
    })
  );
}

const pad = (n) => String(n).padStart(2, '0');
const isoLocal = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

test.describe('HostSlotAdmin (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsHost(page);

    await page.route('**/slots', r => {
      if (r.request().method() === 'GET') {
        return r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }
      return r.fallback();
    });
  });

  test('creates a valid slot successfully', async ({ page }) => {
    // Allow POST /slots to succeed
    await page.route('**/slots', r => {
      if (r.request().method() === 'POST') {
        return r.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true }),
        });
      }
      return r.fallback();
    });

    await page.goto('/bookings');

    const createBtn = page.getByRole('button', { name: /create slot/i });
    await expect(createBtn).toBeVisible();

    const form = createBtn.locator('xpath=ancestor::form[1]');

    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const dISO = isoLocal(tomorrow);

    // Fill inputs inside the form (date, time start, time end, capacity)
    await form.locator('input[type="date"]').first().fill(dISO);
    await form.locator('input[type="time"]').nth(0).fill('10:00');
    await form.locator('input[type="time"]').nth(1).fill('11:00');
    await form.locator('input[type="number"]').first().fill('8');

    await createBtn.click();
    await expect(page.getByText(/slot created/i)).toBeVisible();
  });

  test('shows validation errors (past date / invalid times / invalid capacity)', async ({ page }) => {
    await page.goto('/bookings');

    const createBtn = page.getByRole('button', { name: /create slot/i });
    await expect(createBtn).toBeVisible();
    const form = createBtn.locator('xpath=ancestor::form[1]');

    const dateInput  = form.locator('input[type="date"]').first();
    const startInput = form.locator('input[type="time"]').nth(0);
    const endInput   = form.locator('input[type="time"]').nth(1);
    const capInput   = form.locator('input[type="number"]').first();

    const now = new Date();
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const tomorrow  = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // Past date → error
    await dateInput.fill(isoLocal(yesterday));
    await createBtn.click();
    const validationMessage = await dateInput.evaluate(el => el.validationMessage);
    expect(validationMessage).toMatch(/Value must be .* or later\./i);

    // Invalid time range → error
    await dateInput.fill(isoLocal(tomorrow));
    await startInput.fill('12:00');
    await endInput.fill('11:00');
    await createBtn.click();
    await expect(page.getByText(/start time must be earlier/i)).toBeVisible();

    // Invalid capacity (<= 0) → error
    await startInput.fill('10:00');
    await endInput.fill('11:00');
    // Remove HTML validation attribute so submit is allowed
    await page.evaluate((el) => el && el.removeAttribute('min'), await capInput.elementHandle());
    await capInput.fill('0');

    await createBtn.click();
    await expect(page.getByText(/capacity must be a positive number/i)).toBeVisible();
  });
});
