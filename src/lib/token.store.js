import { authApi } from './auth.api';

const KEY = 'cozycup_auth'; // storage key

const memory = {
  accessToken: null,
  refreshToken: null,
};

function loadFromStorage() {
  try {
    const raw = sessionStorage.getItem(KEY) || localStorage.getItem(KEY);
    if (!raw) return;
    const obj = JSON.parse(raw);
    memory.accessToken = obj.accessToken || null;
    memory.refreshToken = obj.refreshToken || null;
  } catch (_) {}
}

function saveToStorage(persist = false) {
  const raw = JSON.stringify({
    accessToken: memory.accessToken,
    refreshToken: memory.refreshToken,
  });
  if (persist) {
    localStorage.setItem(KEY, raw);
  } else {
    sessionStorage.setItem(KEY, raw);
  }
}

export const tokenStore = {
  init() {
    loadFromStorage();
  },
  setTokens({ accessToken, refreshToken }, persist = false) {
    memory.accessToken = accessToken || null;
    memory.refreshToken = refreshToken || null;
    saveToStorage(persist);
  },
  getAccessToken() {
    return memory.accessToken;
  },
  getRefreshToken() {
    return memory.refreshToken;
  },
  async refresh() {
    const rt = memory.refreshToken;
    if (!rt) throw new Error('Missing refresh token');
    const { tokens } = await authApi.refresh({ refreshToken: rt });
    memory.accessToken = tokens.accessToken || null;
    memory.refreshToken = tokens.refreshToken || rt; // rotate if provided
    saveToStorage(!!localStorage.getItem(KEY));
    return memory.accessToken;
  },
  clear() {
    memory.accessToken = null;
    memory.refreshToken = null;
    sessionStorage.removeItem(KEY);
    localStorage.removeItem(KEY);
  },
};
