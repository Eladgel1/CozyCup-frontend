import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import { ordersApi } from '@/lib/orders.api';

const fmtDate = (iso) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const day = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${day} • ${time}`;
  } catch {
    return '';
  }
};

export default function OrdersPage() {
  const [state, setState] = useState('loading');
  const [rows, setRows] = useState([]);

  const load = async () => {
    try {
      setState('loading');
      const data = await ordersApi.mine();
      const arr = Array.isArray(data) ? data : (data?.orders || data?.items || []);
      setRows(arr);
      setState('ready');
    } catch {
      setState('error');
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="mt-2">
      <h1 className="text-2xl font-semibold mb-4">My orders</h1>

      {state === 'loading' && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      )}

      {state === 'error' && (
        <div className="card p-6">Failed to load orders.</div>
      )}

      {state === 'ready' && (
        rows.length ? (
          <div className="space-y-3">
            {rows.map((o) => {
              const id = o.id || o._id;
              const status = (o.status || '').toString();
              const start = o.windowStartAt || o.startAt;
              const end   = o.windowEndAt   || o.endAt;
              const totalCents = Number(o.totalCents ?? o.subtotalCents ?? 0);
              const total = (totalCents / 100).toFixed(2);
              const itemsLine = (o.items || [])
                .map(it => `${it.name || 'Item'} ×${it.quantity ?? 1}`)
                .join(', ');

              return (
                <Card key={id}>
                  <Card.Body className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">
                        {fmtDate(start)}{end ? ` – ${fmtDate(end).split('• ')[1]}` : ''}
                      </div>
                      <div className="muted text-sm">
                        {status}{itemsLine ? ` · ${itemsLine}` : ''}
                      </div>
                    </div>
                    <div className="font-medium">${total}</div>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="card p-6">No orders yet.</div>
        )
      )}
    </div>
  );
}
