import { test, expect } from '@playwright/test';

const CART_STORAGE_KEY = 'cozycup_cart_v1';

// Log in as a regular customer so /menu is accessible
async function loginAsCustomer(page) {
  await page.addInitScript(([cartKey]) => {
    // Ensure cart storage starts empty
    window.localStorage.setItem(cartKey, JSON.stringify([]));
    window.sessionStorage.setItem(
      'cozycup_auth',
      JSON.stringify({
        accessToken: 'AT_USER',
        refreshToken: 'RT_USER',
      })
    );
  }, [CART_STORAGE_KEY]);

  await page.route('**/auth/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'h1', email: 'elad@stam.com', role: 'host' },
      }),
    })
  );
}

/**
 * Stub for menuApi.list().
 * Important: do NOT intercept the document navigation to /menu.
 */
async function stubMenuList(page, items) {
  await page.route('**/menu', (route) => {
    const req = route.request();

    if (req.resourceType() === 'document') {
      return route.fallback();
    }

    if (req.method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items }),
      });
    }

    return route.fallback();
  });
}

// Stub for pickupApi.list()
async function stubPickupWindows(page, windows) {
  await page.route('**/pickup-windows', (route) => {
    const req = route.request();
    if (req.method() !== 'GET') return route.fallback();
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(windows),
    });
  });
}

// Stub for ordersApi.create()
async function stubOrdersCreate(page, handler) {
  await page.route('**/orders', async (route) => {
    const req = route.request();
    if (req.method() !== 'POST') return route.fallback();

    const raw = req.postData() || '{}';
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = {};
    }

    const result = handler ? await handler(payload) : { id: 'o1', status: 'CONFIRMED' };

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(result),
    });
  });
}

