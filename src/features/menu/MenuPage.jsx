import { useEffect, useMemo, useState } from 'react';
import Skeleton from '@/components/ui/Skeleton';
import MenuCard from './MenuCard';
import MenuFilters from './MenuFilters';
import CartDrawer from './CartDrawer';
import { menuApi } from '@/lib/menu.api';
import { useCart } from './cart.context';

function toDisplayCategory(cat) {
  if (!cat) return 'General';
  const c = String(cat).toLowerCase();
  if (c === 'coffee') return 'Coffee';
  if (c === 'tea') return 'Tea';
  if (c.startsWith('pastry')) return 'Pastries';
  return cat[0].toUpperCase() + cat.slice(1);
}

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [state, setState] = useState('loading'); // loading | ready | error
  const [filter, setFilter] = useState({ category: 'all', query: '' });
  const { add } = useCart();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await menuApi.list();
        if (!mounted) return;
        const arr = Array.isArray(data) ? data : (data?.items || []);
        // normalize a bit to keep FE consistent
        const normalized = arr.map((x) => ({
          id: x.id || x._id,
          name: x.name,
          description: x.description ?? '',
          price: Number(x.price ?? x.unitPrice ?? 0),
          imageUrl: x.imageUrl || '',
          category: toDisplayCategory(x.category || 'General'),
          isActive: x.isActive !== false,
        })).filter((x) => x.isActive);
        setItems(normalized);
        setState('ready');
      } catch {
        if (mounted) setState('error');
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    let arr = items;
    // filter by category
    if (filter.category && filter.category !== 'all') {
      const want = String(filter.category).toLowerCase();
      arr = arr.filter((x) => String(x.category).toLowerCase() === want);
    }
    // search by query
    if (filter.query) {
      const q = filter.query.toLowerCase();
      arr = arr.filter((x) =>
        x.name?.toLowerCase().includes(q) ||
        x.description?.toLowerCase().includes(q) ||
        String(x.category).toLowerCase().includes(q)
      );
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
        <MenuFilters
          items={items}
          onFilter={(f) => setFilter((p) => ({ ...p, ...f }))}
        />
      </div>

      {/* Grid / states */}
      {state === 'loading' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-56" />)}
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
                  key={it.id}
                  item={{
                    id: it.id,
                    name: it.name,
                    description: it.description,
                    price: it.priceCents ? it.priceCents / 100 : Number(it.price ?? it.unitPrice ?? 0),
                    image: it.imageUrl,
                    category: it.category,
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
