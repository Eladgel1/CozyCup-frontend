import { http } from './http';

function toQty(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 1;
}

export const ordersApi = {
  async create({ items, pickupWindowId, notes, paymentMethod = 'CASH' }) {
    const normalized = (items || []).map((x) => {
      const menuItemId = String(x.menuItemId || x.itemId || x.id || '');
      const quantity = toQty(x.quantity ?? x.qty);
      return { menuItemId, quantity };
    });

    if (!normalized.length || normalized.some((i) => !i.menuItemId)) {
      throw new Error('Invalid cart items');
    }

    const body = {
      items: normalized,
      pickupWindowId: pickupWindowId ? String(pickupWindowId) : undefined,
      paymentMethod,
      notes: notes != null ? String(notes) : undefined,
    };

    const { data } = await http.post('/orders', body);
    return data;
  },

  async mine() {
    const { data } = await http.get('/orders/me');
    return data?.orders || data?.items || data;
  },
};
