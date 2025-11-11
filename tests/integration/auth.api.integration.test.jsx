import { authApi } from '@/lib/auth.api';

const httpMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('@/lib/http', () => ({ http: httpMock }));

describe('auth.api (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('register/login/refresh/logout', async () => {
    httpMock.post.mockResolvedValueOnce({ data: { u: 1 } });
    expect(await authApi.register({ a: 1 })).toEqual({ u: 1 });
    expect(httpMock.post).toHaveBeenCalledWith('/auth/register', { a: 1 });

    httpMock.post.mockResolvedValueOnce({ data: { token: 't' } });
    expect(await authApi.login({ email: 'e' })).toEqual({ token: 't' });
    expect(httpMock.post).toHaveBeenCalledWith('/auth/login', { email: 'e' });

    httpMock.post.mockResolvedValueOnce({ data: { token: 't2' } });
    expect(await authApi.refresh({ r: 1 })).toEqual({ token: 't2' });
    expect(httpMock.post).toHaveBeenCalledWith('/auth/refresh', { r: 1 });

    httpMock.post.mockResolvedValueOnce({ data: { ok: true } });
    expect(await authApi.logout()).toEqual({ ok: true });
    expect(httpMock.post).toHaveBeenCalledWith('/auth/logout');
  });

  it('me/updateMe/deleteMe', async () => {
    httpMock.get.mockResolvedValueOnce({ data: { id: 'me' } });
    expect(await authApi.me()).toEqual({ id: 'me' });
    expect(httpMock.get).toHaveBeenCalledWith('/auth/me');

    httpMock.patch.mockResolvedValueOnce({ data: { ok: 1 } });
    expect(await authApi.updateMe({ name: 'N' })).toEqual({ ok: 1 });
    expect(httpMock.patch).toHaveBeenCalledWith('/auth/me', { name: 'N' });

    httpMock.delete.mockResolvedValueOnce({ data: { ok: true } });
    expect(await authApi.deleteMe()).toEqual({ ok: true });
    expect(httpMock.delete).toHaveBeenCalledWith('/auth/me');
  });
});
