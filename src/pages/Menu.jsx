import { Suspense } from 'react';
import MenuPage from '@/features/menu/MenuPage';

export default function Menu() {
  return (
    <Suspense fallback={<div className="container py-6">Loading menu…</div>}>
      <MenuPage />
    </Suspense>
  );
}
