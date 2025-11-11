import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const ordersMineMock = vi.fn();
const bookingsMineMock = vi.fn();
const toastSpy = vi.fn();

vi.mock('@/lib/orders.api', () => ({
  ordersApi: { mine: (...a) => ordersMineMock(...a) },
}));
vi.mock('@/lib/bookings.api', () => ({
  bookingsApi: { mine: (...a) => bookingsMineMock(...a) },
}));
vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({ show: toastSpy }),
}));

import HistoryPage from '@/pages/History.jsx';

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('HistoryPage (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads both orders and bookings, shows orders by default, and bookings on tab click', async () => {
    ordersMineMock.mockResolvedValueOnce([
      { id: 'o1', status: 'PICKED_UP', totalCents: 1200, createdAt: '2025-01-02T10:00:00Z' },
      { id: 'o2', status: 'READY',      totalCents: 800,  createdAt: '2025-01-01T10:00:00Z' },
    ]);
    bookingsMineMock.mockResolvedValueOnce([
      { id: 'b1', status: 'BOOKED', slotStartAt: '2025-01-05T09:00:00Z' },
    ]);

    const { container } = renderWithRouter(<HistoryPage />);
    await waitFor(() => {
      expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    });

    expect(await screen.findByText(/My orders/i)).toBeInTheDocument();
    expect(screen.getByText(/\$12\.00/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Bookings/i }));
    expect(await screen.findByText(/My bookings/i)).toBeInTheDocument();
    expect(screen.getByText(/BOOKED/i)).toBeInTheDocument();
  });

  it('shows empty states for both tabs', async () => {
    ordersMineMock.mockResolvedValueOnce([]);
    bookingsMineMock.mockResolvedValueOnce([]);

    renderWithRouter(<HistoryPage />);

    expect(await screen.findByText(/No orders yet/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Bookings/i }));
    expect(await screen.findByText(/No bookings yet/i)).toBeInTheDocument();
  });

  it('shows generic error state if outer effect fails (rare path)', async () => {
    ordersMineMock.mockImplementationOnce(() => { throw new Error('boom'); });
    bookingsMineMock.mockImplementationOnce(() => { throw new Error('boom'); });

    renderWithRouter(<HistoryPage />);
    expect(await screen.findByText(/Failed to load history/i)).toBeInTheDocument();
    expect(toastSpy).toHaveBeenCalled();
  });
});
