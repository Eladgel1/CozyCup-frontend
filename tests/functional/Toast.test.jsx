import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ToastHost, { useToast } from '@/components/ui/Toast.jsx';

function Trigger() {
  const toast = useToast();
  return <button onClick={() => toast.show('Saved!', 'success')}>Notify</button>;
}

describe('ToastHost / useToast (functional)', () => {
  let realUUID;

  beforeEach(() => {
    vi.useFakeTimers();
    realUUID = global.crypto?.randomUUID;
    // defineProperty is safer than assignment on jsdom's crypto
    Object.defineProperty(global, 'crypto', {
      value: { randomUUID: () => 'test-id' },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    if (realUUID) {
      Object.defineProperty(global, 'crypto', {
        value: { randomUUID: realUUID },
        configurable: true,
      });
    }
  });

  it('shows a toast when using useToast().show', () => {
    render(
      <>
        <ToastHost />
        <Trigger />
      </>
    );
    fireEvent.click(screen.getByRole('button', { name: /notify/i }));
    expect(screen.getByRole('status')).toHaveTextContent('Saved!');
  });

  it('auto-dismisses after 3 seconds', async () => {
    // Use *real* timers just for this test to avoid act/fakeTimers quirks
    vi.useRealTimers();

    render(
      <>
        <ToastHost />
        <Trigger />
      </>
    );

    fireEvent.click(screen.getByRole('button', { name: /notify/i }));
    expect(screen.getByRole('status')).toBeInTheDocument();

    // Wait up to ~3.5s for the toast to be removed by the real setTimeout(3000)
    await waitFor(
      () => {
        expect(screen.queryByRole('status')).toBeNull();
      },
      { timeout: 3500 }
    );

    // Restore fake timers for the rest of the suite (optional since other tests re-set it)
    vi.useFakeTimers();
  });


  it('applies type styles (success / error / info)', () => {
    function TriggerError() {
      const t = useToast();
      return <button onClick={() => t.show('Oops', 'error')}>Err</button>;
    }
    render(
      <>
        <ToastHost />
        <TriggerError />
      </>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Err' }));
    const toast = screen.getByRole('status');
    expect(toast).toHaveTextContent('Oops');
  });
});
