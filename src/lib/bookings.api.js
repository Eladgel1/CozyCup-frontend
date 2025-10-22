import { http } from './http';

export const bookingsApi = {
  create: async ({ slotId }) => {
    const res = await http.post('/bookings', { slotId });
    return res.data; // { bookingId, ... }
  },
  mine: async () => {
    const res = await http.get('/bookings/me');
    return Array.isArray(res.data) ? res.data : (res.data?.bookings || []);
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
