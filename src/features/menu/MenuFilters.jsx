import { Tabs } from '@/components/ui/Tabs';
import { useMemo, useState } from 'react';

export default function MenuFilters({ items = [], onFilter }) {
  const categories = useMemo(() => {
    const set = new Map();
    for (const it of items || []) {
      const raw = it.category || 'General';
      const key = String(raw).toLowerCase();
      if (!set.has(key)) set.set(key, raw);
    }
    return Array.from(set.values());
  }, [items]);

  const tabs = [{ label: 'All', value: 'all' }, ...categories.map((c) => ({ label: c, value: c }))];

  const [q, setQ] = useState('');

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <Tabs tabs={tabs} onChange={(val) => onFilter({ category: val })} />

      {/* Search with icon */}
      <div className="relative w-full md:w-72">
        <img
          src="/src/assets/icons/search.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70"
        />
        <input
          className="border radius-sm pl-9 pr-3 py-2 w-full"
          placeholder="Search menu…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            onFilter({ query: e.target.value });
          }}
        />
      </div>
    </div>
  );
}
