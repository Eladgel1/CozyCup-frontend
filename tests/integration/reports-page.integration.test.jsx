import { render, screen, waitFor, fireEvent } from '@testing-library/react';

const daySummaryMock = vi.fn();

vi.mock('@/lib/orders.api', () => ({
  ordersApi: { daySummary: (...a) => daySummaryMock(...a) },
}));

import ReportsPage from '@/pages/Reports.jsx';

describe('ReportsPage (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading then renders computed KPIs, tables, and footer time', async () => {
    daySummaryMock.mockResolvedValueOnce({
      totalCents: 12345,
      completed: 4,
      purchases: [{}, {}, {}],
      bookings: { upcoming: 2 },
      visitors: 5,
      avgOrderValueCents: 4115,
      byStatus: { READY: 2, PICKED_UP: 1 },
      topItems: [{ id: 'm1', name: 'Latte', qty: 7, totalCents: 3500 }],
      generatedAt: '2025-01-01T12:00:00Z',
    });

    const { container } = render(<ReportsPage />);

    await waitFor(() => {
      expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    });

    expect(await screen.findByText(/Day Summary/i)).toBeInTheDocument();
    expect(screen.getByText(/\$123\.45/i)).toBeInTheDocument();
    expect(screen.getByText(/Avg: \$41\.15/i)).toBeInTheDocument();
    expect(screen.getByText(/Orders/i)).toBeInTheDocument();
    expect(screen.getByText(/Bookings/i)).toBeInTheDocument();
    expect(screen.getByText(/Visitors/i)).toBeInTheDocument();

    expect(screen.getByText(/By status/i)).toBeInTheDocument();
    expect(screen.getByText(/READY/i)).toBeInTheDocument();
    expect(screen.getByText('2', { selector: 'td' })).toBeInTheDocument();

    expect(screen.getByText(/Top items/i)).toBeInTheDocument();
    expect(screen.getByText(/Latte/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Refresh/i }));
  });

  it('shows error card on failure', async () => {
    daySummaryMock.mockRejectedValueOnce(new Error('boom'));
    render(<ReportsPage />);
    expect(await screen.findByText(/Failed to load report/i)).toBeInTheDocument();
  });
});
