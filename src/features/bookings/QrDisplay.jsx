import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { bookingsApi } from '@/lib/bookings.api';
import { useToast } from '@/components/ui/Toast';

export default function QrDisplay({ booking, onClose }) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!booking) return;
      try {
        setLoading(true);
        const t = await bookingsApi.qrToken(booking.id || booking._id);
        if (mounted) setToken(t || '');
      } catch {
        toast.show('Failed to fetch QR token', 'error');
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [booking]);

  if (!booking) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(token);
      toast.show('Token copied', 'success');
    } catch { /* noop */ }
  };

  return (
    <Modal open={!!booking} onClose={onClose} title="Booking QR Token">
      <p className="muted text-sm">
        Present this token at the café. (QR rendering will be added next.)
      </p>
      <div className="mt-3 p-3 border rounded-[var(--radius)] bg-black/5 select-all break-all">
        {loading ? 'Loading…' : (token || '—')}
      </div>
      <div className="mt-4 flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Close</Button>
        <Button onClick={copy} disabled={!token}>Copy</Button>
      </div>
    </Modal>
  );
}
