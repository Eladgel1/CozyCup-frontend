import { Tabs } from '@/components/ui/Tabs';

function fmt(d) { return d.toISOString().slice(0, 10); }
function label(d) { return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }); }

export default function SlotDayPicker({ value, onChange }) {
  const today = new Date();
  const days = [0,1,2].map((add) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + add);
    return { label: label(d), value: fmt(d) };
  });

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold">Find a seat</h2>
      <Tabs
        tabs={days}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
