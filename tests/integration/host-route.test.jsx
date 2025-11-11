import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

async function loadHostRouteWithAuth(value) {
  vi.doMock('@/features/auth/auth.context', () => ({
    useAuth: () => value,
  }));
  const mod = await import('@/features/auth/HostRoute.jsx');
  return mod.default;
}

function HostArea() { return <div role="region">Host Area</div>; }
function Login()    { return <div role="region">Login Page</div>; }
function Home()     { return <div role="region">Home</div>; }

describe('HostRoute (integration)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('renders nested content for host user', async () => {
    const HostRoute = await loadHostRouteWithAuth({ user: { role: 'host' }, status: 'ready' });

    render(
      <MemoryRouter initialEntries={['/host/zone']}>
        <Routes>
          <Route element={<HostRoute />}>
            <Route path="/host/zone" element={<HostArea />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/host area/i)).toBeInTheDocument();
  });

  it('redirects non-authed user to /login', async () => {
    const HostRoute = await loadHostRouteWithAuth({ user: null, status: 'ready' });

    render(
      <MemoryRouter initialEntries={['/host/zone']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<HostRoute />}>
            <Route path="/host/zone" element={<HostArea />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/login page/i)).toBeInTheDocument();
  });

  it('redirects non-host user to /', async () => {
    const HostRoute = await loadHostRouteWithAuth({ user: { role: 'customer' }, status: 'ready' });

    render(
      <MemoryRouter initialEntries={['/host/zone']}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route element={<HostRoute />}>
            <Route path="/host/zone" element={<HostArea />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/home/i)).toBeInTheDocument();
  });
});
