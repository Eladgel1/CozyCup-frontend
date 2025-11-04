import { render, screen } from '@testing-library/react';
import { Table } from '@/components/ui/Table';
import { vi } from 'vitest';

// Ensure crypto.randomUUID exists for row keys when id is missing
beforeAll(() => {
  if (!globalThis.crypto || typeof globalThis.crypto.randomUUID !== 'function') {
    vi.stubGlobal('crypto', { ...(globalThis.crypto || {}), randomUUID: () => 'test-uuid' });
  }
});

describe('Table (functional)', () => {
  it('renders empty state when no rows provided', () => {
    render(<Table columns={[{ key: 'name', header: 'Name' }]} rows={[]} empty="No data" />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('renders headers and rows with plain and custom renderers', () => {
    const columns = [
      { key: 'name', header: 'Name' },
      { key: 'price', header: 'Price', render: (r) => `$${r.price.toFixed(2)}` },
    ];
    const rows = [
      { id: '1', name: 'Espresso', price: 3.5 },
      { name: 'Latte', price: 5.2 }, // no id -> falls back to crypto.randomUUID()
    ];
    render(<Table columns={columns} rows={rows} className="extra" />);

    // headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();

    // cells
    expect(screen.getByText('Espresso')).toBeInTheDocument();
    expect(screen.getByText('$3.50')).toBeInTheDocument();
    expect(screen.getByText('Latte')).toBeInTheDocument();
    expect(screen.getByText('$5.20')).toBeInTheDocument();

    // wrapper classes
    const wrapper = screen.getByRole('table').closest('div');
    expect(wrapper).toHaveClass('card');
    expect(wrapper).toHaveClass('extra');
  });
});
