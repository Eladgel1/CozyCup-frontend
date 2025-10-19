import axios from 'axios';
import { tokenStore } from './token.store';

const baseURL = import.meta.env.VITE_API_BASE_URL || '';

export const http = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Authorization header from accessToken
http.interceptors.request.use((config) => {
  const at = tokenStore.getAccessToken();
  if (at) config.headers.Authorization = `Bearer ${at}`;
  return config;
});

let isRefreshing = false;
let pending = [];
function onRefreshed(newAccess) {
  pending.forEach((cb) => cb(newAccess));
  pending = [];
}

function normalizeError(err) {
  const status = err?.response?.status ?? null;
  const serverMessage = err?.response?.data?.message || null;
  const e = new Error(serverMessage || err.message || 'Request failed');
  e.status = status;
  e.serverMessage = serverMessage;
  return e;
}

http.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config || {};
    const status = err?.response?.status;
    const path = (original?.url || '').toString();

    // Never try refresh on auth endpoints themselves
    const isAuthEndpoint = /\/auth\/(login|register|refresh)\b/.test(path);

    if (status === 401 && !original._retry && !isAuthEndpoint) {
      // Only attempt refresh if we actually have a refresh token
      const hasRt = !!tokenStore.getRefreshToken();
      if (!hasRt) {
        return Promise.reject(normalizeError(err));
      }

      original._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newAccess = await tokenStore.refresh();
          isRefreshing = false;
          onRefreshed(newAccess);
        } catch (_) {
          isRefreshing = false;
          tokenStore.clear();
          // Refresh failed → reject immediately with normalized error
          return Promise.reject(normalizeError(err));
        }
      }

      // Queue the original request until refresh completes
      return new Promise((resolve, reject) => {
        pending.push((newAccess) => {
          if (!newAccess) return reject(normalizeError(err));
          original.headers = {
            ...(original.headers || {}),
            Authorization: `Bearer ${newAccess}`,
          };
          resolve(http(original));
        });
      });
    }

    // All other errors → reject normalized
    return Promise.reject(normalizeError(err));
  }
);
