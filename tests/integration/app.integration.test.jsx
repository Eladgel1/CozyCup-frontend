import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@/features/auth/auth.context', () => ({
  useAuth: () => ({
    user: { id: 'u1', role: 'host', name: 'Hosty' },
    logout: vi.fn(),
  }),
}));

vi.mock('@/features/menu/cart.context.jsx', () => ({
  useCart: () => ({
    totals: { count: 3 },
  }),
}));

// ToastHost renders dom; keep as-is
import App from '@/App.jsx';

function Dummy() {
  return <div>Page</div>;
}

describe('App (integration)', () => {
  it('shows host links for host user and cart badge count', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<App />}>
            <Route index element={<Dummy />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Host links
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Orders Board')).toBeInTheDocument();
    expect(screen.getByText('Scanner')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();

    // Cart count badge near "Menu"
    expect(screen.getByText('Menu').closest('a')?.textContent).toMatch(/3/);
  });

  it('toggles mobile menu and shows links', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<App />}>
            <Route index element={<Dummy />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const toggle = screen.getByRole('button', { name: /toggle menu/i });
    fireEvent.click(toggle);
    expect(screen.getAllByText('Home')[0]).toBeInTheDocument();
  });
});
