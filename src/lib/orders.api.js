import { http } from './http';

function toQty(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 1;
}

export const ordersApi = {
  // Create order
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

  // My orders
  async mine() {
    const { data } = await http.get('/orders/me');
    return data?.orders || data?.items || data;
  },

  // ===== Host-facing helpers =====

  // List all orders
  async listHost() {
    try {
      const { data } = await http.get('/orders');
      return data?.orders || data?.items || data || [];
    } catch (e) {
      const code = e?.status || e?.response?.status;
      if (code === 404) return []; // tolerate missing route
      throw e;
    }
  },

  // Get order status
  async statusOf(id) {
    const { data } = await http.get(`/orders/${String(id)}/status`);
    return data?.status || data;
  },

  // Update order status
  async updateStatus(id, status) {
    const { data } = await http.patch(`/orders/${String(id)}/status`, { status });
    return data;
  },

  // Day summary
  async daySummary() {
    try {
      const { data } = await http.get('/reports/day-summary');
      return data || {};
    } catch (e) {
      const code = e?.status || e?.response?.status;
      if (code === 404) return {};
      throw e;
    }
  },
};
