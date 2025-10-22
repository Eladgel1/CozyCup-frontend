import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import { useCart } from './cart.context';
import { useEffect, useState } from 'react';
import { pickupApi } from '@/lib/pickup.api';
import { ordersApi } from '@/lib/orders.api';
import { useToast } from '@/components/ui/Toast';

export default function CartDrawer() {
  const { items, totals, inc, dec, remove, clear, open, setOpen } = useCart();
  const [windows, setWindows] = useState([]);
  const [winId, setWinId] = useState('');
  const [placing, setPlacing] = useState(false);
  const [notes, setNotes] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (open) {
      pickupApi.list()
        .then(setWindows)
        .catch(() => setWindows([]));
    }
  }, [open]);

  const placeOrder = async () => {
    try {
      if (!items.length) throw new Error('Cart is empty');
      if (!winId) throw new Error('Please select a pickup window');
      setPlacing(true);
      const payload = {
        items: items.map(({ id, name, price, qty }) => ({ id, name, price, qty })),
        pickupWindowId: winId,
        notes: notes?.trim() || undefined,
      };
      const data = await ordersApi.create(payload);
      toast.show('Order placed successfully!', 'success');
      clear();
      setOpen(false);
      console.debug('Order response:', data);
    } catch (e) {
      toast.show(e.message || 'Failed to place order', 'error');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <Drawer open={open} onClose={() => setOpen(false)} title="Your Cart" width={380}>
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
                <div className="text-sm muted">${(Number(x.price||0) * x.qty).toFixed(2)}</div>
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
          <span className="font-medium">${totals.sum.toFixed(2)}</span>
        </div>

        <select
          className="w-full border radius-sm px-3 py-2"
          value={winId}
          onChange={(e)=>setWinId(e.target.value)}
        >
          <option value="">Select pickup window</option>
          {windows.map((w) => (
            <option key={w.id || w._id} value={w.id || w._id}>
              {w.label || `${w.start ?? ''} - ${w.end ?? ''}`}
            </option>
          ))}
        </select>

        <textarea
          className="w-full border radius-sm px-3 py-2"
          rows={2}
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e)=>setNotes(e.target.value)}
        />

        <Button
          className="w-full"
          loading={placing}
          disabled={!items.length || placing}
          onClick={placeOrder}
        >
          {placing ? 'Placing…' : `Place order (${totals.count})`}
        </Button>
      </div>
    </Drawer>
  );
}
