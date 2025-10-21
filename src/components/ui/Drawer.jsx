export default function Drawer({ open, onClose, title, children, width = 360 }) {
  return (
    <div className={`fixed top-0 right-0 h-full z-50 transition-transform duration-300`} style={{ width }}>
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`h-full bg-[var(--card)] border-l shadow w-full transform ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">{title}</h3>
          <button className="btn-ghost px-2 py-1 cursor-pointer" onClick={onClose}>✕</button>
        </div>
        <div className="p-4 h-[calc(100%-56px)] overflow-auto">{children}</div>
      </div>
    </div>
  );
}
