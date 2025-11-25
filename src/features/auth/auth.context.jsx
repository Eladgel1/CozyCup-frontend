import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '@/lib/auth.api';
import { tokenStore } from '@/lib/token.store';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    tokenStore.init(); // load tokens from storage
    let mounted = true;
    (async () => {
      setStatus('loading');
      try {
        if (tokenStore.getAccessToken()) {
          const data = await authApi.me();
          if (mounted) setUser(data.user || null);
        } else {
          if (mounted) setUser(null);
        }
        if (mounted) setStatus('ready');
      } catch {
        if (mounted) {
          tokenStore.clear();
          setUser(null);
          setStatus('ready');
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email, password, opts = { remember: false }) => {
    const data = await authApi.login({ email, password });
    tokenStore.setTokens(data.tokens || {}, !!opts.remember);
    const me = await authApi.me();
    setUser(me.user || null);
  };

  const register = async (payload, opts = { remember: false }) => {
    const data = await authApi.register(payload);
    tokenStore.setTokens(data.tokens || {}, !!opts.remember);
    const me = await authApi.me();
    setUser(me.user || null);
  };

  const logout = async () => {
    try { await authApi.logout(); } catch(e) { console.log(e); }
    tokenStore.clear();
    setUser(null);
  };

  const value = { user, status, isAuthed: !!user, login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};
