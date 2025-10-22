import { http } from './http';

export const slotsApi = {
  list: async (dateStr) => {
    const res = await http.get('/slots', { params: dateStr ? { date: dateStr } : undefined });
    return Array.isArray(res.data) ? res.data : (res.data?.slots || []);
  },
};
