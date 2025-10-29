import { http } from './http';

/** ---------- helpers ---------- */
const KEY = 'cozy.wallet.local';

function readLocal() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { balanceCents: 0, expiresAt: null, history: [] };
    const obj = JSON.parse(raw);
    return {
      balanceCents: Number(obj?.balanceCents ?? 0),
      expiresAt: obj?.expiresAt ?? null,
      history: Array.isArray(obj?.history) ? obj.history : [],
    };
  } catch {
    return { balanceCents: 0, expiresAt: null, history: [] };
  }
}
function writeLocal(next) {
  const safe = {
    balanceCents: Number(next?.balanceCents ?? 0),
    expiresAt: next?.expiresAt ?? null,
    history: Array.isArray(next?.history) ? next.history : [],
  };
  localStorage.setItem(KEY, JSON.stringify(safe));
  return safe;
}

let lastPackages = [];

function normalizePackage(p) {
  if (!p) return null;
  const id = p.id || p._id;
  const priceCents = Number(
    p.priceCents ?? p.price ?? (typeof p.priceUsd === 'number' ? p.priceUsd * 100 : 0)
  );
  return { ...p, id, _id: id, priceCents, credits: Number(p.credits ?? 0) };
}

async function tryEndpoints(sequence) {
  let lastErr;
  for (const step of sequence) {
    try {
      const { method, url, body } = step;
      const res = method === 'GET' ? await http.get(url) : await http.post(url, body ?? {});
      return res.data;
    } catch (e) {
      lastErr = e;
      const code = e?.status || e?.response?.status;
      if (code !== 404) throw e;
    }
  }
  throw lastErr;
}

/** ---------- public API ---------- */
export const walletApi = {
  async me() {
    try {
      const data = await tryEndpoints([
        { method: 'POST', url: '/purchase/me/wallet' },
        { method: 'GET', url: '/purchase/me/wallet' },
      ]);
      const w = data?.wallet || data || {};
      return {
        balanceCents: Number(w.balanceCents ?? 0),
        expiresAt: w.expiresAt ?? null,
      };
    } catch {
      const local = readLocal();
      return { balanceCents: local.balanceCents, expiresAt: local.expiresAt };
    }
  },

  // Packages to buy
  async packages() {
    const { data } = await http.get('/packages');
    const list = (data?.packages || data?.items || data || []).map(normalizePackage);
    lastPackages = list;
    return list;
  },

  async purchase({ packageId, paymentMethod = 'CASH' }) {
    const pkg =
      lastPackages.find(p => (p.id || p._id) === packageId) ||
      { priceCents: 0, credits: 0, name: 'Package' };

    const price = Number(pkg.priceCents || 0);
    const isCreditTopup = Number(pkg.credits || 0) === 0;

    const localBefore = readLocal();
    if (!isCreditTopup && localBefore.balanceCents < price) {
      const err = new Error('Insufficient balance');
      err.code = 'INSUFFICIENT_FUNDS';
      throw err;
    }

    try {
      await http.post('/purchase', { packageId: String(packageId), paymentMethod });
    } catch (e) {
      const code = e?.status || e?.response?.status;
      if (code && code !== 404) throw e;
    }

    const now = new Date().toISOString();
    const row = {
      id: `local-${Date.now()}`,
      createdAt: now,
      type: isCreditTopup ? 'CREDIT TOP-UP' : 'PASS PURCHASE',
      amountCents: price,
      note: pkg.name,
      packageId,
    };

    const next = {
      balanceCents: isCreditTopup
        ? Number(localBefore.balanceCents || 0) + price
        : Number(localBefore.balanceCents || 0) - price,
      expiresAt: localBefore.expiresAt ?? null,
      history: [row, ...localBefore.history],
    };

    if (next.balanceCents < 0) {
      const err = new Error('Insufficient balance');
      err.code = 'INSUFFICIENT_FUNDS';
      throw err;
    }

    writeLocal(next);
    return { ok: true, wallet: next };
  },

  async history() {
    try {
      const data = await tryEndpoints([{ method: 'GET', url: '/purchase/me' }]);
      const items = data?.purchases || data?.items || data || [];
      if (Array.isArray(items)) return items;
      return [];
    } catch {
      const local = readLocal();
      return local.history;
    }
  },
};
