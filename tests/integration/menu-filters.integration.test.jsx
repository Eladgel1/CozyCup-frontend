import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import MenuFilters from '@/features/menu/MenuFilters.jsx';

describe('MenuFilters (integration)', () => {
  it('derives categories from items and calls onFilter on tab and search', () => {
    const items = [
      { id: '1', name: 'Latte', category: 'Coffee' },
      { id: '2', name: 'Muffin', category: 'Pastry' },
      { id: '3', name: 'Mocha', category: 'Coffee' },
    ];
    const onFilter = vi.fn();

    render(<MenuFilters items={items} onFilter={onFilter} />);
    
    expect(screen.getByRole('tab', { name: /All/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Coffee/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Pastry/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Coffee/i }));
    expect(onFilter).toHaveBeenCalledWith({ category: 'Coffee' });

    fireEvent.change(screen.getByPlaceholderText(/Search menu/i), { target: { value: 'lat' } });
    expect(onFilter).toHaveBeenCalledWith({ query: 'lat' });
  });
});
