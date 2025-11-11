import { api } from '@/lib/api';

describe('api (fetch wrapper) (integration)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('sends request with headers & credentials, returns parsed json', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, hello: 'world' }),
      text: async () => '',
    });

    const res = await api('/hello', { method: 'POST', body: JSON.stringify({ a: 1 }) });
    expect(res).toEqual({ ok: true, hello: 'world' });
    expect(fetchSpy).toHaveBeenCalledWith(expect.stringMatching(/\/hello$/), expect.objectContaining({
      credentials: 'include',
      headers: expect.objectContaining({ 'Content-Type': 'application/json' })
    }));
  });

  it('throws with status and body text when not ok', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 418,
      statusText: 'I\'m a teapot',
      json: async () => { throw new Error('bad json'); },
      text: async () => 'teapot says no',
    });

    await expect(api('/fail')).rejects.toThrow(/API 418: teapot says no/i);
  });
});
