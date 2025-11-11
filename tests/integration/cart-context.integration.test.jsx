import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import { CartProvider, useCart } from '@/features/menu/cart.context.jsx';

function Consumer() {
  const { items, totals, add, inc, dec, remove, clear, open, setOpen } = useCart();
  return (
    <div>
      <div data-testid="count">{totals.count}</div>
      <div data-testid="sum">{totals.sum.toFixed(2)}</div>
      <div data-testid="open">{String(open)}</div>
      <button onClick={() => setOpen(true)}>open</button>
      <button onClick={() => add({ id: '1', name: 'Latte', price: 4.5 })}>add</button>
      <button onClick={() => inc('1')}>inc</button>
      <button onClick={() => dec('1')}>dec</button>
      <button onClick={() => remove('1')}>remove</button>
      <button onClick={() => clear()}>clear</button>
      <div data-testid="items">{items.map(i => `${i.id}:${i.qty}`).join(',')}</div>
    </div>
  );
}

describe('Cart context (integration)', () => {
  const KEY = 'cozycup_cart_v1';

  beforeEach(() => {
    localStorage.clear();
  });

  it('persists, computes totals, and supports add/inc/dec/remove/clear', () => {
    render(
      <CartProvider>
        <Consumer />
      </CartProvider>
    );

    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('sum').textContent).toBe('0.00');
    expect(screen.getByTestId('open').textContent).toBe('false');

    fireEvent.click(screen.getByText('add'));
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('sum').textContent).toBe('4.50');
    expect(screen.getByTestId('open').textContent).toBe('true');
    expect(screen.getByTestId('items').textContent).toBe('1:1');

    fireEvent.click(screen.getByText('inc'));
    expect(screen.getByTestId('count').textContent).toBe('2');
    expect(screen.getByTestId('sum').textContent).toBe('9.00');
    expect(screen.getByTestId('items').textContent).toBe('1:2');

    fireEvent.click(screen.getByText('dec'));
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('sum').textContent).toBe('4.50');
    expect(screen.getByTestId('items').textContent).toBe('1:1');

    fireEvent.click(screen.getByText('open'));
    expect(screen.getByTestId('open').textContent).toBe('true');

    fireEvent.click(screen.getByText('remove'));
    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('items').textContent).toBe('');

    fireEvent.click(screen.getByText('add'));
    fireEvent.click(screen.getByText('clear'));
    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(JSON.parse(localStorage.getItem(KEY))).toEqual([]);
  });

  it('loads from localStorage on mount', () => {
    localStorage.setItem(KEY, JSON.stringify([{ id: 'x', name: 'X', price: 2, qty: 3 }]));
    render(
      <CartProvider>
        <Consumer />
      </CartProvider>
    );
    expect(screen.getByTestId('count').textContent).toBe('3');
    expect(screen.getByTestId('sum').textContent).toBe('6.00');
  });
});
