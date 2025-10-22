import { useEffect, useState } from 'react';
import { cx } from '@/lib/cx';

let pushExternal;

export function useToast() {
  return {
    show: (msg, type = 'info') => pushExternal?.({ id: crypto.randomUUID(), msg, type }),
  };
}

export default function ToastHost() {
  const [list, setList] = useState([]);
  useEffect(() => {
    pushExternal = (t) => {
      setList((prev) => [...prev, t]);
      setTimeout(() => setList((prev) => prev.filter((x) => x.id !== t.id)), 3000);
    };
    return () => { pushExternal = null; };
  }, []);
  return (
    <div className="fixed right-4 bottom-4 z-50 space-y-2">
      {list.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cx(
            'px-3 py-2 rounded-[var(--radius)] text-white shadow',
            t.type === 'error' ? 'bg-[var(--danger)]' :
            t.type === 'success' ? 'bg-[var(--success)]' : 'bg-[var(--brand)]'
          )}
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
}
