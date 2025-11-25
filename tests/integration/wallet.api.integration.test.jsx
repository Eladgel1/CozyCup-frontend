let httpMock;
vi.mock('@/lib/http', () => {
  httpMock ||= { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() };
  return { http: httpMock };
});

const tokenStoreMock = {
  getAccessToken: vi.fn(() => null),
  getRefreshToken: vi.fn(() => null),
  refresh: vi.fn(),
  clear: vi.fn(),
};
vi.mock('@/lib/token.store', () => ({ tokenStore: tokenStoreMock }));

describe('walletApi (integration)', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    localStorage.clear();
    // Provide fallback user id via auth to stabilize keys
    localStorage.setItem('auth', JSON.stringify({ user: { id: 'u1' } }));
  });

  it('me() prefers server, falls back to local when server fails', async () => {
    const { walletApi } = await import('@/lib/wallet.api.js');

    // Server success
    httpMock.post.mockResolvedValueOnce({ data: { wallet: { balanceCents: 999, expiresAt: '2025-02-01' } } });
    const fromServer = await walletApi.me();
    expect(fromServer).toEqual({ balanceCents: 999, expiresAt: '2025-02-01' });

    // Server fails -> fallback local
    const err = new Error('boom'); err.response = { status: 404 };
    httpMock.post.mockRejectedValueOnce(err);
    httpMock.get.mockRejectedValueOnce(err);
    localStorage.setItem('cozy.wallet.u1', JSON.stringify({ balanceCents: 321, expiresAt: '2025-03-01' }));
    const fromLocal = await walletApi.me();
    expect(fromLocal).toEqual({ balanceCents: 321, expiresAt: '2025-03-01' });
  });

  it('packages() normalizes and caches', async () => {
    const { walletApi } = await import('@/lib/wallet.api.js');
    httpMock.get.mockResolvedValueOnce({
      data: { packages: [{ _id: 'p1', price: 1500, credits: 5, name: '5 Drinks' }] },
    });

    const list = await walletApi.packages();
    expect(list).toEqual([{ _id: 'p1', id: 'p1', priceCents: 1500, credits: 5, name: '5 Drinks', price: 1500 }]);
  });

  it('purchase() writes local history and adjusts balance; server 404 tolerated', async () => {
    const { walletApi } = await import('@/lib/wallet.api.js');

    httpMock.get.mockResolvedValueOnce({ data: { packages: [{ _id: 'p2', priceCents: 1000, credits: 0, name: 'Top-up $10' }] } });
    await walletApi.packages();

    localStorage.setItem('cozy.wallet.u1', JSON.stringify({ balanceCents: 200, expiresAt: null, history: [] }));

    const notFound = new Error('nf'); notFound.response = { status: 404 };
    httpMock.post.mockRejectedValueOnce(notFound);

    const res = await walletApi.purchase({ packageId: 'p2', paymentMethod: 'CASH' });
    expect(res.ok).toBe(true);

    const parsed = JSON.parse(localStorage.getItem('cozy.wallet.u1'));
    expect(parsed.balanceCents).toBe(1200);
    expect(parsed.history[0]).toMatchObject({ packageId: 'p2', amountCents: 1000, type: 'CREDIT TOP-UP' });
  });

  it('history() reads server, falls back to local', async () => {
    const { walletApi } = await import('@/lib/wallet.api.js');

    httpMock.get.mockResolvedValueOnce({ data: { purchases: [{ id: 'h1' }] } });
    expect(await walletApi.history()).toEqual([{ id: 'h1' }]);

    const err = new Error('down'); err.response = { status: 404 };
    httpMock.get.mockRejectedValueOnce(err);
    localStorage.setItem('cozy.wallet.u1', JSON.stringify({
      balanceCents: 0, expiresAt: null, history: [{ id: 'local1' }],
    }));
    expect(await walletApi.history()).toEqual([{ id: 'local1' }]);
  });

  it('purchase() throws on insufficient funds for drink pass when local balance is lower', async () => {
    const { walletApi } = await import('@/lib/wallet.api.js');

    httpMock.get.mockResolvedValueOnce({ data: { packages: [{ _id: 'p3', credits: 5, priceCents: 2000, name: '5 Drinks' }] } });
    await walletApi.packages();

    localStorage.setItem('cozy.wallet.u1', JSON.stringify({ balanceCents: 1500, expiresAt: null, history: [] }));
    await expect(walletApi.purchase({ packageId: 'p3' }))
      .rejects.toThrow(/Insufficient balance/i);
  });
});
