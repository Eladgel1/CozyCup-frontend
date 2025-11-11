import { bookingsApi } from '@/lib/bookings.api';

const httpMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));

vi.mock('@/lib/http', () => ({ http: httpMock }));

describe('bookings.api (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('create() tries {slotId} then falls back to {slot}', async () => {
    httpMock.post
      .mockRejectedValueOnce(new Error('shape1'))
      .mockResolvedValueOnce({ data: { ok: true, used: 'slot' } });

    const res = await bookingsApi.create({ slotId: 'S1' });
    expect(res).toEqual({ ok: true, used: 'slot' });

    expect(httpMock.post.mock.calls[0][0]).toBe('/bookings');
    expect(httpMock.post.mock.calls[0][1]).toEqual({ slotId: 'S1' });
    expect(httpMock.post.mock.calls[1][1]).toEqual({ slot: 'S1' });
  });

  it('mine() extracts arrays from many shapes', async () => {
    httpMock.get.mockResolvedValueOnce({ data: [{ id: 1 }, { id: 2 }] });
    expect(await bookingsApi.mine()).toHaveLength(2);

    httpMock.get.mockResolvedValueOnce({ data: { bookings: [{}, {}, {}] } });
    expect(await bookingsApi.mine()).toHaveLength(3);

    httpMock.get.mockResolvedValueOnce({ data: { data: { items: [1] } } });
    expect(await bookingsApi.mine()).toHaveLength(1);
  });

  it('cancel() and qrToken()', async () => {
    httpMock.patch.mockResolvedValueOnce({ data: { ok: true } });
    expect(await bookingsApi.cancel('B1')).toEqual({ ok: true });
    expect(httpMock.patch).toHaveBeenCalledWith('/bookings/B1/cancel');

    httpMock.post.mockResolvedValueOnce({ data: { token: 'T1' } });
    expect(await bookingsApi.qrToken('B1')).toBe('T1');

    httpMock.post.mockResolvedValueOnce({ data: { qrToken: 'T2' } });
    expect(await bookingsApi.qrToken('B2')).toBe('T2');
  });
});
