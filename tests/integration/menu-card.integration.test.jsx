import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MenuCard from '@/features/menu/MenuCard.jsx';

describe('MenuCard (integration)', () => {
  it('renders name, price and calls onAdd', () => {
    const onAdd = vi.fn();
    const item = { id: '1', name: 'Latte', price: 4.5, image: '', category: 'Coffee' };
    render(<MenuCard item={item} onAdd={onAdd} />);
    expect(screen.getByText('Latte')).toBeInTheDocument();
    expect(screen.getByText('$4.50')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Add/i }));
    expect(onAdd).toHaveBeenCalledWith(item);
  });

  it('uses fallback image and replaces on error', () => {
    const item = { id: '2', name: 'Cappuccino', price: 5, image: '', category: 'Coffee' };
    render(<MenuCard item={item} onAdd={() => {}} />);

    const img = screen.getByRole('img', { name: /Cappuccino/i });
    fireEvent.error(img);
    expect(img.getAttribute('src')).toMatch(/menu\/.+\.jpg$/);
  });
});
