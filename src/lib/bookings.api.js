import { http } from './http';

function extractArray(payload) {
  if (Array.isArray(payload)) return payload;
  const cands = ['bookings', 'data', 'items', 'results', 'docs'];
  for (const k of cands) if (Array.isArray(payload?.[k])) return payload[k];
  if (payload?.data) return extractArray(payload.data);
  return [];
}

export const bookingsApi = {
  create: async ({ slotId }) => {
    // Try common payload shapes
    try {
      const r1 = await http.post('/bookings', { slotId });
      return r1.data;
    } catch {
      const r2 = await http.post('/bookings', { slot: slotId });
      return r2.data;
    }
  },

  mine: async () => {
    const res = await http.get('/bookings/me');
    return extractArray(res.data);
  },

  cancel: async (bookingId) => {
    const res = await http.patch(`/bookings/${bookingId}/cancel`);
    return res.data || { ok: true };
  },

  qrToken: async (bookingId) => {
    const res = await http.post(`/bookings/${bookingId}/qr-token`);
    return res.data?.token || res.data?.qrToken || '';
  },
};
