import { describe, it, expect, beforeEach, vi } from 'vitest';
import { walletApi } from '@/lib/wallet.api';
import { http } from '@/lib/http';

const KEY = 'cozy.wallet.anon';

describe('walletApi (local, per-user scoped)', () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();

    // mock packages GET once per test
    vi.spyOn(http, 'get').mockResolvedValueOnce({
      data: {
        packages: [
          { id: 'pkg-20usd', name: 'Wallet Top-up $20', priceCents: 2000, credits: 0 },
          { id: 'pkg-5drinks', name: 'Pass · 5 Drinks', priceCents: 1500, credits: 5 },
        ],
      },
    });

    // ensure purchase POST doesn’t hit network
    vi.spyOn(http, 'post').mockResolvedValue({ data: { ok: true } });

    // load packages to populate lastPackages
    await walletApi.packages();
  });

  it('initializes with zero balance if no storage', async () => {
    const me = await walletApi.me();
    expect(me.balanceCents).toBe(0);
  });

  it('top-up credit package increases balance', async () => {
    localStorage.setItem(KEY, JSON.stringify({ balanceCents: 0, history: [] }));
    const result = await walletApi.purchase({ packageId: 'pkg-20usd' });
    expect(result.wallet.balanceCents).toBe(2000);

    const data = JSON.parse(localStorage.getItem(KEY));
    expect(data.balanceCents).toBe(2000);
    expect(Array.isArray(data.history)).toBe(true);
    expect(data.history[0].type).toMatch(/CREDIT TOP-UP/);
  });

  it('buying a non-credit pass with insufficient funds rejects', async () => {
    localStorage.setItem(KEY, JSON.stringify({ balanceCents: 0, history: [] }));
    await expect(
      walletApi.purchase({ packageId: 'pkg-5drinks' })
    ).rejects.toThrow(/Insufficient/);

    const data = JSON.parse(localStorage.getItem(KEY));
    expect(data.balanceCents).toBe(0); // no change
  });

  it('records purchase row in history', async () => {
    localStorage.setItem(KEY, JSON.stringify({ balanceCents: 0, history: [] }));
    await walletApi.purchase({ packageId: 'pkg-20usd' });
    const data = JSON.parse(localStorage.getItem(KEY));
    expect(data.history?.[0]).toMatchObject({
      packageId: 'pkg-20usd',
      note: 'Wallet Top-up $20',
    });
  });
});
