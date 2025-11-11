import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SlotCard from '@/features/bookings/SlotCard';

describe('SlotCard (integration)', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-01-01T10:00:00Z'));
  });

  it('shows time window, seats left, and Book enabled when seats remain', () => {
    const slot = { id: 's1', startAt: '2025-01-02T12:00:00Z', endAt: '2025-01-02T13:00:00Z', capacity: 4, bookedCount: 1 };
    render(<SlotCard slot={slot} onBook={vi.fn()} loading={false} />);

    expect(screen.getByText(/seats available/i)).toBeInTheDocument();
    const bookBtn = screen.getByRole('button', { name: /book/i });
    expect(bookBtn).toBeEnabled();
  });

  it('disables button and shows "Full" when no seats left', () => {
    const slot = { id: 's2', startAt: '2025-01-02T12:00:00Z', endAt: '2025-01-02T13:00:00Z', capacity: 2, bookedCount: 2 };
    render(<SlotCard slot={slot} onBook={vi.fn()} loading={false} />);

    const fullBtn = screen.getByRole('button', { name: /full/i });
    expect(fullBtn).toBeDisabled();
  });

  it('calls onBook with slot when clicking Book (not loading)', () => {
    const slot = { id: 's3', startAt: '2025-01-02T12:00:00Z', endAt: '2025-01-02T13:00:00Z', capacity: 3, bookedCount: 0 };
    const onBook = vi.fn();
    render(<SlotCard slot={slot} onBook={onBook} loading={false} />);

    fireEvent.click(screen.getByRole('button', { name: /book/i }));
    expect(onBook).toHaveBeenCalledWith(slot);
  });

  it('disables button while loading', () => {
    const slot = { id: 's4', startAt: '2025-01-02T12:00:00Z', endAt: '2025-01-02T13:00:00Z', capacity: 3, bookedCount: 0 };
    render(<SlotCard slot={slot} onBook={vi.fn()} loading />);

    expect(screen.getByRole('button')).toBeDisabled();
  });
});
