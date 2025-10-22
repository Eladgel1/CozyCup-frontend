import { http } from './http';

export const ordersApi = {
  create: async (payload) => {
    const res = await http.post('/orders', payload);
    return res.data;
  },
};
