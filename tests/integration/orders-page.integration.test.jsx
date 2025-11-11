import { render, screen, waitFor } from '@testing-library/react';

const mineMock = vi.fn();

vi.mock('@/lib/orders.api', () => ({
  ordersApi: { mine: (...a) => mineMock(...a) },
}));

import OrdersPage from '@/pages/Orders.jsx';

describe('OrdersPage (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows skeleton, then renders orders list with totals', async () => {
    mineMock.mockResolvedValueOnce([
      {
        id: 'o1',
        status: 'CONFIRMED',
        windowStartAt: '2025-01-02T12:00:00Z',
        windowEndAt: '2025-01-02T13:00:00Z',
        totalCents: 1500,
        items: [{ name: 'Latte', quantity: 1 }],
      },
    ]);
    const { container } = render(<OrdersPage />);

    await waitFor(() => {
      expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    });

    expect(await screen.findByText(/My orders/i)).toBeInTheDocument();
    expect(screen.getByText(/\$15\.00/)).toBeInTheDocument();
    expect(screen.getByText(/Latte ×1/)).toBeInTheDocument();
  });

  it('shows empty state', async () => {
    mineMock.mockResolvedValueOnce([]);
    render(<OrdersPage />);
    expect(await screen.findByText(/No orders yet/i)).toBeInTheDocument();
  });

  it('shows error state', async () => {
    mineMock.mockRejectedValueOnce(new Error('x'));
    render(<OrdersPage />);
    expect(await screen.findByText(/Failed to load orders/i)).toBeInTheDocument();
  });
});
