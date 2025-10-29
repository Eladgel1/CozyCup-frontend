import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';

const LS_KEY = 'cozy.wallet.local';

function fmtMoney(cents) {
  const v = Number(cents || 0) / 100;
  return `$${v.toFixed(2)}`;
}
function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function readLocalBalance() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return 0;
    const obj = JSON.parse(raw);
    return Number(obj?.balanceCents ?? 0);
  } catch {
    return 0;
  }
}

export default function PassCard({ balanceCents = 0, expiresAt, className = '' }) {
  // Keep a resilient display value:
  const [displayCents, setDisplayCents] = useState(Number(balanceCents || 0));

  // Update when prop changes
  useEffect(() => {
    setDisplayCents(Number(balanceCents || 0));
  }, [balanceCents]);

  // Fallback sync from localStorage (helps in cases the prop lags behind)
  useEffect(() => {
    const syncFromLocal = () => {
      const local = readLocalBalance();
      // Update only if different to avoid unnecessary renders
      if (Number.isFinite(local) && local !== displayCents) {
        setDisplayCents(local);
      }
    };

    // Initial pull once mounted
    syncFromLocal();

    // Listen to tab changes & storage updates (storage fires across tabs)
    const onStorage = (e) => {
      if (e.key === LS_KEY) syncFromLocal();
    };
    const onVis = () => document.visibilityState === 'visible' && syncFromLocal();

    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVis);

    return () => {
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [displayCents]);

  return (
    <Card className={className}>
      <Card.Body className="flex items-center justify-between">
        <div>
          <div className="text-sm muted">Balance</div>
          <div className="text-2xl font-semibold" aria-live="polite">
            {fmtMoney(displayCents)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm muted">Pass expiry</div>
          <div className="font-medium">{fmtDate(expiresAt)}</div>
        </div>
      </Card.Body>
    </Card>
  );
}
