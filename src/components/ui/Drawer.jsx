import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import { cx } from '@/lib/cx';

export default function Drawer({ open, onClose, title, children, side = 'right', width = 360 }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);

  if (!open) return null;
  const translate = side === 'right' ? 'translate-x-full' : '-translate-x-full';
  const from = side === 'right' ? 'right-0' : 'left-0';

  return createPortal(
    <div className="fixed inset-0 z-[55]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={cx('absolute top-0 h-full bg-[var(--card)] border shadow transition-transform duration-300', from)}
        style={{ width, transform: 'translateX(0)' }}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">{title}</h3>
          <button className="btn-ghost px-2 py-1 cursor-pointer" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="p-4 h-[calc(100%-56px)] overflow-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
}
