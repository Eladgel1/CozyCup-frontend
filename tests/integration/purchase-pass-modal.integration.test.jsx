import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const packagesMock = vi.fn();
const purchaseMock = vi.fn();
const toastSpy = vi.fn();

vi.mock('@/lib/wallet.api', () => ({
  walletApi: {
    packages: (...a) => packagesMock(...a),
    purchase: (...a) => purchaseMock(...a),
  }
}));
vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({ show: toastSpy }),
}));

describe('PurchasePassModal (integration)', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('loads packages on open, selects default, confirms purchase and calls onPurchased', async () => {
    packagesMock.mockResolvedValueOnce([
      { id: 'p1', name: 'Bronze', priceCents: 1000, credits: 4 },
      { id: 'p2', name: 'Silver', priceCents: 2000, credits: 9 },
    ]);
    purchaseMock.mockResolvedValueOnce({ ok: true });

    const onClose = vi.fn();
    const onPurchased = vi.fn();
    const { default: Modal } = await import('@/features/wallet/PurchasePassModal.jsx');

    render(<Modal open={true} onClose={onClose} onPurchased={onPurchased} />);
    expect(await screen.findByText(/Purchase pass/i)).toBeInTheDocument();

    expect(await screen.findByLabelText(/Bronze/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Silver/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));
    await waitFor(() => expect(purchaseMock).toHaveBeenCalledWith(
      expect.objectContaining({ packageId: 'p1', paymentMethod: 'CASH' })
    ));
    expect(toastSpy).toHaveBeenCalledWith('Purchase completed successfully', 'success');
    expect(onPurchased).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('shows empty state when no packages, and closes with ESC', async () => {
    packagesMock.mockResolvedValueOnce([]);
    const onClose = vi.fn();
    const { default: Modal } = await import('@/features/wallet/PurchasePassModal.jsx');

    render(<Modal open={true} onClose={onClose} onPurchased={vi.fn()} />);
    expect(await screen.findByText(/No packages available/i)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('shows error toast if packages fetch fails; with empty list purchase remains disabled', async () => {
    packagesMock.mockRejectedValueOnce(new Error('fetch fail'));
    const { default: Modal } = await import('@/features/wallet/PurchasePassModal.jsx');
    render(<Modal open={true} onClose={() => {}} onPurchased={() => {}} />);
    await waitFor(() =>
      expect(toastSpy).toHaveBeenCalledWith(expect.stringMatching(/fetch fail|Failed to load packages/i), 'error')
    );
  
    const { cleanup } = await import('@testing-library/react');
    cleanup();
    packagesMock.mockResolvedValueOnce([]);
    render(<Modal open={true} onClose={() => {}} onPurchased={() => {}} />);
    expect(await screen.findByText(/No packages available/i)).toBeInTheDocument();
    const purchaseBtn = screen.getByRole('button', { name: /Purchase/i });
    expect(purchaseBtn).toBeDisabled();
  });
});
