import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import { walletApi } from '@/lib/wallet.api';
import { useToast } from '@/components/ui/Toast';

const fmtMoney = (cents) => `$${(Number(cents || 0) / 100).toFixed(2)}`;

export default function PurchasePassModal({ open, onClose, onPurchased }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [list, setList] = useState([]);
  const [selectedId, setSelectedId] = useState('');

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        const pkgs = await walletApi.packages();
        setList(pkgs);
        if (!selectedId && pkgs.length) setSelectedId(pkgs[0]._id || pkgs[0].id);
      } catch (e) {
        toast.show(e?.message || 'Failed to load packages', 'error');
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      setList([]);
      setSelectedId('');
      setLoading(false);
      setPlacing(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const selected = useMemo(
    () => list.find((p) => (p._id || p.id) === selectedId),
    [list, selectedId]
  );

  const submit = async () => {
    if (!selected) {
      toast.show('Please select a package', 'error');
      return;
    }
    try {
      setPlacing(true);
      await walletApi.purchase({ packageId: selected._id || selected.id, paymentMethod: 'CASH' });
      toast.show('Purchase completed successfully', 'success');
      onPurchased?.(); // refresh wallet & history
      onClose?.();
    } catch (e) {
      toast.show(e?.message || 'Purchase failed', 'error');
    } finally {
      setPlacing(false);
    }
  };

  if (!open) return null;

  // Centered modal with internal scroll and safe size
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative flex w-full max-w-3xl max-h-[90vh] flex-col rounded-[var(--radius)] border bg-[var(--card)] shadow-lg">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-lg font-semibold">Purchase pass</h3>
          <button className="btn-ghost px-2" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="card p-4">Loading…</div>
          ) : !list.length ? (
            <div className="card p-4">No packages available.</div>
          ) : (
            <div className="space-y-3">
              {list.map((p) => {
                const id = p._id || p.id;
                const credits = Number(p.credits ?? 0);
                const priceCents = Number(p.priceCents ?? p.price ?? 0);
                const secondary =
                  credits > 0
                    ? `${credits} Drinks`
                    : `${(priceCents / 100).toFixed(0)} Dollars`;

                return (
                  <label key={id} className="flex items-start gap-3 card p-4 cursor-pointer">
                    <input
                      type="radio"
                      className="mt-1"
                      name="pkg"
                      checked={selectedId === id}
                      onChange={() => setSelectedId(id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-3">
                        {p.name}
                        <span className="muted">{fmtMoney(priceCents)}</span>
                      </div>
                      <div className="muted text-sm">{secondary}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={!selected || placing} loading={placing} onClick={submit}>
            {selected ? `Confirm ${fmtMoney(selected.priceCents ?? selected.price)}` : 'Purchase'}
          </Button>
        </div>
      </div>
    </div>
  );
}
