export default function Button({ as: As = 'button', variant = 'solid', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center px-4 py-2 rounded-[var(--radius)] transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--ring)]';
  const variants = {
    solid:   'bg-[var(--brand)] text-white hover:bg-[var(--brand-2)]',
    outline: 'border border-[var(--brand)] text-[var(--brand)] hover:bg-[var(--brand)] hover:text-white',
    ghost:   'text-[var(--text)] hover:bg-black/5',
  };
  return <As className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
