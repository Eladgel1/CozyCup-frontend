import { render, screen } from '@testing-library/react';
import Badge from '@/components/ui/Badge';

describe('Badge (functional)', () => {
  it('renders children and merges classes', () => {
    render(<Badge className="bg-red-500 text-white">New</Badge>);
    const el = screen.getByText('New');
    expect(el).toHaveClass('badge');
    expect(el).toHaveClass('bg-red-500');
    expect(el).toHaveClass('text-white');
  });
});
