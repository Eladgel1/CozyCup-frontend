import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { tokenStore } from '@/lib/token.store';

function fmtMoney(cents) {
  const v = Number(cents || 0) / 100;
  return `$${v.toFixed(2)}`;
}
function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function decodeJwtSub(at) {
  try {
    if (!at || typeof at !== 'string') return null;
    const parts = at.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
    return payload.sub || payload.userId || payload.uid || payload.id || null;
  } catch {
    return null;
  }
}
function currentUserId() {
  const at = tokenStore.getAccessToken?.();
  const sub = decodeJwtSub(at);
  if (sub) return String(sub);
  try {
    const raw = localStorage.getItem('auth');
    if (raw) {
      const obj = JSON.parse(raw);
      const id = obj?.user?.id || obj?.user?._id;
      if (id) return String(id);
    }
  } catch (e) { console.log(e); }
  return 'anon';
}
function storageKey() {
  return `cozy.wallet.${currentUserId()}`;
}

function readLocalBalance() {
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return 0;
    const obj = JSON.parse(raw);
    return Number(obj?.balanceCents ?? 0);
  } catch {
    return 0;
  }
}

export default function PassCard({ balanceCents = 0, expiresAt, className = '' }) {
  // Keep a resilient display value (per-user)
  const [displayCents, setDisplayCents] = useState(Number(balanceCents || 0));

  // Update when prop changes
  useEffect(() => {
    setDisplayCents(Number(balanceCents || 0));
  }, [balanceCents]);

  // Fallback sync from user-scoped localStorage (covers server lag / refreshes)
  useEffect(() => {
    const syncFromLocal = () => {
      const local = readLocalBalance();
      if (Number.isFinite(local) && local !== displayCents) {
        setDisplayCents(local);
      }
    };

    // Initial pull
    syncFromLocal();

    // Listen to storage & tab visibility changes
    const onStorage = (e) => {
      if (e.key === storageKey()) syncFromLocal();
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
