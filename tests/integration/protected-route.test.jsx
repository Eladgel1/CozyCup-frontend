import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

async function loadProtectedWithAuth(value) {
  vi.doMock('@/features/auth/auth.context', () => ({
    useAuth: () => value,
  }));
  const mod = await import('@/features/auth/ProtectedRoute.jsx');
  return mod.default;
}

function ProtectedContent() {
  return <div role="region">OK</div>;
}
function Login() {
  return <div role="region">Login Page</div>;
}

describe('ProtectedRoute (integration)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('renders a loading state while auth not ready', async () => {
    const ProtectedRoute = await loadProtectedWithAuth({ isAuthed: false, status: 'loading' });

    render(
      <MemoryRouter initialEntries={['/secret']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/secret" element={<ProtectedContent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/loading…/i)).toBeInTheDocument();
  });

  it('redirects to /login when not authed', async () => {
    const ProtectedRoute = await loadProtectedWithAuth({ isAuthed: false, status: 'ready' });

    render(
      <MemoryRouter initialEntries={['/secret']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/secret" element={<ProtectedContent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Don't use name for "region" (no accessible name). Assert by text.
    expect(await screen.findByText(/login page/i)).toBeInTheDocument();
  });

  it('renders children when authed', async () => {
    const ProtectedRoute = await loadProtectedWithAuth({ isAuthed: true, status: 'ready' });

    render(
      <MemoryRouter initialEntries={['/secret']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/secret" element={<ProtectedContent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/ok/i)).toBeInTheDocument();
  });
});
