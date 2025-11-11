import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

async function loadPublicOnlyWithAuth(value) {
  vi.doMock('@/features/auth/auth.context', () => ({
    useAuth: () => value,
  }));
  const mod = await import('@/features/auth/PublicOnlyRoute.jsx');
  return mod.default;
}

function Login()   { return <div role="region">Login Page</div>; }
function HomePage(){ return <div role="region">Home</div>; }

describe('PublicOnlyRoute (integration)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('renders children when not authed', async () => {
    const PublicOnlyRoute = await loadPublicOnlyWithAuth({ isAuthed: false, status: 'ready' });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/login page/i)).toBeInTheDocument();
  });

  it('redirects to home when already authed', async () => {
    const PublicOnlyRoute = await loadPublicOnlyWithAuth({ isAuthed: true, status: 'ready' });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/home/i)).toBeInTheDocument();
  });

  it('returns null while loading', async () => {
    const PublicOnlyRoute = await loadPublicOnlyWithAuth({ isAuthed: false, status: 'loading' });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText(/login page/i)).toBeNull();
  });
});
