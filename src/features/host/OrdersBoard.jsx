import { useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { ordersApi } from '@/lib/orders.api';
import { useToast } from '@/components/ui/Toast';

const COLUMNS = [
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'IN_PREP',   label: 'In prep' },
  { key: 'READY',     label: 'Ready' },
  { key: 'PICKED_UP', label: 'Picked up' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

const FLOW = ['CONFIRMED','IN_PREP','READY','PICKED_UP'];

export default function HostOrdersBoard() {
  const [state,setState] = useState('loading');
  const [orders,setOrders] = useState([]);
  const toast = useToast();

  const load = async () => {
    try {
      setState('loading');
      const list = await ordersApi.listHost();
      setOrders(list || []);
      setState('ready');
    } catch (e) {
      setState('error');
      toast.show(e?.message || 'Failed to load orders', 'error');
    }
  };

  useEffect(() => { load(); }, []);

  const byStatus = useMemo(() => {
    const g = Object.fromEntries(COLUMNS.map(c => [c.key, []]));
    for (const o of orders) {
      const k = (o.status || 'CONFIRMED').toUpperCase();
      (g[k] || (g[k]=[])).push(o);
    }
    return g;
  }, [orders]);

  const advance = async (o) => {
    const curr = (o.status || '').toUpperCase();
    const idx = FLOW.indexOf(curr);
    const next = idx >= 0 && idx < FLOW.length - 1 ? FLOW[idx + 1] : null;
    if (!next) return;
    try {
      await ordersApi.updateStatus(o._id || o.id, next);
      toast.show(`Moved to ${next}`, 'success');
      await load();
    } catch (e) {
      toast.show(e?.message || 'Failed to advance', 'error');
    }
  };

  const back = async (o) => {
    const curr = (o.status || '').toUpperCase();
    const idx = FLOW.indexOf(curr);
    const prev = idx > 0 ? FLOW[idx - 1] : null;
    if (!prev) return;
    try {
      await ordersApi.updateStatus(o._id || o.id, prev);
      toast.show(`Moved to ${prev}`, 'success');
      await load();
    } catch (e) {
      toast.show(e?.message || 'Failed to move back', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <img src="/src/assets/icons/chef-hat.svg" alt="" className="w-6 h-6 opacity-80" />
        <h1 className="text-xl font-semibold">Orders board</h1>
      </div>

      {state === 'loading' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          <Skeleton className="h-[420px]" /><Skeleton className="h-[420px]" />
          <Skeleton className="h-[420px]" /><Skeleton className="h-[420px]" />
          <Skeleton className="h-[420px]" />
        </div>
      )}

      {state === 'error' && <div className="card p-5">Failed to load board.</div>}

      {state === 'ready' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          {COLUMNS.map(col => (
            <Card key={col.key} className="flex flex-col">
              <Card.Header className="font-semibold">{col.label}</Card.Header>
              <Card.Body className="space-y-3 overflow-auto">
                {byStatus[col.key].length === 0 ? (
                  <div className="muted text-sm">No orders</div>
                ) : (
                  byStatus[col.key].map(o => <OrderItem key={o._id || o.id} order={o} onAdvance={()=>advance(o)} onBack={()=>back(o)} />)
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderItem({ order, onAdvance, onBack }) {
  const id = order._id || order.id;
  const time = order.windowStartAt || order.createdAt;
  const sum = order.totalCents ?? order.subtotalCents ?? 0;

  return (
    <div className="rounded border p-3 bg-[var(--card)]">
      <div className="text-sm font-medium mb-1">#{String(id).slice(-6)}</div>
      <div className="muted text-xs mb-2">{time ? new Date(time).toLocaleString() : '—'}</div>
      <ul className="text-sm mb-2 list-disc pl-5">
        {(order.items || []).map((it, i) => (
          <li key={i}>{it.name} ×{it.quantity ?? it.qty ?? 1}</li>
        ))}
      </ul>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">${(Number(sum)/100).toFixed(2)}</span>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={onBack}>Back</Button>
          <Button size="sm" onClick={onAdvance}>Advance</Button>
        </div>
      </div>
    </div>
  );
}
