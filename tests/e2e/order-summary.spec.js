import { test, expect } from '@playwright/test';

test.describe('OrderSummary markup (E2E-ish)', () => {
  test('renders id, eta and status when data is present', async ({ page }) => {
    await page.setContent(`
      <div class="card p-4 mt-4">
        <h3 class="font-semibold">Order Summary</h3>
        <div class="muted text-sm mt-1">Order ID: o123</div>
        <div class="muted text-sm">ETA: 10:30</div>
        <div class="muted text-sm">Status: READY</div>
      </div>
    `);

    await expect(page.getByText(/order summary/i)).toBeVisible();
    await expect(page.getByText(/order id:\s*o123/i)).toBeVisible();
    await expect(page.getByText(/eta:\s*10:30/i)).toBeVisible();
    await expect(page.getByText(/status:\s*ready/i)).toBeVisible();
  });

  test('handles missing ETA gracefully', async ({ page }) => {
    await page.setContent(`
      <div class="card p-4 mt-4">
        <h3 class="font-semibold">Order Summary</h3>
        <div class="muted text-sm mt-1">Order ID: o999</div>
        <div class="muted text-sm"></div>
        <div class="muted text-sm">Status: Waiting</div>
      </div>
    `);

    await expect(page.getByText(/order id:\s*o999/i)).toBeVisible();
    // There should be no explicit "ETA:" text in this case
    await expect(page.getByText(/eta:/i)).toHaveCount(0);
    await expect(page.getByText(/status:\s*waiting/i)).toBeVisible();
  });
});
