import { useEffect, useState } from 'react';
import Skeleton from '@/components/ui/Skeleton';
import { slotsApi } from '@/lib/slots.api';
import { bookingsApi } from '@/lib/bookings.api';
import SlotDayPicker from './SlotDayPicker';
import SlotCard from './SlotCard';
import { useToast } from '@/components/ui/Toast';

export default function SlotsPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [state, setState] = useState('loading'); // loading | ready | error
  const [slots, setSlots] = useState([]);
  const [bookingIdLoading, setBookingIdLoading] = useState(null);
  const toast = useToast();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setState('loading');
        const data = await slotsApi.list(date);
        if (mounted) { setSlots(Array.isArray(data) ? data : []); setState('ready'); }
      } catch {
        if (mounted) setState('error');
      }
    })();
    return () => { mounted = false; };
  }, [date]);

  const onBook = async (slot) => {
    try {
      setBookingIdLoading(slot.id || slot._id);
      const res = await bookingsApi.create({ slotId: slot.id || slot._id });
      toast.show('Booking created successfully', 'success');
    } catch (e) {
      toast.show(e.message || 'Failed to create booking', 'error');
    } finally {
      setBookingIdLoading(null);
    }
  };

  return (
    <div>
      <div className="rounded-[var(--radius)] p-6 bg-[var(--card)] border qr-hero">
        <SlotDayPicker value={date} onChange={setDate} />
      </div>

      {state === 'loading' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      )}

      {state === 'error' && <div className="card p-6 mt-6">Failed to load slots.</div>}

      {state === 'ready' && (
        slots.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {slots.map((s) => (
              <SlotCard
                key={s.id || s._id}
                slot={s}
                onBook={onBook}
                loading={bookingIdLoading === (s.id || s._id)}
              />
            ))}
          </div>
        ) : (
          <div className="card p-6 mt-6">No slots available for this day.</div>
        )
      )}
    </div>
  );
}
