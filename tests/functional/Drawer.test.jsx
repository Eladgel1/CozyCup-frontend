import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Drawer from '@/components/ui/Drawer.jsx';

describe('Drawer (functional)', () => {
  it('renders when open and closes on overlay click', () => {
    const onClose = vi.fn();
    render(<Drawer open onClose={onClose} title="Cart">Body</Drawer>);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    // overlay is the first child in portal
    fireEvent.click(dialog.firstChild);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape key', () => {
    const onClose = vi.fn();
    render(<Drawer open onClose={onClose} title="Cart" />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders title and body content', () => {
    render(<Drawer open onClose={() => {}} title="Cart"><div>Items</div></Drawer>);
    expect(screen.getByText('Cart')).toBeInTheDocument();
    expect(screen.getByText('Items')).toBeInTheDocument();
  });
});
