import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

const listMock = vi.fn();
const addSpy = vi.fn();
vi.mock('@/lib/menu.api', () => ({
  menuApi: { list: (...a) => listMock(...a) },
}));
vi.mock('@/features/menu/cart.context.jsx', () => ({
  useCart: () => ({ add: addSpy, items: [], totals: { count: 0, sum: 0 }, open: false, setOpen: vi.fn() }),
}));

import MenuPage from '@/features/menu/MenuPage.jsx';

describe('MenuPage (integration)', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('shows skeleton, loads items, normalizes prices, filters, and adds to cart', async () => {
    listMock.mockResolvedValueOnce([
      { _id: '1', name: 'Latte', description: 'Milky', priceCents: 450, category: 'Coffee' },
      { id: '2', name: 'Muffin', description: 'Blueberry', price: 3.2, category: 'Pastry' },
    ]);

    const { container } = render(<MenuPage />);
    await waitFor(() => {
      expect(container.querySelectorAll('.h-56').length).toBeGreaterThan(0);
    });

    // Ready with items
    expect(await screen.findByText('Latte')).toBeInTheDocument();
    expect(screen.getByText('$4.50')).toBeInTheDocument();
    expect(screen.getByText('Muffin')).toBeInTheDocument();
    expect(screen.getByText('$3.20')).toBeInTheDocument();

    // Filter by category via Tabs
    fireEvent.click(screen.getByRole('tab', { name: /Pastry/i }));
    expect(await screen.findByText('Muffin')).toBeInTheDocument();
    expect(screen.queryByText('Latte')).not.toBeInTheDocument();

    // Search
    fireEvent.change(screen.getByPlaceholderText(/Search menu/i), { target: { value: 'muf' } });
    expect(await screen.findByText('Muffin')).toBeInTheDocument();

    // Add to cart
    fireEvent.click(screen.getAllByRole('button', { name: /Add/i })[0]);
    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ id: '2', name: 'Muffin' }));
  });

  it('shows error state on failure', async () => {
    listMock.mockRejectedValueOnce(new Error('boom'));
    render(<MenuPage />);
    expect(await screen.findByText(/Failed to load menu/i)).toBeInTheDocument();
  });

  it('shows empty message when filters exclude all items', async () => {
    listMock.mockResolvedValueOnce([{ id: '1', name: 'Latte', priceCents: 450, category: 'Coffee' }]);
    render(<MenuPage />);
    await screen.findByText('Latte');

    fireEvent.change(screen.getByPlaceholderText(/Search menu/i), { target: { value: 'zzz' } });
    expect(await screen.findByText(/No items match your filters/i)).toBeInTheDocument();
  });
});
