import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

const qrTokenMock = vi.fn();
const toastSpy = vi.fn();

vi.mock('@/lib/bookings.api', () => ({
  bookingsApi: { qrToken: (...args) => qrTokenMock(...args) },
}));
vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({ show: toastSpy }),
}));

// Clipboard polyfill
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  }
});

import QrDisplay from '@/features/bookings/QrDisplay';

describe('QrDisplay (integration)', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.setSystemTime(new Date('2025-01-01T10:00:00Z'));
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('fetches and displays token when booking provided', async () => {
    qrTokenMock.mockResolvedValueOnce('TOKEN-123');

    render(<QrDisplay booking={{ id: 'b1' }} onClose={vi.fn()} />);
    // Loading state
    expect(screen.getByText(/present this token/i)).toBeInTheDocument();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => expect(qrTokenMock).toHaveBeenCalledWith('b1'));
    expect(screen.getByText('TOKEN-123')).toBeInTheDocument();

    // Copy button enabled when token present
    const copyBtn = screen.getByRole('button', { name: /copy/i });
    expect(copyBtn).toBeEnabled();
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('TOKEN-123');
    await waitFor(() =>
      expect(toastSpy).toHaveBeenCalledWith('Token copied', 'success')
    );
  });

  it('disables copy when token empty and shows toast on fetch fail', async () => {
    qrTokenMock.mockRejectedValueOnce(new Error('nope'));

    render(<QrDisplay booking={{ id: 'b2' }} onClose={vi.fn()} />);
    await waitFor(() => expect(qrTokenMock).toHaveBeenCalled());
    expect(toastSpy).toHaveBeenCalledWith('Failed to fetch QR token', 'error');

    // With empty token → Copy disabled
    expect(screen.getByRole('button', { name: /copy/i })).toBeDisabled();
  });

  it('renders nothing when no booking passed', () => {
    const { container } = render(<QrDisplay booking={null} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
