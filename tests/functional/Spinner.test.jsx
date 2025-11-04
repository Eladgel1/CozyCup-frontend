import { render } from '@testing-library/react';
import Spinner from '@/components/ui/Spinner';

describe('Spinner (functional)', () => {
  it('renders with default size classes and spin animation', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('animate-spin');
    expect(svg).toHaveClass('w-4', 'h-4');
  });

  it('accepts a custom className to override sizing/styling', () => {
    const { container } = render(<Spinner className="w-6 h-6 text-[var(--brand)]" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('animate-spin');
    expect(svg).toHaveClass('w-6', 'h-6', 'text-[var(--brand)]');
  });
});
