import { useEffect, useState } from 'react';
import Skeleton from '@/components/ui/Skeleton';
import { slotsApi } from '@/lib/slots.api';
import { bookingsApi } from '@/lib/bookings.api';
import SlotDayPicker from './SlotDayPicker';
import SlotCard from './SlotCard';
import { useToast } from '@/components/ui/Toast';
import HostSlotAdmin from './HostSlotAdmin';
import { useAuth } from '@/features/auth/auth.context';
import { on, emit } from '@/lib/events';

function todayLocal() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const slotId = (s) => s?.id || s?._id;
const seatsLeft = (s) => {
  // prefer server-provided remaining if exists; otherwise derive
  const direct = Number(s?.remaining ?? s?.seatsLeft);
  if (!Number.isNaN(direct) && direct >= 0) return direct;
  const cap = Number(s?.capacity ?? 0);
  const booked = Number(s?.bookedCount ?? 0);
  return Math.max(0, cap - booked);
};

export default function SlotsPage() {
  const [date, setDate] = useState(todayLocal());
  const [state, setState] = useState('loading');
  const [slots, setSlots] = useState([]);
  const [bookingIdLoading, setBookingIdLoading] = useState(null);
  const toast = useToast();
  const { user } = useAuth();

  const load = async () => {
    setState('loading');
    try {
      const data = await slotsApi.list(date);
      setSlots(Array.isArray(data) ? data : []);
      setState('ready');
    } catch {
      setState('error');
    }
  };

  useEffect(() => { load(); }, [date]);

  // live adjustments from other views
  useEffect(() => {
    const offCreated = on('booking:created', ({ slotId: id }) => {
      setSlots((prev) => prev.map((s) => {
        if (slotId(s) !== id) return s;
        const booked = Number(s.bookedCount ?? 0) + 1;
        return { ...s, bookedCount: booked, remaining: seatsLeft({ ...s, bookedCount: booked }) };
      }));
    });
    const offCancel = on('booking:cancelled', ({ slotId: id }) => {
      setSlots((prev) => prev.map((s) => {
        if (slotId(s) !== id) return s;
        const booked = Math.max(0, Number(s.bookedCount ?? 0) - 1);
        return { ...s, bookedCount: booked, remaining: seatsLeft({ ...s, bookedCount: booked }) };
      }));
    });
    return () => { offCreated(); offCancel(); };
  }, []);

  const onBook = async (slot) => {
    const startIso = slot.startAt || slot.start || slot.from;
    if (startIso && new Date(startIso).getTime() <= Date.now()) {
      toast.show('This slot has already passed. Please choose a future slot.', 'error');
      return;
    }

    const id = slotId(slot);
    const leftNow = seatsLeft(slot);
    if (leftNow <= 0) {
      toast.show('This slot is already full.', 'error');
      return;
    }

    // optimistic: decrement remaining (by increasing bookedCount)
    setSlots((prev) =>
      prev.map((s) => {
        if (slotId(s) !== id) return s;
        const booked = Number(s.bookedCount ?? 0) + 1;
        return { ...s, bookedCount: booked, remaining: seatsLeft({ ...s, bookedCount: booked }) };
      })
    );

    try {
      setBookingIdLoading(id);
      await bookingsApi.create({ slotId: id });
      toast.show('Booking created successfully', 'success');
      emit('booking:created', { slotId: id });
      // pull fresh snapshot to stay truthful with server
      await load();
    } catch (e) {
      // revert optimistic
      setSlots((prev) =>
        prev.map((s) => {
          if (slotId(s) !== id) return s;
          const booked = Math.max(0, Number(s.bookedCount ?? 0) - 1);
          return { ...s, bookedCount: booked, remaining: seatsLeft({ ...s, bookedCount: booked }) };
        })
      );
      toast.show(e?.message || 'Failed to create booking', 'error');
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
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      )}

      {state === 'error' && <div className="card p-6 mt-6">Failed to load slots.</div>}

      {state === 'ready' && (
        <div className="mt-6 space-y-4">
          {slots.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {slots.map((s) => (
                <SlotCard
                  key={slotId(s)}
                  slot={s}
                  onBook={onBook}
                  loading={bookingIdLoading === slotId(s)}
                />
              ))}
            </div>
          ) : (
            <div className="card p-6">No slots available for this day.</div>
          )}

          {user?.role === 'host' && (
            <HostSlotAdmin date={date} onCreated={load} />
          )}
        </div>
      )}
    </div>
  );
}
