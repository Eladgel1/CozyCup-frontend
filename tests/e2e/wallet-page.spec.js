import { test, expect } from '@playwright/test';

// Login stub - stable, always returns a valid customer user.
async function loginAsCustomer(page) {
  await page.addInitScript(() => {
    window.sessionStorage.setItem(
      'cozycup_auth',
      JSON.stringify({
        accessToken: 'AT_USER',
        refreshToken: 'RT_USER',
      })
    );
  });

  await page.route('**/auth/me', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'u1', email: 'hello@world.com', role: 'customer' },
      }),
    })
  );
}

async function stubWalletApi(page) {
  let balanceCents = 0;
  const history = [];

  const packages = [
    { id: 'credit50',  name: 'Add $50 credit', credits: 0,  priceCents: 5000 },
    { id: 'credit30',  name: 'Add $30 credit', credits: 0,  priceCents: 3000 },
    { id: 'credit20',  name: 'Add $20 credit', credits: 0,  priceCents: 2000 },
    { id: 'credit10',  name: 'Add $10 credit', credits: 0,  priceCents: 1000 },

    { id: 'coffee20', name: '20 Coffees', credits: 20, priceCents: 5200 },
    { id: 'coffee15', name: '15 Coffees', credits: 15, priceCents: 4000 },
    { id: 'coffee10', name: '10 Coffees', credits: 10, priceCents: 2800 },
    { id: 'coffee5',  name: '5 Coffees',  credits: 5,  priceCents: 1500 },
  ];

  await page.route('**/packages', async route => {
    const method = route.request().method();

    // List packages
    if (method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(packages),
      });
    }

    if (method === 'POST') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    }

    return route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Not mocked in test (/packages)' }),
    });
  });

  await page.route('**/purchase/me/wallet**', async route => {
    const req = route.request();
    const method = req.method();
    const url = new URL(req.url());
    const path = url.pathname;

    if (method !== 'GET') {
      return route.fulfill({
        status: 405,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Method not allowed' }),
      });
    }

    if (path.includes('history')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(history),
      });
    }

    // Default: wallet summary
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        balanceCents,
        expiresAt: null,
        history,
      }),
    });
  });

  await page.route('**/purchase', async route => {
    const req = route.request();
    const method = req.method();

    if (method !== 'POST') {
      return route.fulfill({
        status: 405,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Method not allowed' }),
      });
    }

    let body = {};
    try {
      body = JSON.parse(req.postData() || '{}');
    } catch {
      body = {};
    }

    const pkg = packages.find(p => p.id === body.packageId);
    if (!pkg) {
      return route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unknown package' }),
      });
    }

    // Top-up vs pass purchase
    if (pkg.credits > 0) {
      // Pass = spend balance
      balanceCents = Math.max(0, balanceCents - pkg.priceCents);
    } else {
      // Credit top-up = add to balance
      balanceCents += pkg.priceCents;
    }

    history.push({
      id: `h${history.length + 1}`,
      createdAt: new Date().toISOString(),
      type: pkg.credits > 0 ? 'PASS PURCHASE' : 'CREDIT TOP-UP',
      amountCents: pkg.priceCents,
      note:
        pkg.credits > 0
          ? `${pkg.credits} Coffees`
          : `Add $${pkg.priceCents / 100} credit`,
    });

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    });
  });
}

test.describe('WalletPage + PurchasePassModal (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    // Keep modal inside viewport
    await page.setViewportSize({ width: 1280, height: 600 });

    await loginAsCustomer(page);
    await stubWalletApi(page);
  });

  test('allows topping up balance and then buying a coffee pass fully visually', async ({ page }) => {
    await page.goto('/wallet');

    // Hero loaded
    await expect(page.getByRole('heading', { name: /wallet/i })).toBeVisible();

    // Initial state
    await expect(page.getByText('$0.00')).toBeVisible();
    await expect(page.getByText(/no activity yet/i)).toBeVisible();

    //
    // PURCHASE #1 — Credit $50
    //
    await page.getByRole('button', { name: /purchase/i }).click();

    await expect(page.getByRole('heading', { name: /purchase pass/i })).toBeVisible();
    await expect(page.getByText(/add \$50 credit/i)).toBeVisible();

    const confirm50 = page.getByRole('button', { name: /confirm \$50\.00/i });
    await expect(confirm50).toBeEnabled();
    await confirm50.click();

    await expect(page.getByText(/purchase completed successfully/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /purchase pass/i })).toHaveCount(0);

    await expect(page.getByText('$50.00').first()).toBeVisible();
    await expect(page.getByText(/credit top-up/i)).toBeVisible();

    //
    // PURCHASE #2 — "10 Coffees" for $28
    //
    await page.getByRole('button', { name: /purchase/i }).click();
    await expect(page.getByRole('heading', { name: /purchase pass/i })).toBeVisible();

    const tenCoffees = page.locator('label', { hasText: /10 coffees/i }).first();
    await tenCoffees.click();

    const confirm28 = page.getByRole('button', { name: /confirm \$28\.00/i });
    await expect(confirm28).toBeEnabled();
    await confirm28.click();

    await expect(page.getByText(/purchase completed successfully/i).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /purchase pass/i })).toHaveCount(0);

    // New balance: 50 - 28 = 22
    await expect(page.getByText('$22.00')).toBeVisible();

    // History should include both records
    await expect(page.getByText(/credit top-up/i)).toBeVisible();
    await expect(page.getByText(/pass purchase/i)).toBeVisible();
    await expect(page.getByText('$28.00')).toBeVisible();
    await expect(page.getByText(/10 coffees/i)).toBeVisible();
  });
});
