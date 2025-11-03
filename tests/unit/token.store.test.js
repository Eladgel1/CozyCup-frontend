import { describe, it, expect, beforeEach } from 'vitest';
import { tokenStore } from '@/lib/token.store';

const KEY = 'cozycup_auth';

describe('token.store', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    tokenStore.clear();
    tokenStore.init(); // load existing storage if any
  });

  it('set/get access & refresh tokens (non-persist → sessionStorage)', () => {
    tokenStore.setTokens({ accessToken: 'aaa', refreshToken: 'bbb' }, false);
    expect(tokenStore.getAccessToken()).toBe('aaa');
    expect(tokenStore.getRefreshToken()).toBe('bbb');

    // should be in sessionStorage
    const raw = JSON.parse(sessionStorage.getItem(KEY) || '{}');
    expect(raw.accessToken).toBe('aaa');
    expect(raw.refreshToken).toBe('bbb');
    // and not in localStorage
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('clear() wipes memory + storage', () => {
    tokenStore.setTokens({ accessToken: 'a1', refreshToken: 'r1' }, true);
    tokenStore.clear();
    expect(tokenStore.getAccessToken()).toBeNull();
    expect(tokenStore.getRefreshToken()).toBeNull();
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(sessionStorage.getItem(KEY)).toBeNull();
  });

  it('persist=true stores in localStorage', () => {
    tokenStore.setTokens({ accessToken: 'xxx', refreshToken: 'yyy' }, true);
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    expect(raw.accessToken).toBe('xxx');
    expect(raw.refreshToken).toBe('yyy');
    // and not in session
    expect(sessionStorage.getItem(KEY)).toBeNull();
  });
});
