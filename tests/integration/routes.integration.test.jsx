import React, { Suspense } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { RouterProvider } from 'react-router-dom';

// Mock useCart so App header won't crash when it destructures totals
vi.mock('@/features/menu/cart.context.jsx', () => ({
  useCart: () => ({ totals: { count: 0 } }),
}));

// Mock auth so we are host+authed
vi.mock('@/features/auth/auth.context', () => ({
  useAuth: () => ({ user: { role: 'host' }, isAuthed: true, status: 'ready', logout: vi.fn() }),
}));

// Mock lazy pages to small cheap components
vi.mock('@/pages/Reports.jsx',              () => ({ default: () => <div>Reports Page</div> }));
vi.mock('@/features/host/DashboardPage.jsx',() => ({ default: () => <div>Host Dashboard</div> }));
vi.mock('@/features/host/OrdersBoard.jsx',  () => ({ default: () => <div>Host Orders Board</div> }));
vi.mock('@/features/host/ScannerPage.jsx',  () => ({ default: () => <div>Host Scanner</div> }));

// Also mock regular pages to keep render minimal and predictable
vi.mock('@/pages/Home.jsx',     () => ({ default: () => <div>Home Page</div> }));
vi.mock('@/pages/Menu.jsx',     () => ({ default: () => <div>Menu Page</div> }));
vi.mock('@/pages/Bookings.jsx', () => ({ default: () => <div>Bookings Page</div> }));
vi.mock('@/pages/Orders.jsx',   () => ({ default: () => <div>Orders Page</div> }));
vi.mock('@/pages/Checkin.jsx',  () => ({ default: () => <div>Checkin Page</div> }));
vi.mock('@/pages/Login.jsx',    () => ({ default: () => <div>Login Page</div> }));
vi.mock('@/pages/Register.jsx', () => ({ default: () => <div>Register Page</div> }));
vi.mock('@/pages/Wallet.jsx',   () => ({ default: () => <div>Wallet Page</div> }));
vi.mock('@/pages/History.jsx',  () => ({ default: () => <div>History Page</div> }));
vi.mock('@/pages/NotFound.jsx', () => ({ default: () => <div>NotFound</div> }));

// Import the real router after mocks
import { router } from '@/routes.jsx';

describe('routes (integration)', () => {
  it('navigates to /host/reports and renders lazy Reports page (host allowed)', async () => {
    render(
      <Suspense fallback="...">
        <RouterProvider router={router} />
      </Suspense>
    );

    router.navigate('/host/reports');

    await waitFor(() => {
      expect(screen.getByText(/Reports Page/i)).toBeInTheDocument();
    });
  });

  it('navigates to /host/dashboard and renders the host dashboard', async () => {
    render(
      <Suspense fallback="...">
        <RouterProvider router={router} />
      </Suspense>
    );

    router.navigate('/host/dashboard');

    await waitFor(() => {
      expect(screen.getByText(/Host Dashboard/i)).toBeInTheDocument();
    });
  });
});