test.describe('Menu + Cart flow (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test('MenuPage + filters + MenuCard add-to-cart + CartDrawer basics', async ({ page }) => {
    const apiItems = [
      {
        id: 'latte1',
        name: 'Vanilla Latte',
        description: 'Sweet and creamy',
        priceCents: 450,
        imageUrl: '',
        category: 'Coffee',
      },
      {
        id: 'tea1',
        name: 'Earl Grey Tea',
        description: 'Bergamot black tea',
        priceCents: 300,
        imageUrl: '',
        category: 'Tea',
      },
      {
        id: 'muffin1',
        name: 'Blueberry Muffin',
        description: 'Bakery item',
        priceCents: 350,
        imageUrl: '',
        category: 'Pastry',
      },
    ];

    await stubMenuList(page, apiItems);

    await page.goto('/menu');
    await page.waitForLoadState('networkidle');

    // Hero heading
    await expect(
      page.getByRole('heading', { name: /our menu/i }).first()
    ).toBeVisible();

    // All items from API rendered as cards
    await expect(page.getByText('Vanilla Latte')).toBeVisible();
    await expect(page.getByText('Earl Grey Tea')).toBeVisible();
    await expect(page.getByText('Blueberry Muffin')).toBeVisible();

    // Category filter: click "Tea" tab and ensure only tea item is visible
    const teaTab = page.getByRole('tab', { name: /tea/i }).first();
    await teaTab.click();

    await expect(page.getByText('Earl Grey Tea')).toBeVisible();
    await expect(page.getByText('Vanilla Latte')).toHaveCount(0);
    await expect(page.getByText('Blueberry Muffin')).toHaveCount(0);

    // Go back to "All" tab
    const allTab = page.getByRole('tab', { name: /all/i }).first();
    await allTab.click();

    // Search filter: search for "muffin"
    const searchInput = page.getByPlaceholder('Search menu…');
    await searchInput.fill('muffin');

    await expect(page.getByText('Blueberry Muffin')).toBeVisible();
    await expect(page.getByText('Vanilla Latte')).toHaveCount(0);
    await expect(page.getByText('Earl Grey Tea')).toHaveCount(0);

    // Clear search to restore all
    await searchInput.fill('');
    await expect(page.getByText('Vanilla Latte')).toBeVisible();
    await expect(page.getByText('Earl Grey Tea')).toBeVisible();
    await expect(page.getByText('Blueberry Muffin')).toBeVisible();

    // Add one latte to cart
    const latteCard = page.locator('.card', { hasText: 'Vanilla Latte' }).first();
    await latteCard.getByRole('button', { name: /add/i }).click();

    // Drawer header
    await expect(page.getByText(/your cart/i)).toBeVisible();

    // Cart item row for latte exists
    const latteRow = page.locator('li', { hasText: 'Vanilla Latte' }).first();
    await expect(latteRow).toBeVisible();

    const subtotalLabel = page.getByText(/^Subtotal$/);
    const subtotalRow = subtotalLabel.locator('..');
    await expect(subtotalRow.getByText('$4.50')).toBeVisible();

    // Increment qty using "+" on that row
    await latteRow.getByRole('button', { name: '+' }).click();

    // Now subtotal is 2 * 4.50 = 9.00
    await expect(subtotalRow.getByText('$9.00')).toBeVisible();

    // Decrement back to 1 using "-"
    await latteRow.getByRole('button', { name: '-' }).click();
    await expect(subtotalRow.getByText('$4.50')).toBeVisible();

    // Remove item using trash icon button
    await latteRow.getByRole('button', { name: /🗑/ }).click();
    await expect(page.getByText(/no items added yet\./i)).toBeVisible();
  });

  test('CartDrawer loads pickup windows and places an order successfully', async ({ page }) => {
    const apiItems = [
      {
        id: 'latte1',
        name: 'Vanilla Latte',
        description: 'Sweet and creamy',
        priceCents: 450,
        imageUrl: '',
        category: 'Coffee',
      },
    ];
    await stubMenuList(page, apiItems);

    const now = new Date();
    const start = new Date(now.getTime() + 60 * 60 * 1000);
    const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const windows = [
      {
        id: '6904e3590f3692008aec8852',
        _id: '6904e3590f3692008aec8852',
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        capacity: 6,
        bookedCount: 0,
        status: 'open',
        isActive: true,
        isDeleted: false,
        notes: '',
        displayOrder: 0,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    ];
    await stubPickupWindows(page, windows);

    let capturedOrder = null;
    await stubOrdersCreate(page, (body) => {
      capturedOrder = body;
      return { id: 'o123', status: 'CONFIRMED' };
    });

    await page.goto('/menu');
    await page.waitForLoadState('networkidle');

    const latteCard = page.locator('.card', { hasText: 'Vanilla Latte' }).first();
    await latteCard.getByRole('button', { name: /add/i }).click();

    await expect(page.getByText(/your cart/i)).toBeVisible();

    // Wait for pickup windows to load into the select
    const select = page.locator('select').first();
    await expect(select).toBeVisible();

    const placeBtn = page.getByRole('button', { name: /place order/i }).first();
    await expect(placeBtn).toBeEnabled();

    // Add notes
    const notesArea = page.getByPlaceholder('Notes (optional)');
    await notesArea.fill('No sugar, please.');

    await placeBtn.click();

    await expect(
      page.getByText(/order placed successfully!/i)
    ).toBeVisible();

    // Drawer closes
    await expect(page.getByText(/your cart/i)).toHaveCount(0);

    // Verify request payload
    expect(capturedOrder).not.toBeNull();
    expect(Array.isArray(capturedOrder.items)).toBeTruthy();
    expect(capturedOrder.pickupWindowId).toBe('6904e3590f3692008aec8852');
    expect(capturedOrder.notes).toBe('No sugar, please.');
  });

  test('Cart context respects persisted items and increments correctly', async ({ page }) => {
    // Seed localStorage BEFORE React mounts
    await page.addInitScript(([cartKey]) => {
      const seeded = [
        {
          id: 'latte1',
          name: 'Vanilla Latte',
          price: 4.5,
          image: '',
          qty: 1,
        },
      ];
      window.localStorage.setItem(cartKey, JSON.stringify(seeded));
      window.sessionStorage.setItem(
        'cozycup_auth',
        JSON.stringify({
          accessToken: 'AT_USER',
          refreshToken: 'RT_USER',
        })
      );
    }, [CART_STORAGE_KEY]);

    await page.route('**/auth/me', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 'h1', email: 'elad@stam.com', role: 'host' },
        }),
      })
    );

    const apiItems = [
      {
        id: 'latte1',
        name: 'Vanilla Latte',
        description: 'Sweet and creamy',
        priceCents: 450,
        imageUrl: '',
        category: 'Coffee',
      },
    ];
    await stubMenuList(page, apiItems);
    await stubPickupWindows(page, []);

    await page.goto('/menu');
    await page.waitForLoadState('networkidle');

    const latteCard = page.locator('.card', { hasText: 'Vanilla Latte' }).first();
    await latteCard.getByRole('button', { name: /add/i }).click();

    // Drawer opens
    await expect(page.getByText(/your cart/i)).toBeVisible();

    const subtotalLabel = page.getByText(/^Subtotal$/);
    const subtotalRow = subtotalLabel.locator('..');

    await expect(subtotalRow.getByText('$9.00')).toBeVisible();

    const latteRow = page.locator('li', { hasText: 'Vanilla Latte' }).first();
    await expect(latteRow.getByText('2')).toBeVisible();
  });
});
