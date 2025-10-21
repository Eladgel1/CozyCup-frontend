import { useState } from 'react';
export function Tabs({ tabs = [], onChange, initial = 0 }) {
  const [i, setI] = useState(initial);
  return (
    <div className="flex items-center gap-1 bg-black/5 p-1 rounded-[var(--radius)]">
      {tabs.map((t, idx) => (
        <button
          key={t.value}
          onClick={() => { setI(idx); onChange?.(t.value); }}
          className={`px-3 py-1 rounded-[var(--radius)] text-sm ${i === idx ? 'bg-[var(--card)] shadow' : 'hover:bg-black/10'}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
