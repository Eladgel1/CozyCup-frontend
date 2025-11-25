import axios from 'axios';
import { tokenStore } from './token.store';

const baseURL = import.meta.env.VITE_API_BASE_URL || '';

export const http = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

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

function getFriendlyMessage(status, message) {
  switch (status) {
    case 400:
      return 'Something is wrong with the request. Please try again.';
    case 401:
      return 'Your session expired. Please log in again.';
    case 403:
      return 'You are not allowed to do this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'This slot is fully booked. Please choose another one.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return message || 'Unexpected error. Please try again.';
  }
}

function normalizeError(err) {
  const res = err?.response;
  const status = res?.status ?? null;
  const rawMessage =
    res?.data?.message ||
    res?.data?.error?.message ||
    err.message ||
    'Request failed';
  const friendly = getFriendlyMessage(status, rawMessage);
  const e = new Error(friendly);
  e.status = status;
  e.code = status;
  e.serverMessage = friendly;
  return e;
}

http.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config || {};
    const status = err?.response?.status;
    const path = (original?.url || '').toString();
    const isAuthEndpoint = /\/auth\/(login|register|refresh)\b/.test(path);

    if (status === 401 && !original._retry && !isAuthEndpoint) {
      const hasRt = !!tokenStore.getRefreshToken();
      if (!hasRt) return Promise.reject(normalizeError(err));

      original._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newAccess = await tokenStore.refresh();
          isRefreshing = false;
          onRefreshed(newAccess);
        } catch {
          isRefreshing = false;
          tokenStore.clear();
          return Promise.reject(normalizeError(err));
        }
      }

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

    return Promise.reject(normalizeError(err));
  }
);
