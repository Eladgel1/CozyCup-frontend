import React from 'react';

const refreshedToken = 'newAT';

const tokenStoreMock = {
  getAccessToken: vi.fn(() => 'AT'),
  getRefreshToken: vi.fn(() => 'RT'),
  refresh: vi.fn(async () => refreshedToken),
  clear: vi.fn(),
};
vi.mock('@/lib/token.store', () => ({ tokenStore: tokenStoreMock }));

let reqInterceptor;
let resInterceptor;
let createdInstance;

const axiosCreateMock = vi.fn(() => {
  const fn = (cfg) => fn.request(cfg);
  fn.request = vi.fn();
  fn.interceptors = {
    request: { use: (h) => { reqInterceptor = h; } },
    response: { use: (ok, err) => { resInterceptor = err; } },
  };
  createdInstance = fn;
  return fn;
});

vi.mock('axios', () => ({
  default: { create: axiosCreateMock },
}));

describe('http (integration)', () => {
  beforeEach(async () => {
    vi.useRealTimers();
    vi.resetModules();
    vi.clearAllMocks();
    createdInstance = undefined;
    await import('@/lib/http.js');
  });

  it('request interceptor adds Authorization when access token exists', async () => {
    const config = await reqInterceptor({ headers: {} });
    expect(config.headers.Authorization).toBe('Bearer AT');
  });

  it('response interceptor maps error to friendly message', async () => {
    const err = {
      response: { status: 404, data: { message: 'not found' } },
      config: { url: '/x' },
    };
    await expect(resInterceptor(err)).rejects.toMatchObject({
      message: expect.stringMatching(/not found|requested resource/i),
      status: 404,
      code: 404,
    });
  });

  it('response interceptor performs refresh on 401 and (queues) retry of original request', async () => {
    expect(createdInstance).toBeDefined();

    const originalConfig = { url: '/orders', headers: {} };
    const err = { response: { status: 401 }, config: originalConfig };

    createdInstance.request.mockResolvedValueOnce({ data: { ok: true } });

    const promise = resInterceptor(err);

    expect(tokenStoreMock.refresh).toHaveBeenCalledTimes(1);
    expect(promise).toBeInstanceOf(Promise);
  });

  it('response interceptor clears tokens when refresh fails', async () => {
    tokenStoreMock.refresh.mockRejectedValueOnce(new Error('nope'));
    const err = { response: { status: 401 }, config: { url: '/orders' } };
    await expect(resInterceptor(err)).rejects.toMatchObject({
      message: expect.stringMatching(/session expired|log in/i),
      status: 401,
    });
    expect(tokenStoreMock.clear).toHaveBeenCalled();
  });
});
