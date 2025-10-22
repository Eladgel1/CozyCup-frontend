import Button from '@/components/ui/Button';

export default function MenuCard({ item, onAdd }) {
  const imgFallback = item.category?.toLowerCase?.().includes('pastry')
    ? '/src/assets/images/menu/croissant.jpg'
    : (item.name?.toLowerCase?.().includes('latte')
        ? '/src/assets/images/menu/latte.jpg'
        : '/src/assets/images/menu/espresso.jpg');

  return (
    <div className="card p-3 hover:shadow transition">
      <img
        src={item.image || imgFallback}
        alt={item.name}
        loading="lazy"
        className="rounded-[var(--radius)] w-full h-40 object-cover"
      />
      <div className="mt-3">
        <h3 className="font-semibold">{item.name}</h3>
        {item.description && <p className="muted text-sm mt-1">{item.description}</p>}
        <div className="flex items-center justify-between mt-2">
          <span className="font-medium">${Number(item.price || 0).toFixed(2)}</span>
          <Button onClick={() => onAdd(item)} className="px-3 py-1">Add</Button>
        </div>
      </div>
    </div>
  );
}
