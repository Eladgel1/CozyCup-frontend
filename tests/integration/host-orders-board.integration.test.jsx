import { render, screen, waitFor, fireEvent } from '@testing-library/react';

const listHostMock = vi.fn();
const updateStatusMock = vi.fn();
const toastSpy = vi.fn();

vi.mock('@/lib/orders.api', () => ({
  ordersApi: {
    listHost: (...a) => listHostMock(...a),
    updateStatus: (...a) => updateStatusMock(...a),
  },
}));
vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({ show: toastSpy }),
}));

import HostOrdersBoard from '@/features/host/OrdersBoard.jsx';

describe('HostOrdersBoard (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function seed(initial = []) {
    listHostMock.mockResolvedValueOnce(initial);
  }

  it('renders columns with orders, and supports Advance/Back (with reload + toast)', async () => {
    seed([
      { id: 'a1', status: 'CONFIRMED', items: [{ name: 'Latte', quantity: 1 }], totalCents: 500, createdAt: '2025-01-01T10:00:00Z' },
      { id: 'a2', status: 'IN_PREP',   items: [{ name: 'Capp', quantity: 2 }],   totalCents: 900, createdAt: '2025-01-01T11:00:00Z' },
    ]);
    
    listHostMock.mockResolvedValueOnce([
      { id: 'a1', status: 'IN_PREP', items: [{ name: 'Latte', quantity: 1 }], totalCents: 500, createdAt: '2025-01-01T10:00:00Z' },
      { id: 'a2', status: 'IN_PREP', items: [{ name: 'Capp', quantity: 2 }],   totalCents: 900, createdAt: '2025-01-01T11:00:00Z' },
    ]);
    updateStatusMock.mockResolvedValue({ ok: true });

    render(<HostOrdersBoard />);

    await waitFor(() => expect(screen.getByText(/Orders board/i)).toBeInTheDocument());
    expect(await screen.findByText(/Confirmed/i)).toBeInTheDocument();
    expect(screen.getByText(/In prep/i)).toBeInTheDocument();

    const advanceBtns = screen.getAllByRole('button', { name: /Advance/i });
    fireEvent.click(advanceBtns[0]);

    await waitFor(() => expect(updateStatusMock).toHaveBeenCalledWith('a1', 'IN_PREP'));
    await waitFor(() => expect(listHostMock).toHaveBeenCalledTimes(2));
    expect(toastSpy).toHaveBeenCalledWith(expect.stringMatching(/Moved to/i), 'success');

    listHostMock.mockResolvedValueOnce([
      { id: 'a1', status: 'IN_PREP' },
      { id: 'a2', status: 'CONFIRMED' },
    ]);
    fireEvent.click(screen.getAllByRole('button', { name: /Back/i })[0]);
    await waitFor(() => expect(updateStatusMock).toHaveBeenCalledWith('a1', 'CONFIRMED'));
  });

  it('shows error state and toast on list failure', async () => {
    listHostMock.mockRejectedValueOnce(new Error('fail'));
    render(<HostOrdersBoard />);
    expect(await screen.findByText(/Failed to load board/i)).toBeInTheDocument();
    expect(toastSpy).toHaveBeenCalledWith('fail', 'error');
  });
});
