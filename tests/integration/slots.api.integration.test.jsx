const httpMock = { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() };
vi.mock('@/lib/http', () => ({ http: httpMock }));

describe('slotsApi (integration)', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.resetModules();
    vi.setSystemTime(new Date('2025-01-01T10:00:00Z'));
    httpMock.get.mockReset();
    httpMock.post.mockReset();
  });

  it('list() returns all when date is falsy', async () => {
    const { slotsApi } = await import('@/lib/slots.api.js');
    httpMock.get.mockResolvedValueOnce({ data: { slots: [{ id: 's1' }, { id: 's2' }] } });
    const res = await slotsApi.list();
    expect(httpMock.get).toHaveBeenCalledWith('/slots');
    expect(res).toEqual([{ id: 's1' }, { id: 's2' }]);
  });

  it('list() filters by local YMD of start time', async () => {
    const { slotsApi } = await import('@/lib/slots.api.js');

    const payload = {
      data: [
        { id: 'a', startAt: '2025-01-01T08:00:00Z' },
        { id: 'b', startAt: '2025-01-02T08:00:00Z' },
      ],
    };

    httpMock.get
      .mockResolvedValueOnce(payload)
      .mockResolvedValueOnce(payload);

    const day1 = await slotsApi.list('2025-01-01');
    expect(day1.map((s) => s.id)).toEqual(['a']);

    const day2 = await slotsApi.list('2025-01-02');
    expect(day2.map((s) => s.id)).toEqual(['b']);
  });

  it('create() posts numeric capacity', async () => {
    const { slotsApi } = await import('@/lib/slots.api.js');
    httpMock.post.mockResolvedValueOnce({ data: { ok: true } });

    const res = await slotsApi.create({ startAt: 'iso1', endAt: 'iso2', capacity: '8' });
    expect(httpMock.post).toHaveBeenCalledWith('/slots', { startAt: 'iso1', endAt: 'iso2', capacity: 8 });
    expect(res).toEqual({ ok: true });
  });
});
