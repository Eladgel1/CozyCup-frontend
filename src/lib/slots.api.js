import { http } from './http';

function extractArray(payload) {
  if (Array.isArray(payload)) return payload;
  const cands = ['slots', 'data', 'items', 'results', 'docs'];
  for (const k of cands) {
    if (Array.isArray(payload?.[k])) return payload[k];
  }
  if (payload?.data) return extractArray(payload.data);
  return [];
}

function toLocalYMD(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const slotsApi = {
  list: async (dateStr) => {
    const r = await http.get('/slots');
    const all = extractArray(r.data);
    if (!dateStr) return all;
    return all.filter((s) => {
      const iso = s.startAt || s.start || s.from;
      return iso ? toLocalYMD(iso) === dateStr : false;
    });
  },

  create: async ({ startAt, endAt, capacity }) => {
    const res = await http.post('/slots', {
      startAt,
      endAt,
      capacity: Number(capacity),
    });
    return res.data;
  },
};
