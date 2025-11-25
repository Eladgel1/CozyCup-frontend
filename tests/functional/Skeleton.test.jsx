import { render } from '@testing-library/react';
import Skeleton from '@/components/ui/Skeleton';

describe('Skeleton (functional)', () => {
  it('renders a pulsing block with given dimensions', () => {
    const { container } = render(<Skeleton className="h-8 w-32" />);
    const el = container.firstChild;
    expect(el).toHaveClass('animate-pulse');
    expect(el).toHaveClass('h-8', 'w-32');
    // no text content expected
    expect(el).toBeInTheDocument();
  });
});
