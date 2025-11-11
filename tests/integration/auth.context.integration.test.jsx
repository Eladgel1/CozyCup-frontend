import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/features/auth/auth.context';

vi.mock('@/lib/token.store', () => {
  let access = null;
  let refresh = null;
  return {
    tokenStore: {
      init: vi.fn(),
      getAccessToken: () => access,
      getRefreshToken: () => refresh,
      setTokens: ({ accessToken, refreshToken }) => { access = accessToken; refresh = refreshToken; },
      clear: () => { access = null; refresh = null; },
      refresh: vi.fn(async () => {
        access = 'new-access';
        return access;
      }),
    }
  };
});

vi.mock('@/lib/auth.api', () => ({
  authApi: {
    me:       vi.fn(async () => ({ user: { id: 'u1', email: 't@t.com', role: 'customer' } })),
    login:    vi.fn(async () => ({ tokens: { accessToken: 'a1', refreshToken: 'r1' } })),
    register: vi.fn(async () => ({ tokens: { accessToken: 'a2', refreshToken: 'r2' } })),
    logout:   vi.fn(async () => ({})),
    refresh:  vi.fn(async () => ({ tokens: { accessToken: 'a3', refreshToken: 'r3' } })),
  }
}));

function Probe() {
  const { user, status, isAuthed, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="status">{status}</div>
      <div data-testid="user">{user ? user.email : ''}</div>
      <button onClick={() => login('x','y')}>do-login</button>
      <button onClick={() => logout()}>do-logout</button>
      <div data-testid="authed">{String(isAuthed)}</div>
    </div>
  );
}

describe('auth.context (integration)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('boots to ready and can login/logout', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    // Some environments jump to "ready" very fast — don't assert the intermediate snapshot.
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('authed').textContent).toBe('false');

    // login → should set tokens and fetch me()
    screen.getByText('do-login').click();
    await waitFor(() => expect(screen.getByTestId('authed').textContent).toBe('true'));
    expect(screen.getByTestId('user').textContent).toBe('t@t.com');

    // logout
    screen.getByText('do-logout').click();
    await waitFor(() => expect(screen.getByTestId('authed').textContent).toBe('false'));
  });
});
