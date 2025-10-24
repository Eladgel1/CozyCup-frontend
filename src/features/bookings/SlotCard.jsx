import Button from '@/components/ui/Button';

const hhmm = (iso) => {
  try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
  catch { return iso || ''; }
};

const seatsLeft = (s) => {
  const direct = Number(s?.remaining ?? s?.seatsLeft);
  if (!Number.isNaN(direct) && direct >= 0) return direct;
  const capacity = Number(s?.capacity ?? 0);
  const booked = Number(s?.bookedCount ?? 0);
  return Math.max(0, capacity - booked);
};

export default function SlotCard({ slot, onBook, loading }) {
  const start = slot.startAt ? hhmm(slot.startAt) : (slot.start || slot.from);
  const end   = slot.endAt   ? hhmm(slot.endAt)   : (slot.end || slot.to);
  const left  = seatsLeft(slot);
  const disabled = !left || loading;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">{start} – {end}</div>
          <div className="muted text-sm">{left} seats available</div>
        </div>
        <Button size="sm" loading={loading} disabled={disabled} onClick={() => onBook(slot)}>
          {left ? 'Book' : 'Full'}
        </Button>
      </div>
    </div>
  );
}
