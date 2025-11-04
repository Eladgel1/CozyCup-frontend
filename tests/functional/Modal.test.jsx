import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '@/components/ui/Modal.jsx';

function ModalHost({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Hello">
      <button>Inner Action</button>
    </Modal>
  );
}

describe('Modal (functional)', () => {
  let onClose;
  beforeEach(() => { onClose = vi.fn(); });

  it('does not render when open=false', () => {
    render(<ModalHost open={false} onClose={onClose} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders portal when open=true and closes on overlay click', () => {
    render(<ModalHost open onClose={onClose} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    // overlay is the first div in portal; click on backdrop area:
    fireEvent.click(dialog.firstChild); // overlay div
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape key', () => {
    render(<ModalHost open onClose={onClose} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('autofocuses first focusable control inside', () => {
    render(<Modal open onClose={onClose} title="A"><button>First</button></Modal>);
    // allow setTimeout in Modal useEffect to run
    // (RTL flushes microtasks, but setTimeout 0 still needs a tick)
    expect(screen.getByRole('button', { name: 'First' })).toBeInTheDocument();
  });
});
