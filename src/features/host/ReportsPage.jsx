import { useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { ordersApi } from '@/lib/orders.api';

function money(cents) {
  const n = Number(cents || 0);
  return `$${(n / 100).toFixed(2)}`;
}

function toCount(v) {
  if (Array.isArray(v)) return v.length;
  if (v && typeof v === 'object') {
    if (v.upcoming != null) return Number(v.upcoming) || 0;
    if (v.count != null) return Number(v.count) || 0;
    if (v.total != null) return Number(v.total) || 0;
    return Object.values(v).reduce((sum, x) => sum + (Number(x) || 0), 0);
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function ReportsPage() {
  const [state, setState] = useState('loading');
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setState('loading');
        const res = await ordersApi.daySummary();
        setData(res || {});
        setState('ready');
      } catch (e) {
        setState('error');
      }
    })();
  }, []);

  const summary = useMemo(() => {
    const s = data || {};

    const totalCents =
      s.totalCents ?? s.revenueCents ?? s.salesCents ?? 0;

    const orders =
      toCount(s.purchases);

    const bookings =
      toCount(s.bookings);

    const completed =
      toCount(s.completed ?? s.completedCount ?? s.done);

    const visitors =
      toCount(s.slots);

    const avgOrderValueCents =
      s.avgOrderValueCents ??
      (orders ? Math.round(totalCents / orders) : 0);

    const byStatus = s.byStatus || s.statuses || {};
    const topItems = s.topItems || [];

    return {
      totalCents,
      orders,
      bookings,
      completed,
      visitors,
      avgOrderValueCents,
      byStatus,
      topItems,
      generatedAt: s.generatedAt || new Date().toISOString(),
    };
  }, [data]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Day Summary</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => window.location.reload()} title="Refresh">
            Refresh
          </Button>
        </div>
      </div>

      {/* Loading / Error */}
      {state === 'loading' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      )}
      {state === 'error' && (
        <div className="card p-5 text-[var(--danger)]">Failed to load report.</div>
      )}

      {state === 'ready' && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <Kpi
              label="Today's revenue"
              value={money(summary.totalCents)}
              sub={`Avg: ${money(summary.avgOrderValueCents)}`}
            />
            <Kpi
              label="Orders"
              value={String(summary.orders)}
              sub={`${summary.completed} completed`}
            />
            <Kpi
              label="Bookings (upcoming)"
              value={String(summary.bookings)}
              sub="Seats & scheduling"
            />
            <Kpi
              label="Visitors"
              value={String(summary.visitors)}
              sub="Unique customers"
            />
          </div>

          {/* Status breakdown + top items */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <Card.Header>
                <div className="font-semibold">By status</div>
              </Card.Header>
              <Card.Body>
                {!Object.keys(summary.byStatus || {}).length ? (
                  <div className="muted">No data.</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left muted">
                        <th className="py-2 pr-3">Status</th>
                        <th className="py-2 pr-3">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(summary.byStatus).map(([k, v]) => (
                        <tr key={k} className="border-t">
                          <td className="py-2 pr-3">{k}</td>
                          <td className="py-2 pr-3">{toCount(v)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <div className="font-semibold">Top items</div>
              </Card.Header>
              <Card.Body>
                {!summary.topItems?.length ? (
                  <div className="muted">No items ranked yet.</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left muted">
                        <th className="py-2 pr-3">Item</th>
                        <th className="py-2 pr-3">Qty</th>
                        <th className="py-2 pr-3">Sales</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.topItems.map((x, i) => (
                        <tr key={`${x.id || x._id || i}`} className="border-t">
                          <td className="py-2 pr-3">{x.name || x.title || '—'}</td>
                          <td className="py-2 pr-3">{toCount(x.qty ?? x.quantity)}</td>
                          <td className="py-2 pr-3">{money(x.totalCents ?? 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card.Body>
            </Card>
          </div>

          <div className="text-right text-xs text-[var(--muted)]">
            Generated: {new Date(summary.generatedAt).toLocaleString()}
          </div>
        </>
      )}
    </div>
  );
}

function Kpi({ label, value, sub }) {
  return (
    <Card>
      <Card.Body className="flex items-center justify-between">
        <div>
          <div className="text-sm muted">{label}</div>
          <div className="text-2xl font-semibold">{value}</div>
        </div>
        <div className="text-right text-xs text-[var(--muted)]">{sub}</div>
      </Card.Body>
    </Card>
  );
}
