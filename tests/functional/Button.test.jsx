import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/ui/Button.jsx';

describe('Button (functional)', () => {
  it('renders children and supports click', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Buy</Button>);
    const btn = screen.getByRole('button', { name: /buy/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disables when loading and shows spinner', () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>Buy</Button>);
    const btn = screen.getByRole('button', { name: /buy/i });
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn).toBeDisabled();
    // Spinner should exist
    expect(btn.querySelector('svg')).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('respects "as" element (link example)', () => {
    render(<Button as="a" href="#go">Go</Button>);
    const link = screen.getByRole('link', { name: /go/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#go');
  });

  it('renders left/right icons content around label', () => {
    render(
      <Button leftIcon={<span data-testid="L">L</span>} rightIcon={<span data-testid="R">R</span>}>
        Label
      </Button>
    );
    expect(screen.getByTestId('L')).toBeInTheDocument();
    expect(screen.getByText('Label')).toBeInTheDocument();
    expect(screen.getByTestId('R')).toBeInTheDocument();
  });
});
