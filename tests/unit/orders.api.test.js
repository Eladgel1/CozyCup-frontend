import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ordersApi } from '@/lib/orders.api';
import { http } from '@/lib/http';

describe('orders.api - payload to BE', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('builds correct payload for simple order', async () => {
    const postSpy = vi.spyOn(http, 'post').mockResolvedValue({ data: { ok: true } });

    await ordersApi.create({
      items: [{ id: 'm-espresso', quantity: 2 }],
      pickupWindowId: 'pw-1',
      notes: 'no sugar',
      paymentMethod: 'CASH',
    });

    expect(postSpy).toHaveBeenCalledTimes(1);
    const [url, body] = postSpy.mock.calls[0];
    expect(url).toBe('/orders');
    expect(body.items).toEqual([{ menuItemId: 'm-espresso', quantity: 2 }]);
    expect(body.pickupWindowId).toBe('pw-1');
    expect(body.paymentMethod).toBe('CASH');
    expect(body.notes).toBe('no sugar');
  });

  it('throws on invalid/empty items', async () => {
    vi.spyOn(http, 'post').mockResolvedValue({ data: {} });
    await expect(
      ordersApi.create({ items: [{ bad: 'data' }] })
    ).rejects.toThrow(/Invalid cart items/);
    await expect(
      ordersApi.create({ items: [] })
    ).rejects.toThrow(/Invalid cart items/);
  });

  it('mine() normalizes response keys', async () => {
    vi.spyOn(http, 'get').mockResolvedValue({ data: { orders: [{ id: 'o1' }] } });
    const res = await ordersApi.mine();
    expect(Array.isArray(res)).toBe(true);
    expect(res[0].id).toBe('o1');
  });
});
