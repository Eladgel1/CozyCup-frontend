import { http } from './http';

export const menuApi = {
  list: async () => {
    const res = await http.get('/menu');
    return Array.isArray(res.data) ? res.data : (res.data?.items || []);
  },
};
