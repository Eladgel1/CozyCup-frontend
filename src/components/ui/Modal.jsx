import { createPortal } from 'react-dom';
import { useEffect, useRef } from 'react';
import { cx } from '@/lib/cx';

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  const ref = useRef(null);
  const lastActive = useRef(null);

  useEffect(() => {
    if (open) {
      lastActive.current = document.activeElement;
      setTimeout(() => ref.current?.querySelector?.('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')?.focus(), 0);
      const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', onKey);
        document.body.style.overflow = '';
        lastActive.current && lastActive.current.focus?.();
      };
    }
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

  return createPortal(
    <div className="fixed inset-0 z-[60]" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div ref={ref} className={cx('bg-[var(--card)] border rounded-[var(--radius)] shadow w-full', sizes[size])}>
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold">{title}</h3>
            <button className="btn-ghost px-2 py-1 cursor-pointer" onClick={onClose} aria-label="Close">✕</button>
          </div>
          <div className="p-4">{children}</div>
          {footer && <div className="px-4 py-3 border-t">{footer}</div>}
        </div>
      </div>
    </div>,
    document.body
  );
}
