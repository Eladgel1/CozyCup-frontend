import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const createSlotMock = vi.fn();
const toastSpy = vi.fn();
vi.mock('@/lib/slots.api', () => ({
  slotsApi: { create: (...args) => createSlotMock(...args) },
}));
vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({ show: toastSpy }),
}));

import HostSlotAdmin from '@/features/bookings/HostSlotAdmin';

describe('HostSlotAdmin (integration)', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.setSystemTime(new Date('2025-01-01T10:00:00Z'));
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('creates a slot with valid data and calls onCreated + shows success toast', async () => {
    const onCreated = vi.fn();
    createSlotMock.mockResolvedValueOnce({ ok: true });

    render(<HostSlotAdmin date="2025-01-02" onCreated={onCreated} />);

    const date = document.querySelector('input[type="date"]');
    const timeInputs = document.querySelectorAll('input[type="time"]');
    const tStart = timeInputs[0];
    const tEnd = timeInputs[1];
    const cap = document.querySelector('input[type="number"]');

    expect(date).not.toBeNull();
    expect(tStart).not.toBeNull();
    expect(tEnd).not.toBeNull();
    expect(cap).not.toBeNull();

    expect(date.value).toBe('2025-01-02');
    fireEvent.change(tStart, { target: { value: '10:00' } });
    fireEvent.change(tEnd,   { target: { value: '11:00' } });
    fireEvent.change(cap,    { target: { value: '6' } });

    const submitBtn = screen.getByRole('button', { name: /create slot/i });
    const form = submitBtn.closest('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form);

    await waitFor(() => expect(createSlotMock).toHaveBeenCalled());
    expect(onCreated).toHaveBeenCalled();
    expect(toastSpy).toHaveBeenCalledWith('Slot created', 'success');
  });

  it('validates past date', async () => {
    render(<HostSlotAdmin date="2024-12-01" onCreated={vi.fn()} />);
    const date = document.querySelector('input[type="date"]');
    expect(date).not.toBeNull();

    fireEvent.change(date, { target: { value: '2020-01-01' } });

    const submitBtn = screen.getByRole('button', { name: /create slot/i });
    const form = submitBtn.closest('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(expect.stringMatching(/date cannot be in the past/i), 'error');
    });
    expect(createSlotMock).not.toHaveBeenCalled();
  });

  it('validates start before end', async () => {
    render(<HostSlotAdmin date="2025-01-02" />);
    const timeInputs = document.querySelectorAll('input[type="time"]');
    const tStart = timeInputs[0];
    const tEnd = timeInputs[1];

    expect(tStart).not.toBeNull();
    expect(tEnd).not.toBeNull();

    fireEvent.change(tStart, { target: { value: '12:00' } });
    fireEvent.change(tEnd,   { target: { value: '11:00' } });

    const submitBtn = screen.getByRole('button', { name: /create slot/i });
    const form = submitBtn.closest('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(expect.stringMatching(/start time must/i), 'error');
    });
    expect(createSlotMock).not.toHaveBeenCalled();
  });

  it('validates capacity must be positive number', async () => {
    render(<HostSlotAdmin date="2025-01-02" />);
    const cap = document.querySelector('input[type="number"]');
    expect(cap).not.toBeNull();

    fireEvent.change(cap, { target: { value: '0' } });

    const submitBtn = screen.getByRole('button', { name: /create slot/i });
    const form = submitBtn.closest('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(expect.stringMatching(/capacity must be a positive/i), 'error');
    });
    expect(createSlotMock).not.toHaveBeenCalled();
  });
});
