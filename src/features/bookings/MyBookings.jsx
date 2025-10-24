import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { bookingsApi } from '@/lib/bookings.api';
import { useToast } from '@/components/ui/Toast';
import QrDisplay from './QrDisplay';
import Skeleton from '@/components/ui/Skeleton';
import { emit } from '@/lib/events';

const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const day = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${day} • ${time}`;
};

// try many common shapes coming from BE
const getStartISO = (b) =>
  b?.slot?.startAt ||
  b?.slotStartAt ||
  b?.startAt ||
  b?.start ||
  b?.slot?.from ||
  b?.from ||
  b?.time?.start ||
  b?.window?.from ||
  b?.dateStart ||
  b?.slot_start_at ||
  b?.createdAt ||
  null;

const getEndISO = (b) =>
  b?.slot?.endAt ||
  b?.slotEndAt ||
  b?.endAt ||
  b?.end ||
  b?.slot?.to ||
  b?.to ||
  b?.time?.end ||
  b?.window?.to ||
  b?.dateEnd ||
  b?.slot_end_at ||
  null;

export default function MyBookings() {
  const [state, setState] = useState('loading');
  const [rows, setRows] = useState([]);
  const [qrFor, setQrFor] = useState(null);
  const toast = useToast();

  const normalize = (list) => {
    const arr = Array.isArray(list) ? list : (list?.bookings || []);
    return arr.filter((b) => String(b.status || '').toLowerCase() !== 'cancelled');
  };

  const load = async () => {
    try {
      setState('loading');
      const data = await bookingsApi.mine();
      setRows(normalize(data));
      setState('ready');
    } catch {
      setState('error');
    }
  };

  useEffect(() => { load(); }, []);

  const onCancel = async (booking) => {
    try {
      await bookingsApi.cancel(booking.id || booking._id);
      setRows((prev) => prev.filter((b) => (b.id || b._id) !== (booking.id || booking._id)));
      const slotId = booking.slotId || booking.slot?.id || booking.slot?._id;
      if (slotId) emit('booking:cancelled', { slotId });
      toast.show('Booking canceled', 'success');
      await load();
    } catch (e) {
      toast.show(e.message || 'Failed to cancel', 'error');
    }
  };

  return (
    <div className="mt-6">
      {state === 'loading' && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      )}

      {state === 'error' && <div className="card p-6">Failed to load your bookings.</div>}

      {state === 'ready' && (
        rows.length ? (
          <div className="space-y-3">
            {rows.map((b) => {
              const id = b.id || b._id;
              const startISO = getStartISO(b);
              const endISO = getEndISO(b);

              const title = startISO
                ? `${fmtDate(startISO)}${endISO ? ` – ${fmtDate(endISO).split('• ')[1]}` : ''}`
                : 'Booking';

              const status = (b.status || 'BOOKED').toString().toUpperCase();
              const short = (b.code || id)?.toString().slice(-6);

              return (
                <Card key={id}>
                  <Card.Body className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{title}</div>
                      <div className="muted text-sm">
                        {status}{short ? ` · #${short}` : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="soft" onClick={() => setQrFor(b)}>QR</Button>
                      <Button variant="outline" color="danger" onClick={() => onCancel(b)}>Cancel</Button>
                    </div>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="card p-6">No bookings yet.</div>
        )
      )}

      <QrDisplay booking={qrFor} onClose={() => setQrFor(null)} />
    </div>
  );
}
