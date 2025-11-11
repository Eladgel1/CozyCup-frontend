import React from 'react';
import { render, screen } from '@testing-library/react';
import OrderSummary from '@/features/menu/OrderSummary.jsx';

describe('OrderSummary (integration)', () => {
  it('returns null when no data', () => {
    const { container } = render(<OrderSummary data={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders id, eta optional, and status', () => {
    render(<OrderSummary data={{ id: 'o1', eta: '12:30', status: 'READY' }} />);
    expect(screen.getByText(/Order Summary/i)).toBeInTheDocument();
    expect(screen.getByText(/Order ID: o1/i)).toBeInTheDocument();
    expect(screen.getByText(/ETA: 12:30/i)).toBeInTheDocument();
    expect(screen.getByText(/Status: READY/i)).toBeInTheDocument();
  });

  it('supports alternate id field and default status', () => {
    render(<OrderSummary data={{ orderId: 'X9' }} />);
    expect(screen.getByText(/Order ID: X9/i)).toBeInTheDocument();
    expect(screen.getByText(/Status: Waiting/i)).toBeInTheDocument();
  });
});
