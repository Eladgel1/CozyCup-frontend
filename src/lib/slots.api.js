import { http } from './http';

export const slotsApi = {
  list: async (dateStr) => {
    try {
      const r1 = await http.get('/slots', { params: dateStr ? { date: dateStr } : undefined });
      const arr = Array.isArray(r1.data) ? r1.data : (r1.data?.slots || []);
      if (arr?.length || dateStr) return arr;
    } catch (_) {}
    const r2 = await http.get('/slots');
    return Array.isArray(r2.data) ? r2.data : (r2.data?.slots || []);
  },

  create: async ({ date, start, end, capacity }) => {
    const payload = { date, start, end, capacity };
    const res = await http.post('/slots', payload);
    return res.data;
  },
};
