export default function OrderSummary({ data }) {
  if (!data) return null;
  const id = data.orderId || data.id || '—';
  const eta = data.eta || null;
  const status = data.status || 'Waiting';
  return (
    <div className="card p-4 mt-4">
      <h3 className="font-semibold">Order Summary</h3>
      <div className="muted text-sm mt-1">Order ID: {id}</div>
      <div className="muted text-sm">{eta ? `ETA: ${eta}` : null}</div>
      <div className="muted text-sm">Status: {status}</div>
    </div>
  );
}
