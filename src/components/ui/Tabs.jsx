import { useEffect, useId, useRef, useState } from 'react';
import { cx } from '@/lib/cx';

export function Tabs({ tabs = [], value, onChange, initial = 0 }) {
  const isControlled = value !== undefined;
  const [i, setI] = useState(isControlled ? tabs.findIndex(t => t.value === value) : initial);
  const id = useId();
  const listRef = useRef(null);

  useEffect(() => {
    if (isControlled) {
      const idx = tabs.findIndex(t => t.value === value);
      if (idx >= 0) setI(idx);
    }
  }, [value, tabs, isControlled]);

  const change = (idx) => {
    setI(idx);
    onChange?.(tabs[idx].value);
  };

  const onKeyDown = (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    let next = i;
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
    if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = tabs.length - 1;
    change(next);
    listRef.current?.querySelectorAll('[role="tab"]')[next]?.focus();
  };

  return (
    <div>
      <div
        ref={listRef}
        role="tablist"
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        className="inline-flex items-center gap-1 bg-black/5 p-1 rounded-[var(--radius)]"
      >
        {tabs.map((t, idx) => {
          const selected = idx === i;
          return (
            <button
              key={t.value}
              role="tab"
              id={`${id}-tab-${idx}`}
              aria-controls={`${id}-panel-${idx}`}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => change(idx)}
              className={cx(
                'px-3 py-1 rounded-[var(--radius)] text-sm',
                selected ? 'bg-[var(--card)] shadow font-medium' : 'hover:bg-black/10'
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
