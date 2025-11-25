import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

// Mocks
const mineMock = vi.fn();
const cancelMock = vi.fn();
const qrTokenMock = vi.fn();
const toastSpy = vi.fn();

vi.mock('@/lib/bookings.api', () => ({
  bookingsApi: {
    mine: (...args) => mineMock(...args),
    cancel: (...args) => cancelMock(...args),
    qrToken: (...args) => qrTokenMock(...args),
  },
}));
vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({ show: toastSpy }),
}));

import MyBookings from '@/features/bookings/MyBookings';

describe('MyBookings (integration)', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.setSystemTime(new Date('2025-01-01T10:00:00Z'));
    mineMock.mockReset();
    cancelMock.mockReset();
    qrTokenMock.mockReset();
    toastSpy.mockReset?.();
    vi.clearAllMocks();
  });

  it('shows skeleton, then list of bookings and supports QR + Cancel flows', async () => {
    const rows = [
      {
        id: 'b1',
        status: 'BOOKED',
        slot: { startAt: '2025-01-02T12:00:00Z', endAt: '2025-01-02T13:00:00Z' },
        code: 'ABC123',
        slotId: 's1',
      },
      { id: 'b2', status: 'BOOKED', startAt: '2025-01-03T08:00:00Z' },
    ];

    mineMock.mockResolvedValueOnce(rows);
    qrTokenMock.mockResolvedValueOnce('QR-123');
    cancelMock.mockResolvedValueOnce({ ok: true });
    mineMock.mockResolvedValueOnce([rows[1]]);

    const { container } = render(<MyBookings />);

    await waitFor(() => {
      const pulses = container.querySelectorAll('.animate-pulse');
      expect(pulses.length).toBeGreaterThan(0);
    });

    // Ready with bookings
    expect(await screen.findByText((text) => /Thu/i.test(text) && /Jan/i.test(text))).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /qr/i })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /cancel/i })).toHaveLength(2);

    fireEvent.click(screen.getAllByRole('button', { name: /qr/i })[0]);
    await waitFor(() => expect(qrTokenMock).toHaveBeenCalledWith('b1'));

    fireEvent.click(screen.getAllByRole('button', { name: /cancel/i })[0]);
    await waitFor(() => expect(cancelMock).toHaveBeenCalledWith('b1'));
    await waitFor(() => expect(mineMock).toHaveBeenCalledTimes(2));
    expect(await screen.findByText((text) => /Fri/i.test(text) && /Jan/i.test(text))).toBeInTheDocument();
    expect(toastSpy).toHaveBeenCalledWith('Booking canceled', 'success');
  });

  it('shows "No bookings yet." when API returns empty', async () => {
    mineMock.mockResolvedValueOnce([]);
    render(<MyBookings />);
    expect(await screen.findByText(/no bookings yet/i)).toBeInTheDocument();
  });

  it('shows error state when mine() fails', async () => {
    mineMock.mockRejectedValueOnce(new Error('boom'));
    render(<MyBookings />);
    expect(await screen.findByText(/failed to load your bookings/i)).toBeInTheDocument();
  });
});
