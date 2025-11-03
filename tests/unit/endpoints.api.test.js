import { describe, it, expect } from 'vitest';
import { EP } from '@/lib/endpoints';

describe('endpoints (EP)', () => {
  it('exposes top-level menu path as string', () => {
    expect(typeof EP.menu.list).toBe('string');
    expect(EP.menu.list.startsWith('/')).toBe(true);
  });

  it('builds orders.updateStatus(id) correctly', () => {
    expect(EP.orders.updateStatus('123')).toBe('/orders/123/status');
  });

  it('builds bookings cancel/qrToken correctly', () => {
    expect(EP.bookings.cancel('b1')).toBe('/bookings/b1/cancel');
    expect(EP.bookings.qrToken('b2')).toBe('/bookings/b2/qr-token');
  });

  it('builds checkin.byToken correctly', () => {
    expect(EP.checkin.byToken('tkn')).toBe('/checkin/tkn');
  });

  it('wallet/purchase routes exist as strings', () => {
    expect(typeof EP.purchase.create).toBe('string');
    expect(typeof EP.purchase.walletMe).toBe('string');
    expect(EP.purchase.create).toBe('/purchase');
    expect(EP.purchase.walletMe).toBe('/purchase/me/wallet');
  });
});
