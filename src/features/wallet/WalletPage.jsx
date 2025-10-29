import { useEffect, useMemo, useState } from 'react';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { walletApi } from '@/lib/wallet.api';
import PassCard from './PassCard';
import PurchasePassModal from './PurchasePassModal';
import { useToast } from '@/components/ui/Toast';

function money(c) {
  return `$${(Number(c || 0) / 100).toFixed(2)}`;
}

export default function WalletPage() {
  const [state, setState] = useState('loading');
  const [wallet, setWallet] = useState({ balanceCents: 0, expiresAt: null });
  const [historyRaw, setHistoryRaw] = useState([]);
  const [packages, setPackages] = useState([]);
  const [openBuy, setOpenBuy] = useState(false);
  const toast = useToast();

  const load = async () => {
    try {
      setState('loading');
      const [w, h, pkgs] = await Promise.all([
        walletApi.me(),
        walletApi.history(),
        walletApi.packages(),
      ]);

      const walletObj = w || { balanceCents: 0, expiresAt: null };
      setWallet({
        balanceCents: Number(walletObj.balanceCents || 0),
        expiresAt: walletObj.expiresAt || null,
      });
      setHistoryRaw(Array.isArray(h) ? h : []);
      setPackages(Array.isArray(pkgs) ? pkgs : []);
      setState('ready');
    } catch (e) {
      setState('error');
      toast.show(e?.message || 'Failed to load wallet', 'error');
    }
  };

  useEffect(() => { load(); }, []);

  // map packages by id for pretty history lines
  const pkgById = useMemo(() => {
    const m = new Map();
    for (const p of packages) {
      const id = p.id || p._id;
      if (id) m.set(id, p);
    }
    return m;
  }, [packages]);

  const history = useMemo(() => {
    const rows = (historyRaw || []).map((row) => {
      const id = row.id || row._id;
      const when = row.createdAt || row.date || row.timestamp;
      const pkgId = row.packageId || row.package?.id || row.package?._id;
      const pkg = pkgId ? pkgById.get(pkgId) : null;

      const amountCents =
        row.amountCents ??
        row.deltaCents ??
        (pkg?.priceCents ?? pkg?.price ?? 0);

      let type = (row.type || '').toString().toUpperCase();
      if (!type) {
        const credits = Number(pkg?.credits ?? 0);
        type = credits > 0 ? 'PASS PURCHASE' : 'CREDIT TOP-UP';
      }

      const note = row.note || row.description || (pkg ? pkg.name : '');

      return { id, createdAt: when, type, amountCents, note };
    });

    rows.sort((a, b) => (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0));
    return rows;
  }, [historyRaw, pkgById]);

  const onPurchased = async () => {
    setOpenBuy(false);
    await load(); // refresh balance & history after local/server update
  };

  return (
    <div>
      {/* Hero */}
      <div className="hero-bg rounded-[var(--radius)] p-10 text-white">
        <h1 className="text-3xl font-semibold tracking-tight drop-shadow">Wallet</h1>
        <p className="mt-2 opacity-90">Manage passes and top up your balance.</p>
      </div>

      {state === 'loading' && (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-48" />
        </div>
      )}
      {state === 'error' && (
        <div className="card p-6 mt-6">Failed to load wallet.</div>
      )}

      {state === 'ready' && (
        <>
          {/* Balance + Actions */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PassCard
              balanceCents={wallet?.balanceCents}
              expiresAt={wallet?.expiresAt}
              className="sm:col-span-2"
            />
            <Card>
              <Card.Body className="flex items-center justify-between">
                <div>
                  <div className="text-sm muted">Actions</div>
                  <div className="font-medium">Buy a pass / Top up</div>
                </div>
                <Button onClick={() => setOpenBuy(true)}>Purchase</Button>
              </Card.Body>
            </Card>
          </div>

          {/* History */}
          <div className="mt-6">
            <Card>
              <Card.Header>
                <div className="font-semibold">Recent activity</div>
              </Card.Header>
              <Card.Body>
                {!history.length ? (
                  <div className="muted">No activity yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left muted">
                          <th className="py-2 pr-3">Date</th>
                          <th className="py-2 pr-3">Type</th>
                          <th className="py-2 pr-3">Amount</th>
                          <th className="py-2">Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((row) => (
                          <tr key={row.id} className="border-t">
                            <td className="py-2 pr-3">
                              {row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}
                            </td>
                            <td className="py-2 pr-3">{row.type}</td>
                            <td className="py-2 pr-3">{money(row.amountCents)}</td>
                            <td className="py-2">{row.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        </>
      )}

      {/* Purchase modal */}
      <PurchasePassModal
        open={openBuy}
        onClose={() => setOpenBuy(false)}
        onPurchased={onPurchased}
      />
    </div>
  );
}
