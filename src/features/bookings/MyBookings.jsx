import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { bookingsApi } from '@/lib/bookings.api';
import { useToast } from '@/components/ui/Toast';
import QrDisplay from './QrDisplay';
import Skeleton from '@/components/ui/Skeleton';

export default function MyBookings() {
  const [state, setState] = useState('loading');
  const [rows, setRows] = useState([]);
  const [qrFor, setQrFor] = useState(null);
  const toast = useToast();

  const load = async () => {
    try {
      setState('loading');
      const data = await bookingsApi.mine();
      setRows(Array.isArray(data) ? data : (data?.bookings || []));
      setState('ready');
    } catch {
      setState('error');
    }
  };

  useEffect(() => { load(); }, []);

  const onCancel = async (booking) => {
    try {
      await bookingsApi.cancel(booking.id || booking._id);
      toast.show('Booking canceled', 'success');
      load();
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
            {rows.map((b) => (
              <Card key={b.id || b._id}>
                <Card.Body className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Booking #{(b.code || b.id || b._id)?.toString().slice(-6)}</div>
                    <div className="muted text-sm">
                      {b.date || b.day || ''} {b.start || ''}{b.end ? `–${b.end}` : ''}
                      {b.status ? ` · ${b.status}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="soft" onClick={() => setQrFor(b)}>QR</Button>
                    <Button variant="outline" color="danger" onClick={() => onCancel(b)}>Cancel</Button>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        ) : (
          <div className="card p-6">No bookings yet.</div>
        )
      )}

      {/* QR token modal (טקסט זמני) */}
      <QrDisplay booking={qrFor} onClose={() => setQrFor(null)} />
    </div>
  );
}
