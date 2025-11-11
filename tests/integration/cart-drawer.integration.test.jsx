import React from 'react';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';

const pickupListMock = vi.fn();
const createOrderMock = vi.fn();
const toastSpy = vi.fn();

vi.mock('@/lib/pickup.api', () => ({
  pickupApi: { list: (...a) => pickupListMock(...a) },
}));
vi.mock('@/lib/orders.api', () => ({
  ordersApi: { create: (...a) => createOrderMock(...a) },
}));
vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({ show: toastSpy }),
}));

const setOpenSpy = vi.fn();
const clearSpy = vi.fn();
function cartMock({ items = [], open = true, totals = { count: 0, sum: 0 } } = {}) {
  return {
    useCart: () => ({
      items,
      totals,
      inc: vi.fn(),
      dec: vi.fn(),
      remove: vi.fn(),
      clear: clearSpy,
      open,
      setOpen: setOpenSpy,
    }),
  };
}

describe('CartDrawer (integration)', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('shows empty state when no items', async () => {
    vi.doMock('@/features/menu/cart.context.jsx', () =>
      cartMock({ items: [], open: true, totals: { count: 0, sum: 0 } })
    );
    const { default: Drawer } = await import('@/features/menu/CartDrawer.jsx');
    render(<Drawer />);
    expect(screen.getByText(/No items added yet/i)).toBeInTheDocument();
  });

  it('renders items, fetches pickup windows, places order successfully and clears', async () => {
    vi.doMock('@/features/menu/cart.context.jsx', () =>
      cartMock({
        items: [{ id: 'i1', name: 'Latte', price: 4.5, image: '', qty: 2 }],
        open: true,
        totals: { count: 2, sum: 9 },
      })
    );
    const { default: Drawer } = await import('@/features/menu/CartDrawer.jsx');

    pickupListMock.mockResolvedValueOnce([
      { id: 'w1', startAt: '2025-01-01T10:00:00Z', endAt: '2025-01-01T11:00:00Z', remaining: 5 },
      { id: 'w2', startAt: '2025-01-01T12:00:00Z', endAt: '2025-01-01T13:00:00Z', remaining: 0 },
    ]);
    createOrderMock.mockResolvedValueOnce({ id: 'o1' });

    render(<Drawer />);

    const select = await waitFor(() => screen.getByRole('combobox'));
    await waitFor(() => {
      const options = select.querySelectorAll('option');
      expect(options.length).toBeGreaterThan(1);
    });

    fireEvent.change(select, { target: { value: 'w1' } });
    fireEvent.click(screen.getByRole('button', { name: /Place order/i }));

    await waitFor(() => {
      expect(createOrderMock).toHaveBeenCalledWith(
        expect.objectContaining({ pickupWindowId: 'w1', items: expect.any(Array) })
      );
    });

    expect(toastSpy).toHaveBeenCalledWith('Order placed successfully!', 'success');
    expect(clearSpy).toHaveBeenCalled();
    expect(setOpenSpy).toHaveBeenCalledWith(false);
  });

  it('shows meaningful errors on invalid actions', async () => {
    vi.doMock('@/features/menu/cart.context.jsx', () =>
      cartMock({ items: [], open: true, totals: { count: 0, sum: 0 } })
    );
    let Drawer = (await import('@/features/menu/CartDrawer.jsx')).default;
    render(<Drawer />);
    const btn = screen.getByRole('button', { name: /Place order/i });
    expect(btn).toBeDisabled();

    cleanup();

    vi.resetModules();
    vi.doMock('@/features/menu/cart.context.jsx', () =>
      cartMock({
        items: [{ id: 'i1', name: 'Latte', price: 4.5, qty: 1 }],
        open: true,
        totals: { count: 1, sum: 4.5 },
      })
    );
    pickupListMock.mockResolvedValueOnce([
      { id: 'w1', startAt: '2025-01-01T10:00:00Z', endAt: '2025-01-01T11:00:00Z', remaining: 1 },
    ]);
    createOrderMock.mockRejectedValueOnce({ status: 409 });

    Drawer = (await import('@/features/menu/CartDrawer.jsx')).default;
    render(<Drawer />);

    const select = await waitFor(() => screen.getByRole('combobox'));
    await waitFor(() => expect(select.querySelectorAll('option').length).toBeGreaterThan(1));

    fireEvent.change(select, { target: { value: 'w1' } });
    fireEvent.click(screen.getByRole('button', { name: /Place order/i }));

    await waitFor(() =>
      expect(toastSpy).toHaveBeenCalledWith(
        expect.stringMatching(/window is full/i),
        'error'
      )
    );
  });
});
