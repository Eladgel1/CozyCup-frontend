import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import { useCart } from './cart.context';
import { useEffect, useMemo, useState } from 'react';
import { pickupApi } from '@/lib/pickup.api';
import { ordersApi } from '@/lib/orders.api';
import { useToast } from '@/components/ui/Toast';

const hhmm = (iso) => {
  try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
};

export default function CartDrawer() {
  const { items, totals, inc, dec, remove, clear, open, setOpen } = useCart();
  const [windows, setWindows] = useState([]);
  const [winId, setWinId] = useState('');
  const [placing, setPlacing] = useState(false);
  const [notes, setNotes] = useState('');
  const toast = useToast();

  const subtotal = useMemo(() => totals.sum, [totals.sum]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const list = await pickupApi.list();
        // normalize list in case API returns {items: [...]}
        const arr = Array.isArray(list) ? list : (list?.items || []);
        setWindows(arr);
        if (!winId && arr.length) setWinId(arr[0].id || arr[0]._id);
      } catch {
        setWindows([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const placeOrder = async () => {
    try {
      if (!items.length) throw new Error('Your cart is empty.');
      if (!winId) throw new Error('Please select a pickup window.');
      setPlacing(true);

      await ordersApi.create({
        items,
        pickupWindowId: winId,
        notes,
      });

      // optimistic: decrease remaining (or increase bookedCount)
      setWindows((prev) => prev.map((w) => {
        const id = w.id || w._id;
        if (id !== winId) return w;
        if (typeof w.remaining === 'number') {
          return { ...w, remaining: Math.max(0, w.remaining - 1) };
        }
        const booked = Number(w.bookedCount ?? 0) + 1;
        return { ...w, bookedCount: booked };
      }));

      toast.show('Order placed successfully!', 'success');
      clear();
      setOpen(false);
    } catch (e) {
      const code = e?.status || e?.code;
      const msg = code === 409
        ? 'This pickup window is full. Please choose another window.'
        : code === 400
          ? 'Invalid order. Please review your cart and window.'
          : (e.message || 'Failed to place order');
      toast.show(msg, 'error');
    } finally {
      setPlacing(false);
    }
  };

  const titleNode = (
    <div className="flex items-center gap-2">
      <img src="/src/assets/icons/cart.svg" alt="" className="w-5 h-5" />
      <span>Your Cart</span>
    </div>
  );

  return (
    <Drawer open={open} onClose={() => setOpen(false)} title={titleNode} width={380}>
      {!items.length ? (
        <p className="muted">No items added yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((x) => (
            <li key={x.id} className="flex items-center gap-3">
              <img
                src={x.image || '/src/assets/images/menu/espresso.jpg'}
                alt={x.name}
                className="w-12 h-12 object-cover radius-sm"
              />
              <div className="flex-1">
                <div className="font-medium">{x.name}</div>
                <div className="text-sm muted">
                  ${(Number(x.price || 0) * x.qty).toFixed(2)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-ghost px-2 py-1" onClick={() => dec(x.id)}>-</button>
                <span className="w-6 text-center">{x.qty}</span>
                <button className="btn-ghost px-2 py-1" onClick={() => inc(x.id)}>+</button>
              </div>
              <button className="btn-ghost px-2 py-1" onClick={() => remove(x.id)}>🗑</button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="muted">Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>

        <select
          className="w-full border radius-sm px-3 py-2"
          value={winId}
          onChange={(e) => setWinId(e.target.value)}
        >
          <option value="">Select pickup window</option>
          {windows.map((w) => {
            const id = w.id || w._id;
            const start = hhmm(w.startAt || w.start || w.from);
            const end = hhmm(w.endAt || w.end || w.to);
            const left = (typeof w.remaining === 'number')
              ? Math.max(0, w.remaining)
              : Math.max(0, Number(w.capacity ?? 0) - Number(w.bookedCount ?? 0));
            return (
              <option key={id} value={id}>
                {start} – {end} ({left} left)
              </option>
            );
          })}
        </select>

        <textarea
          className="w-full border radius-sm px-3 py-2"
          rows={2}
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <Button
          className="w-full"
          loading={placing}
          disabled={!items.length || placing || !winId}
          onClick={placeOrder}
        >
          {placing ? 'Placing…' : `Place order (${totals.count})`}
        </Button>
      </div>
    </Drawer>
  );
}
