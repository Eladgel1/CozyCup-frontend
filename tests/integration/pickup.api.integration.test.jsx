const httpMock = { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() };
vi.mock('@/lib/http', () => ({ http: httpMock }));

const REAL_DATE = Date;
function mockDate(iso) {
  // eslint-disable-next-line no-global-assign
  Date = class extends REAL_DATE {
    constructor(...args) {
      if (args.length) return new REAL_DATE(...args);
      return new REAL_DATE(iso);
    }
    static now() { return new REAL_DATE(iso).getTime(); }
    static parse(s) { return REAL_DATE.parse(s); }
    static UTC(...args) { return REAL_DATE.UTC(...args); }
  };
}
function restoreDate() {
  // eslint-disable-next-line no-global-assign
  Date = REAL_DATE;
}

describe('pickupApi (integration)', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.resetModules();
    httpMock.get.mockReset();
    mockDate('2025-01-01T08:00:00Z');
  });
  afterEach(() => restoreDate());

  it('list() returns normalized list from primary endpoint', async () => {
    const { pickupApi } = await import('@/lib/pickup.api.js');
    httpMock.get.mockResolvedValueOnce({
      data: [
        { _id: 'w2', start: '2025-01-01T12:00:00Z', end: '2025-01-01T13:00:00Z', capacity: 10, bookedCount: 7 },
        { _id: 'w1', startAt: '2025-01-01T10:00:00Z', endAt: '2025-01-01T11:00:00Z', capacity: 5, remaining: 2 },
      ],
    });

    const res = await pickupApi.list();
    expect(httpMock.get).toHaveBeenCalledWith('/pickup-windows');
    expect(res.map(w => w.id)).toEqual(['w1', 'w2']); // sorted by start
    expect(res[0]).toMatchObject({ id: 'w1', startAt: '2025-01-01T10:00:00Z', endAt: '2025-01-01T11:00:00Z', remaining: 2 });
    expect(res[1]).toMatchObject({ id: 'w2', remaining: 3 });
  });

  it('list() falls back to date endpoints and merges unique windows', async () => {
    const { pickupApi } = await import('@/lib/pickup.api.js');

    httpMock.get.mockRejectedValueOnce(new Error('network'));

    httpMock.get.mockResolvedValueOnce({
      data: { items: [{ id: 'a', from: '2025-01-01T09:00:00Z', to: '2025-01-01T10:00:00Z', capacity: 1, bookedCount: 0 }] },
    });

    httpMock.get.mockResolvedValueOnce({
      data: [
        { _id: 'b', startAt: '2025-01-02T09:00:00Z', endAt: '2025-01-02T10:00:00Z', capacity: 2, remaining: 1 },
        { _id: 'a', startAt: '2025-01-01T09:00:00Z', endAt: '2025-01-01T10:00:00Z', capacity: 1, remaining: 1 },
      ],
    });

    const res = await pickupApi.list();
    expect(res.map(x => x.id)).toEqual(['a', 'b']);
  });
});
