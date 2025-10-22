import { http } from './http';

export const pickupApi = {
  list: async () => {
    const res = await http.get('/pickup-windows');
    return Array.isArray(res.data) ? res.data : (res.data?.windows || []);
  },
};
