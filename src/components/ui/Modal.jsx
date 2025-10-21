export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-[var(--card)] rounded-[var(--radius)] shadow max-w-lg w-full border">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold">{title}</h3>
            <button className="btn-ghost px-2 py-1 cursor-pointer" onClick={onClose}>✕</button>
          </div>
          <div className="p-4">{children}</div>
          {footer && <div className="px-4 py-3 border-t">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
