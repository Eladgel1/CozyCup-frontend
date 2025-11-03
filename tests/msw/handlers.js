import { http, HttpResponse } from 'msw';
import { menuFixtures } from '../fixtures/menu';
import { packageFixtures } from '../fixtures/packages';

// --- Simple in-memory "DB" shared across tests ---
export const testDb = {
  menu: menuFixtures,
  packages: packageFixtures,

  pickupWindows: [
    { id: 'pw-1', startAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), endAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), capacity: 10, bookedCount: 0 },
    { id: 'pw-2', startAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), endAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), capacity: 8,  bookedCount: 0 },
  ],

  orders: [],
  bookings: [],
  purchases: [],

  wallet: { balanceCents: 0, expiresAt: null },

  _seq: 1,
};

export function resetDb() {
  testDb.orders = [];
  testDb.bookings = [];
  testDb.purchases = [];
  testDb.wallet = { balanceCents: 0, expiresAt: null };
  testDb._seq = 1;
}

function nextId(prefix) {
  testDb._seq += 1;
  return `${prefix}-${testDb._seq}`;
}

function calcOrderTotalCents(items) {
  let sum = 0;
  for (const it of items) {
    const m = testDb.menu.find(x => x.id === it.menuItemId);
    if (m) sum += Number(m.priceCents || m.price || 0) * Number(it.quantity || 1);
  }
  return sum;
}

// --- Handlers ---
export const handlers = [
  // Menu
  http.get('*/menu', () => {
    return HttpResponse.json({ items: testDb.menu });
  }),

  // Pickup windows
  http.get('*/pickup-windows', () => {
    return HttpResponse.json({ items: testDb.pickupWindows });
  }),

  // Orders - create
  http.post('*/orders', async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    const items = Array.isArray(body.items) ? body.items : [];

    if (!items.length || items.some(i => !i.menuItemId || !Number(i.quantity))) {
      return HttpResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid cart items' } },
        { status: 400 }
      );
    }

    const id = nextId('ord');
    const now = new Date().toISOString();
    const totalCents = calcOrderTotalCents(items);

    testDb.orders.push({
      id,
      customerId: 'u-test',
      items: items.map(x => ({ menuItemId: String(x.menuItemId), quantity: Number(x.quantity) })),
      status: 'CONFIRMED',
      totalCents,
      createdAt: now,
      pickupWindowId: body.pickupWindowId || null,
      notes: body.notes || '',
    });

    return HttpResponse.json({ id, totalCents, status: 'CONFIRMED', createdAt: now });
  }),

  // Orders - mine
  http.get('*/orders/me', () => {
    return HttpResponse.json({ orders: testDb.orders });
  }),

  // Packages
  http.get('*/packages', () => {
    return HttpResponse.json({ packages: testDb.packages });
  }),

  // Wallet: purchase (top-up credits or buy drink pass)
  http.post('*/purchase', async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    const packageId = String(body.packageId || '');
    const pkg = testDb.packages.find(p => p.id === packageId);

    if (!pkg) {
      return HttpResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid packageId' } },
        { status: 400 }
      );
    }

    const id = nextId('p');
    const now = new Date().toISOString();
    const amountCents = Number(pkg.priceCents || pkg.price || 0);

    testDb.purchases.push({
      id,
      userId: 'u-test',
      packageId,
      amountCents,
      createdAt: now,
    });

    if (Number(pkg.credits || 0) === 0) {
      testDb.wallet.balanceCents += amountCents;
    }

    return HttpResponse.json({ id, packageId, amountCents, createdAt: now });
  }),

  // Wallet: me (support both POST and GET to match FE fallbacks)
  http.post('*/purchase/me/wallet', () => {
    return HttpResponse.json({ wallet: testDb.wallet });
  }),
  http.get('*/purchase/me/wallet', () => {
    return HttpResponse.json({ wallet: testDb.wallet });
  }),

  // Wallet: purchases (history)
  http.get('*/purchase/me', () => {
    return HttpResponse.json({ purchases: testDb.purchases });
  }),

  // Bookings (for history tab)
  http.get('*/bookings/me', () => {
    return HttpResponse.json({ bookings: testDb.bookings });
  }),
];
