import { Tabs } from '@/components/ui/Tabs';
import { useState } from 'react';

export default function MenuFilters({ items = [], onFilter }) {
  const categories = Array.from(new Set(items.map((x) => x.category).filter(Boolean)));
  const tabs = [{ label: 'All', value: 'all' }, ...categories.map((c) => ({ label: c, value: c }))];

  const [q, setQ] = useState('');

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <Tabs
        tabs={tabs}
        onChange={(val) => onFilter({ category: val })}
      />
      <input
        className="border radius-sm px-3 py-2 w-full md:w-72"
        placeholder="Search menu…"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          onFilter({ query: e.target.value });
        }}
      />
    </div>
  );
}
