const httpMock = { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() };
vi.mock('@/lib/http', () => ({ http: httpMock }));

describe('menuApi (integration)', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.resetModules();
    httpMock.get.mockReset();
    httpMock.post.mockReset();
    httpMock.patch.mockReset();
    httpMock.delete.mockReset();
  });

  it('list() returns array directly when server returns array', async () => {
    const { menuApi } = await import('@/lib/menu.api.js');
    httpMock.get.mockResolvedValueOnce({ data: [{ id: 'm1' }, { id: 'm2' }] });

    const res = await menuApi.list();
    expect(httpMock.get).toHaveBeenCalledWith('/menu');
    expect(res).toEqual([{ id: 'm1' }, { id: 'm2' }]);
  });

  it('list() unwraps {items: [...]}', async () => {
    const { menuApi } = await import('@/lib/menu.api.js');
    httpMock.get.mockResolvedValueOnce({ data: { items: [{ id: 'a' }] } });

    const res = await menuApi.list();
    expect(httpMock.get).toHaveBeenCalledWith('/menu');
    expect(res).toEqual([{ id: 'a' }]);
  });
});
