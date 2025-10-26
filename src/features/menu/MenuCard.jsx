import Button from '@/components/ui/Button';

const FALLBACKS = {
  coffee: '/src/assets/images/menu/espresso.jpg',
  latte: '/src/assets/images/menu/latte.jpg',
  cappuccino: '/src/assets/images/menu/cappuccino.jpg',
  flatwhite: '/src/assets/images/menu/flatwhite.jpg',
  mocha: '/src/assets/images/menu/mocha.jpg',
  iced: '/src/assets/images/menu/iced_latte.jpg',
  tea: '/src/assets/images/menu/earlgrey.jpg',
  pastry: '/src/assets/images/menu/croissant.jpg',
  muffin: '/src/assets/images/menu/muffin.jpg',
  banana: '/src/assets/images/menu/banana_bread.jpg',
  affogato: '/src/assets/images/menu/affogato.jpg',
};

function pickFallback(name = '', category = '') {
  const n = String(name).toLowerCase();
  const c = String(category).toLowerCase();

  if (n.includes('latte')) return FALLBACKS.latte;
  if (n.includes('cappuccino')) return FALLBACKS.cappuccino;
  if (n.includes('flat white')) return FALLBACKS.flatwhite;
  if (n.includes('mocha')) return FALLBACKS.mocha;
  if (n.includes('iced')) return FALLBACKS.iced;
  if (n.includes('affogato')) return FALLBACKS.affogato;
  if (n.includes('muffin')) return FALLBACKS.muffin;
  if (n.includes('banana')) return FALLBACKS.banana;
  if (n.includes('croissant') || c.startsWith('pastry')) return FALLBACKS.pastry;
  if (c === 'tea') return FALLBACKS.tea;
  return FALLBACKS.coffee; // default
}

export default function MenuCard({ item, onAdd }) {
  const src = item.image && item.image.trim() ? item.image : pickFallback(item.name, item.category);

  return (
    <div className="card p-3 hover:shadow transition">
      <img
        src={src}
        alt={item.name}
        loading="lazy"
        className="rounded-[var(--radius)] w-full h-40 object-cover"
        onError={(e) => { e.currentTarget.src = pickFallback(item.name, item.category); }}
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
