import React from 'react';

let httpMock;
vi.mock('@/lib/http', () => {
  httpMock ||= { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() };
  return { http: httpMock };
});

describe('ordersApi (integration)', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('create() normalizes items and posts body', async () => {
    const { ordersApi } = await import('@/lib/orders.api.js');

    httpMock.post.mockResolvedValueOnce({ data: { ok: true, id: 'o1' } });

    const result = await ordersApi.create({
      items: [
        { id: 'm1', qty: 2 },
        { itemId: 'm2', quantity: 1 },
        { menuItemId: 'm3', qty: 3 },
      ],
      pickupWindowId: 'w1',
      notes: 'no sugar',
      paymentMethod: 'CARD',
    });

    expect(httpMock.post).toHaveBeenCalledTimes(1);
    const [path, body] = httpMock.post.mock.calls[0];
    expect(path).toBe('/orders');
    expect(body).toEqual({
      items: [
        { menuItemId: 'm1', quantity: 2 },
        { menuItemId: 'm2', quantity: 1 },
        { menuItemId: 'm3', quantity: 3 },
      ],
      pickupWindowId: 'w1',
      paymentMethod: 'CARD',
      notes: 'no sugar',
    });
    expect(result).toEqual({ ok: true, id: 'o1' });
  });

  it('create() throws on invalid items', async () => {
    const { ordersApi } = await import('@/lib/orders.api.js');
    await expect(ordersApi.create({ items: [] })).rejects.toThrow(/Invalid cart items/i);
    await expect(ordersApi.create({ items: [{ qty: 2 }] })).rejects.toThrow(/Invalid cart items/i);
  });

  it('mine() unwraps orders from different shapes', async () => {
    const { ordersApi } = await import('@/lib/orders.api.js');

    httpMock.get.mockResolvedValueOnce({ data: { orders: [{ id: 'a' }] } });
    expect(await ordersApi.mine()).toEqual([{ id: 'a' }]);

    httpMock.get.mockResolvedValueOnce({ data: { items: [{ id: 'b' }] } });
    expect(await ordersApi.mine()).toEqual([{ id: 'b' }]);

    httpMock.get.mockResolvedValueOnce({ data: [{ id: 'c' }] });
    expect(await ordersApi.mine()).toEqual([{ id: 'c' }]);
  });

  it('host listHost() tolerates 404 and returns []', async () => {
    const { ordersApi } = await import('@/lib/orders.api.js');
    const err = new Error('not found'); err.response = { status: 404 };
    httpMock.get.mockRejectedValueOnce(err);
    expect(await ordersApi.listHost()).toEqual([]);
  });

  it('statusOf() and updateStatus() call correct endpoints', async () => {
    const { ordersApi } = await import('@/lib/orders.api.js');
    httpMock.get.mockResolvedValueOnce({ data: { status: 'READY' } });
    httpMock.patch.mockResolvedValueOnce({ data: { ok: true } });

    expect(await ordersApi.statusOf('o1')).toBe('READY');
    expect(httpMock.get).toHaveBeenCalledWith('/orders/o1/status');

    await ordersApi.updateStatus('o1', 'PICKED_UP');
    expect(httpMock.patch).toHaveBeenCalledWith('/orders/o1/status', { status: 'PICKED_UP' });
  });

  it('daySummary() tolerates 404 and returns {}', async () => {
    const { ordersApi } = await import('@/lib/orders.api.js');
    const err = new Error('not found'); err.response = { status: 404 };
    httpMock.get.mockRejectedValueOnce(err);
    expect(await ordersApi.daySummary()).toEqual({});
  });
});
