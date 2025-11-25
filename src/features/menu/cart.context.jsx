import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'cozycup_cart_v1';

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) { console.log(e); }
}

const CartCtx = createContext(null);

export function CartProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(() => loadPersisted());

  const totals = useMemo(() => {
    const count = items.reduce((s, x) => s + x.qty, 0);
    const sum = items.reduce((s, x) => s + Number(x.price || 0) * x.qty, 0);
    return { count, sum };
  }, [items]);

  useEffect(() => {
    persist(items);
  }, [items]);

  const add = (item) => {
    setItems((prev) => {
      const id = item.id;
      const idx = prev.findIndex((x) => x.id === id);
      if (idx >= 0) {
        const clone = [...prev];
        clone[idx] = { ...clone[idx], qty: clone[idx].qty + 1 };
        return clone;
        }
      return [...prev, { id, name: item.name, price: Number(item.price || 0), image: item.image, qty: 1 }];
    });
    setOpen(true);
  };

  const inc = (id) => setItems((prev) =>
    prev.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x))
  );

  const dec = (id) => setItems((prev) =>
    prev
      .map((x) => (x.id === id ? { ...x, qty: Math.max(1, x.qty - 1) } : x))
      .filter((x) => x.qty > 0)
  );

  const remove = (id) => setItems((prev) => prev.filter((x) => x.id !== id));
  const clear = () => setItems([]);

  const value = { items, totals, add, inc, dec, remove, clear, open, setOpen };
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export const useCart = () => useContext(CartCtx);
