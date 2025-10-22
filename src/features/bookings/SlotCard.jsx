import Button from '@/components/ui/Button';

export default function SlotCard({ slot, onBook, loading }) {
  const start = slot.start || slot.from || slot.startTime;
  const end   = slot.end || slot.to || slot.endTime;
  const left  = slot.left ?? slot.free ?? slot.available ?? 0;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">{start} – {end}</div>
          <div className="muted text-sm">{left} seats available</div>
        </div>
        <Button loading={loading} onClick={() => onBook(slot)} size="sm">Book</Button>
      </div>
    </div>
  );
}
