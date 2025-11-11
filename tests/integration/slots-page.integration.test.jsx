import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

// Mocks for APIs, toast, and auth
const listMock = vi.fn();
const createBookingMock = vi.fn();
const toastSpy = vi.fn();

vi.mock('@/lib/slots.api', () => ({
  slotsApi: { list: (...args) => listMock(...args) },
}));
vi.mock('@/lib/bookings.api', () => ({
  bookingsApi: { create: (...args) => createBookingMock(...args) },
}));
vi.mock('@/features/auth/auth.context', () => ({
  useAuth: () => ({ user: { role: 'customer' } }),
}));
vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({ show: toastSpy }),
}));
vi.mock('@/lib/events', () => {
  const listeners = new Map();
  return {
    on: (event, fn) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(fn);
      return () => listeners.get(event)?.delete(fn);
    },
    emit: (event, payload) => listeners.get(event)?.forEach((fn) => fn(payload)),
  };
});

import SlotsPage from '@/features/bookings/SlotsPage';
import { expect } from 'vitest';

describe('SlotsPage (integration)', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.setSystemTime(new Date('2025-01-01T10:00:00Z'));
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('shows skeleton while loading, then renders cards (ready)', async () => {
    listMock.mockResolvedValueOnce([
      { id: 's1', startAt: '2025-01-02T12:00:00Z', endAt: '2025-01-02T13:00:00Z', capacity: 5, bookedCount: 2 },
      { id: 's2', startAt: '2025-01-02T14:00:00Z', endAt: '2025-01-02T15:00:00Z', capacity: 3, bookedCount: 3 },
    ]);

    render(<SlotsPage />);

    expect(await screen.findAllByRole('generic', { name: '' })).toBeTruthy();

    const seatLabels = await screen.findAllByText(/seats available/i);
    expect(seatLabels.length).toBeGreaterThan(0);

    expect(screen.getAllByText(/seats available/i)).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /book|full/i })).toHaveLength(2);
    expect(screen.getByRole('button', { name: /book/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /full/i })).toBeDisabled();
  });

  it('handles booking success (optimistic + reload + toast)', async () => {
    // initial load
    listMock.mockResolvedValueOnce([
      { id: 's1', startAt: '2025-01-02T12:00:00Z', endAt: '2025-01-02T13:00:00Z', capacity: 5, bookedCount: 0 },
    ]);
    // booking create succeeds
    createBookingMock.mockResolvedValueOnce({ ok: true, id: 'b1' });
    // reload snapshot after success
    listMock.mockResolvedValueOnce([
      { id: 's1', startAt: '2025-01-02T12:00:00Z', endAt: '2025-01-02T13:00:00Z', capacity: 5, bookedCount: 1 },
    ]);

    render(<SlotsPage />);
    await screen.findByRole('button', { name: /book/i });

    fireEvent.click(screen.getByRole('button', { name: /book/i }));

    await waitFor(() => {
      expect(createBookingMock).toHaveBeenCalledWith({ slotId: 's1' });
    });
    expect(listMock).toHaveBeenCalledTimes(2);
    expect(toastSpy).toHaveBeenCalledWith('Booking created successfully', 'success');
  });

  it('prevents booking on full slot or past slot and shows toast', async () => {
    listMock.mockResolvedValueOnce([
      // full slot
      { id: 'full', startAt: '2025-01-02T12:00:00Z', endAt: '2025-01-02T13:00:00Z', capacity: 2, bookedCount: 2 },
      // past slot
      { id: 'past', startAt: '2020-01-01T12:00:00Z', endAt: '2020-01-01T13:00:00Z', capacity: 5, bookedCount: 0 },
    ]);

    render(<SlotsPage />);
    await screen.findAllByText(/seats available/i);

    // full slot button disabled
    expect(screen.getByRole('button', { name: /full/i })).toBeDisabled();

    // Try clicking past slot by targeting the other "Book" button label text via index:
    const allButtons = screen.getAllByRole('button', { name: /book|full/i });
    const pastBtn = allButtons.find((b) => /book/i.test(b.textContent || ''));
    expect(pastBtn).toBeTruthy();
    fireEvent.click(pastBtn);

    expect(toastSpy).toHaveBeenCalledWith(
      'This slot has already passed. Please choose a future slot.',
      'error'
    );
    expect(createBookingMock).not.toHaveBeenCalled();
  });

  it('renders HostSlotAdmin for host users', async () => {
    // Re-mock auth to return host role
    vi.doMock('@/features/auth/auth.context', () => ({
      useAuth: () => ({ user: { role: 'host' } }),
    }));
    const { default: HostSlotsPage } = await import('@/features/bookings/SlotsPage');

    listMock.mockResolvedValueOnce([]);
    render(<HostSlotsPage />);

    await waitFor(() => expect(listMock).toHaveBeenCalled());
    // "Host tools" title from HostSlotAdmin
    expect(screen.getByText(/host tools/i)).toBeInTheDocument();
  });

  it('shows error state when list fails', async () => {
    listMock.mockRejectedValueOnce(new Error('boom'));
    render(<SlotsPage />);

    expect(await screen.findByText(/failed to load slots/i)).toBeInTheDocument();
  });
});
