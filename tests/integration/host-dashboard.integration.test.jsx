import { render, screen, waitFor } from '@testing-library/react';

const listHostMock = vi.fn();
const daySummaryMock = vi.fn();
const toastSpy = vi.fn();

vi.mock('@/lib/orders.api', () => ({
  ordersApi: {
    listHost: (...a) => listHostMock(...a),
    daySummary: (...a) => daySummaryMock(...a),
  },
}));
vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({ show: toastSpy }),
}));

import HostDashboardPage from '@/features/host/DashboardPage.jsx';

describe('HostDashboardPage (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows skeleton then KPIs computed from orders + summary', async () => {
    listHostMock.mockResolvedValueOnce([
      { id: 'o1', status: 'CONFIRMED', totalCents: 500, customerId: 'u1' },
      { id: 'o2', status: 'IN_PREP',   totalCents: 800, customerId: 'u2' },
      { id: 'o3', status: 'PICKED_UP', subtotalCents: 1000, customerId: 'u1' },
    ]);
    daySummaryMock.mockResolvedValueOnce({
      bookings: [{ status: 'BOOKED' }, { status: 'CANCELLED' }],
      visitors: 3,
      revenueCents: 2300,
    });

    const { container } = render(<HostDashboardPage />);

    // Loading skeletons present
    await waitFor(() => {
      expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    });

    // KPIs show up
    expect(await screen.findByText(/Active orders/i)).toBeInTheDocument();
    expect(screen.getByText('2', { selector: 'div' })).toBeInTheDocument();
    expect(screen.getByText('1', { selector: 'div' })).toBeInTheDocument();
    expect(screen.getByText('$23.00')).toBeInTheDocument();
    expect(screen.getByText('3', { selector: 'div' })).toBeInTheDocument();
  });

  it('shows error state and toasts on failure', async () => {
    listHostMock.mockRejectedValueOnce(new Error('boom'));
    daySummaryMock.mockResolvedValueOnce({});

    render(<HostDashboardPage />);
    expect(await screen.findByText(/Failed to load dashboard/i)).toBeInTheDocument();
    expect(toastSpy).toHaveBeenCalledWith('boom', 'error');
  });
});
