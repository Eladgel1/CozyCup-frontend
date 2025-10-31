import { useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { ordersApi } from '@/lib/orders.api';
import { bookingsApi } from '@/lib/bookings.api';
import { useToast } from '@/components/ui/Toast';
import { Link } from 'react-router-dom';

const money = (c) => `$${(Number(c || 0) / 100).toFixed(2)}`;

const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  const day = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${day} • ${time}`;
};

export default function HistoryPage() {
  const [tab, setTab] = useState('orders');
  const [state, setState] = useState('loading');
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const toast = useToast();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setState('loading');
        const [o, b] = await Promise.all([
          ordersApi.mine().catch(() => []),
          bookingsApi.mine().catch(() => []),
        ]);
        if (!mounted) return;
        setOrders(Array.isArray(o) ? o : (o?.orders || o?.items || []));
        setBookings(Array.isArray(b) ? b : (b?.bookings || []));
        setState('ready');
      } catch (e) {
        if (!mounted) return;
        setState('error');
        toast.show(e?.message || 'Failed to load history', 'error');
      }
    })();
    return () => { mounted = false; };
  }, []);

  // normalize
  const rowsOrders = useMemo(() => {
    return (orders || [])
      .map(o => ({
        id: o.id || o._id,
        status: (o.status || '').toString().toUpperCase() || '—',
        when: o.windowStartAt || o.createdAt || o.date,
        whenEnd: o.windowEndAt || o.updatedAt,
        totalCents: o.totalCents ?? o.subtotalCents ?? 0,
      }))
      .sort((a, b) => new Date(b.when) - new Date(a.when));
  }, [orders]);

  const rowsBookings = useMemo(() => {
    return (bookings || [])
      .map(b => ({
        id: b.id || b._id,
        status: (b.status || '').toString().toUpperCase() || '—',
        when: b.slotStartAt,
        whenEnd: b.slotEndAt,
      }))
      .sort((a, b) => new Date(b.when) - new Date(a.when));
  }, [bookings]);

  return (
    <div>
      {/* hero */}
      <div className="hero-bg rounded-[var(--radius)] p-10 text-white">
        <h1 className="text-3xl font-semibold tracking-tight drop-shadow">History</h1>
        <p className="mt-2 opacity-90">Your past orders and bookings.</p>
      </div>

      {/* tabs */}
      <div className="mt-6">
        <Tabs
          tabs={[
            { label: 'Orders', value: 'orders' },
            { label: 'Bookings', value: 'bookings' },
          ]}
          onChange={(v) => setTab(v)}
        />
      </div>

      {/* content */}
      {state === 'loading' && (
        <div className="mt-6 space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      )}

      {state === 'error' && (
        <div className="card p-6 mt-6">Failed to load history.</div>
      )}

      {state === 'ready' && (
        <div className="mt-6">
          <Card>
            <Card.Header>
              <div className="font-semibold">
                {tab === 'orders' ? 'My orders' : 'My bookings'}
              </div>
            </Card.Header>
            <Card.Body>
              {tab === 'orders' ? (
                rowsOrders.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left muted">
                          <th className="py-2 pr-3">Date</th>
                          <th className="py-2 pr-3">Status</th>
                          <th className="py-2 pr-3">Amount</th>
                          <th className="py-2">Link</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rowsOrders.map(r => (
                          <tr key={r.id} className="border-t">
                            <td className="py-2 pr-3">
                              {fmtDate(r.when)}{r.whenEnd ? ` – ${fmtDate(r.whenEnd).split(' • ')[1]}` : ''}
                            </td>
                            <td className="py-2 pr-3">{r.status}</td>
                            <td className="py-2 pr-3">{money(r.totalCents)}</td>
                            <td className="py-2">
                              <Link to="/orders" className="link">Open orders</Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyOrders />
                )
              ) : (
                rowsBookings.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left muted">
                          <th className="py-2 pr-3">Date</th>
                          <th className="py-2 pr-3">Status</th>
                          <th className="py-2 pr-3">Amount</th>
                          <th className="py-2">Link</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rowsBookings.map(r => (
                          <tr key={r.id} className="border-t">
                            <td className="py-2 pr-3">
                              {fmtDate(r.when)}{r.whenEnd ? ` – ${fmtDate(r.whenEnd).split(' • ')[1]}` : ''}
                            </td>
                            <td className="py-2 pr-3">{r.status}</td>
                            <td className="py-2 pr-3 text-[var(--muted)]">Included in pass</td>
                            <td className="py-2">
                              <Link to="/bookings" className="link">Open bookings</Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyBookings />
                )
              )}
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
}

function EmptyOrders() {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="muted">No orders yet.</div>
      <Link to="/menu"><Button>Go to menu</Button></Link>
    </div>
  );
}

function EmptyBookings() {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="muted">No bookings yet.</div>
      <Link to="/bookings"><Button>Find a seat</Button></Link>
    </div>
  );
}
