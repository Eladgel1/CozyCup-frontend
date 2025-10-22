import { useEffect, useMemo, useState } from 'react';
import Skeleton from '@/components/ui/Skeleton';
import MenuCard from './MenuCard';
import MenuFilters from './MenuFilters';
import CartDrawer from './CartDrawer';
import { menuApi } from '@/lib/menu.api';
import { useCart } from './cart.context';

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [state, setState] = useState('loading');
  const [filter, setFilter] = useState({ category: 'all', query: '' });
  const { add } = useCart();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await menuApi.list();
        if (mounted) {
          setItems(Array.isArray(data) ? data : (data?.items || []));
          setState('ready');
        }
      } catch {
        if (mounted) setState('error');
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    let arr = items;
    if (filter.category && filter.category !== 'all') {
      arr = arr.filter((x) => (x.category || '').toLowerCase() === filter.category.toLowerCase());
    }
    if (filter.query) {
      const q = filter.query.toLowerCase();
      arr = arr.filter((x) => x.name?.toLowerCase().includes(q) || x.description?.toLowerCase().includes(q));
    }
    return arr;
  }, [items, filter]);

  return (
    <div>
      {/* Hero bar for menu */}
      <div className="hero-bg rounded-[var(--radius)] p-10 text-white">
        <h1 className="text-3xl font-semibold tracking-tight drop-shadow">Our Menu</h1>
        <p className="mt-2 opacity-90">Pick your favorite and we will prepare it fresh.</p>
      </div>

      {/* Filters */}
      <div className="mt-6">
        <MenuFilters items={items} onFilter={(f) => setFilter((p) => ({ ...p, ...f }))} />
      </div>

      {/* Grid */}
      {state === 'loading' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56" />)}
        </div>
      )}

      {state === 'error' && (
        <div className="card p-6 mt-6">Failed to load menu. Please try again.</div>
      )}

      {state === 'ready' && (
        <>
          {!filtered.length ? (
            <div className="card p-6 mt-6">No items match your filters.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {filtered.map((it) => (
                <MenuCard
                  key={it.id || it._id}
                  item={{
                    id: it.id || it._id,
                    name: it.name,
                    description: it.description,
                    price: Number(it.price ?? it.unitPrice ?? 0),
                    image: it.imageUrl,
                    category: it.category || 'General',
                  }}
                  onAdd={add}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
