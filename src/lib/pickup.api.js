import { http } from './http';

function toId(x) {
  return x.id || x._id;
}
function startISO(w) {
  return w.startAt || w.start || w.from;
}
function endISO(w) {
  return w.endAt || w.end || w.to;
}
function normalize(data) {
  const arr =
    (Array.isArray(data) ? data : null) ||
    data?.items ||
    data?.windows ||
    data?.data ||
    [];
  return arr
    .map((w) => ({
      ...w,
      id: toId(w),
      startAt: startISO(w),
      endAt: endISO(w),
      capacity: Number(w.capacity ?? 0),
      remaining: Number(w.remaining ?? Math.max(0, (w.capacity ?? 0) - (w.bookedCount ?? 0))),
    }))
    .filter((w) => !!w.id && !!w.startAt && !!w.endAt)
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
}

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function plusDaysISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const pickupApi = {
  async list() {
    try {
      const r = await http.get('/pickup-windows');
      const list = normalize(r.data);
      if (list.length) return list;
    } catch (e) { console.log(e); }

    const bag = [];
    try {
      const r1 = await http.get('/pickup-windows', { params: { date: todayISO() } });
      bag.push(...normalize(r1.data));
    } catch (e) { console.log(e); }
    try {
      const r2 = await http.get('/pickup-windows', { params: { date: plusDaysISO(1) } });
      bag.push(...normalize(r2.data));
    } catch (e) { console.log(e); }

    const m = new Map();
    for (const w of bag) m.set(w.id, w);
    return Array.from(m.values()).sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
  },
};
