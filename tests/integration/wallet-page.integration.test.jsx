import { render, screen, fireEvent } from '@testing-library/react';

const meMock = vi.fn();
const historyMock = vi.fn();
const packagesMock = vi.fn();
const toastSpy = vi.fn();

vi.mock('@/lib/wallet.api', () => ({
  walletApi: {
    me: (...a) => meMock(...a),
    history: (...a) => historyMock(...a),
    packages: (...a) => packagesMock(...a),
  }
}));
vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({ show: toastSpy }),
}));

describe('WalletPage (integration)', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('shows loading, then renders balance, history and opens Purchase modal', async () => {
    meMock.mockResolvedValueOnce({ balanceCents: 1234, expiresAt: '2025-02-02T00:00:00Z' });
    historyMock.mockResolvedValueOnce([
      { id: 'h2', type: 'CREDIT TOP-UP', amountCents: 500, createdAt: '2025-01-02T10:00:00Z', note: 'Top up' },
      { id: 'h1', type: 'PASS PURCHASE', amountCents: 999, createdAt: '2025-01-01T10:00:00Z', note: 'Gold Pass' },
    ]);

    packagesMock.mockResolvedValueOnce([
      { id: 'p1', name: 'Gold', priceCents: 2500, credits: 10 },
    ]);

    packagesMock.mockResolvedValueOnce([
      { id: 'p1', name: 'Gold', priceCents: 2500, credits: 10 }
    ]);

    const { default: WalletPage } = await import('@/features/wallet/WalletPage.jsx');
    render(<WalletPage />);

    expect(await screen.findByText(/manage passes/i)).toBeInTheDocument();

    expect(await screen.findByText('$12.34')).toBeInTheDocument();
    expect(screen.getByText(/Pass expiry/i)).toBeInTheDocument();

    expect(screen.getByText(/Recent activity/i)).toBeInTheDocument();
    expect(screen.getByText(/CREDIT TOP-UP/)).toBeInTheDocument();
    expect(screen.getByText(/\$9\.99/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /purchase/i }));
    expect(await screen.findByText(/Purchase pass/i)).toBeInTheDocument();
  });

  it('shows empty history and still allows opening Purchase', async () => {
    meMock.mockResolvedValueOnce({ balanceCents: 0, expiresAt: null });
    historyMock.mockResolvedValueOnce([]);
    packagesMock.mockResolvedValueOnce([]);
    packagesMock.mockResolvedValueOnce([]);

    const { default: WalletPage } = await import('@/features/wallet/WalletPage.jsx');
    render(<WalletPage />);

    expect(await screen.findByText(/No activity yet/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Purchase/i }));
    expect(await screen.findByText(/No packages available/i)).toBeInTheDocument();
  });

  it('shows error state and toast when load fails', async () => {
    meMock.mockRejectedValueOnce(new Error('boom'));
    historyMock.mockResolvedValueOnce([]);
    packagesMock.mockResolvedValueOnce([]);

    const { default: WalletPage } = await import('@/features/wallet/WalletPage.jsx');
    render(<WalletPage />);

    expect(await screen.findByText(/Failed to load wallet/i)).toBeInTheDocument();
    expect(toastSpy).toHaveBeenCalledWith(expect.stringMatching(/boom|Failed to load wallet/i), 'error');
  });
});
