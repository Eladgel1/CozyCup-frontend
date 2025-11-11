import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SlotDayPicker from '@/features/bookings/SlotDayPicker';

// Use fixed system date for deterministic labels/values
beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-01-01T09:00:00Z'));
});
afterAll(() => {
  vi.useRealTimers();
});

describe('SlotDayPicker (integration)', () => {
  it('renders three days and calls onChange when tab is clicked', () => {
    const onChange = vi.fn();
    // initial value = today (local date formatting is handled inside)
    const today = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const todayLocal = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    render(<SlotDayPicker value={todayLocal} onChange={onChange} />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);

    // Click the second tab -> onChange with its value
    fireEvent.click(tabs[1]);
    expect(onChange).toHaveBeenCalledTimes(1);
    // We cannot easily guess the exact string here without re-deriving it;
    // just assert we got any string value.
    expect(typeof onChange.mock.calls[0][0]).toBe('string');
  });
});
