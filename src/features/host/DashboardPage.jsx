import { useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import { ordersApi } from '@/lib/orders.api';
import { useToast } from '@/components/ui/Toast';

function money(cents){ return `$${(Number(cents||0)/100).toFixed(2)}`; }

export default function HostDashboardPage() {
  const [state,setState] = useState('loading');
  const [orders,setOrders] = useState([]);
  const [summary,setSummary] = useState({});
  const toast = useToast();

  useEffect(() => {
    (async () => {
      try {
        setState('loading');
        const [list, sum] = await Promise.all([ordersApi.listHost(), ordersApi.daySummary()]);
        setOrders(list || []);
        setSummary(sum || {});
        setState('ready');
      } catch (e) {
        setState('error');
        toast.show(e?.message || 'Failed to load dashboard', 'error');
      }
    })();
  }, []);

  const kpis = useMemo(() => {
    const activeStatuses = new Set(['CONFIRMED','IN_PREP','READY']);
    const activeOrders = orders.filter(o => activeStatuses.has((o.status||'').toUpperCase())).length;

    const upcomingBookings = Array.isArray(summary?.bookings)
      ? summary.bookings.filter(b => (b.status||'').toUpperCase() === 'BOOKED').length
      : Number(summary?.bookingsBooked || 0);

    const revenueCents = Number(summary?.revenueCents ??
      orders.reduce((s,o)=> s + Number(o.totalCents ?? o.subtotalCents ?? 0), 0));

    const visitors = Number(summary?.visitors ??
      new Set(orders.map(o => String(o.customerId || ''))).size);

    return { activeOrders, upcomingBookings, revenueCents, visitors };
  }, [orders, summary]);

  return (
    <div className="space-y-6">
      {/* Header with subtle stripes + chef hat */}
      <div className="relative overflow-hidden rounded-[var(--radius)] border bg-[var(--card)] p-6">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.04)_10%,transparent_10%)] bg-[length:12px_12px] pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <img src="/src/assets/icons/chef-hat.svg" alt="" className="w-7 h-7 opacity-80" />
          <div>
            <h1 className="text-xl font-semibold">Host dashboard</h1>
            <div className="text-sm text-[var(--muted)]">Overview for today</div>
          </div>
        </div>
      </div>

      {state === 'loading' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Skeleton className="h-24" /><Skeleton className="h-24" />
          <Skeleton className="h-24" /><Skeleton className="h-24" />
        </div>
      )}

      {state === 'error' && <div className="card p-5">Failed to load dashboard.</div>}

      {state === 'ready' && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <KPI title="Active orders" value={kpis.activeOrders} />
            <KPI title="Upcoming bookings" value={kpis.upcomingBookings} />
            <KPI title="Today’s revenue" value={money(kpis.revenueCents)} />
            <KPI title="Visitors" value={kpis.visitors} />
          </div>

          {/* Mini note */}
          <div className="text-sm text-[var(--muted)]">
            Orders board → <a className="underline" href="/host/orders">manage statuses</a>, Scanner → <a className="underline" href="/host/scanner">check QR</a>
          </div>
        </>
      )}
    </div>
  );
}

function KPI({ title, value }) {
  return (
    <Card>
      <Card.Body>
        <div className="text-sm text-[var(--muted)]">{title}</div>
        <div className="mt-1 text-2xl font-semibold">{value}</div>
      </Card.Body>
    </Card>
  );
}
