import { useEffect, useState } from 'react';
import Skeleton from '@/components/ui/Skeleton';
import { slotsApi } from '@/lib/slots.api';
import { bookingsApi } from '@/lib/bookings.api';
import SlotDayPicker from './SlotDayPicker';
import SlotCard from './SlotCard';
import { useToast } from '@/components/ui/Toast';
import HostSlotAdmin from './HostSlotAdmin';
import { useAuth } from '@/features/auth/auth.context';

function todayLocal() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function SlotsPage() {
  const [date, setDate] = useState(todayLocal());
  const [state, setState] = useState('loading');
  const [slots, setSlots] = useState([]);
  const [bookingIdLoading, setBookingIdLoading] = useState(null);
  const toast = useToast();
  const { user } = useAuth();

  const load = async () => {
    try {
      setState('loading');
      const data = await slotsApi.list(date);
      setSlots(Array.isArray(data) ? data : []);
      setState('ready');
    } catch {
      setState('error');
    }
  };

  useEffect(() => { load(); }, [date]);

  const onBook = async (slot) => {
    const id = slot.id || slot._id;
    try {
      setBookingIdLoading(id);
      await bookingsApi.create({ slotId: id });
      toast.show('Booking created successfully', 'success');
      // Optimistic UI: decrease available seats locally
      setSlots((prev) => prev.map(s =>
        (s.id || s._id) === id
          ? { ...s, left: Math.max(0, (Number(s.left ?? s.free ?? s.available ?? 0) - 1)) }
          : s
      ));
    } catch (e) {
      toast.show(e.message || 'Failed to create booking', 'error');
    } finally {
      setBookingIdLoading(null);
    }
  };

  return (
    <div>
      {/* Ribbon */}
      <div className="rounded-[var(--radius)] p-6 bg-[var(--card)] border qr-hero">
        <SlotDayPicker value={date} onChange={setDate} />
      </div>

      {/* States */}
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
          <>
            <div className="card p-6 mt-6">No slots available for this day.</div>
            {(user?.role === 'host') && (
              <HostSlotAdmin date={date} onCreated={load} />
            )}
          </>
        )
      )}
    </div>
  );
}
