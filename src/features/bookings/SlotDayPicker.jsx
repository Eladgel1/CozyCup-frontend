import { Tabs } from '@/components/ui/Tabs';

function fmtLocal(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function label(d) {
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function SlotDayPicker({ value, onChange }) {
  const today = new Date();
  const days = [0, 1, 2].map((add) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + add);
    return { label: label(d), value: fmtLocal(d) };
  });

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-xl font-semibold">Find a seat</h2>
      <Tabs tabs={days} value={value} onChange={onChange} />
    </div>
  );
}
