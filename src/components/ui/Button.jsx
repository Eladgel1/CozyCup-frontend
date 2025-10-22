import { cx } from '@/lib/cx';
import Spinner from './Spinner.jsx';

export default function Button({
  as: As = 'button',
  variant = 'solid',
  color = 'brand',
  size = 'md',
  loading = false,
  leftIcon = null,
  rightIcon = null,
  fullWidth = false,
  className = '',
  disabled,
  children,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center rounded-[var(--radius)] transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-50 disabled:cursor-not-allowed';

  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5',
  };

  const palette = {
    brand: {
      solid:   'bg-[var(--brand)] text-white hover:bg-[var(--brand-2)]',
      outline: 'border border-[var(--brand)] text-[var(--brand)] hover:bg-[var(--brand)] hover:text-white',
      ghost:   'text-[var(--text)] hover:bg-black/5',
      soft:    'bg-black/5 text-[var(--text)] hover:bg-black/10',
    },
    neutral: {
      solid:   'bg-slate-800 text-white hover:bg-slate-700',
      outline: 'border border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white',
      ghost:   'text-slate-800 hover:bg-black/5',
      soft:    'bg-black/5 text-slate-800 hover:bg-black/10',
    },
    success: {
      solid:   'bg-[var(--success)] text-white hover:brightness-95',
      outline: 'border border-[var(--success)] text-[var(--success)] hover:bg-[var(--success)] hover:text-white',
      ghost:   'text-[var(--success)] hover:bg-green-50',
      soft:    'bg-green-50 text-[var(--success)] hover:bg-green-100',
    },
    danger: {
      solid:   'bg-[var(--danger)] text-white hover:brightness-95',
      outline: 'border border-[var(--danger)] text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white',
      ghost:   'text-[var(--danger)] hover:bg-red-50',
      soft:    'bg-red-50 text-[var(--danger)] hover:bg-red-100',
    },
  };

  const cls = cx(
    base,
    sizes[size],
    palette[color][variant],
    fullWidth && 'w-full',
    loading && 'relative',
    className
  );

  if (As === 'button' && !('type' in props)) props.type = 'button';

  return (
    <As
      className={cls}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <Spinner />
          <span className="opacity-90">{children || 'Loading…'}</span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-2">
          {leftIcon}
          <span>{children}</span>
          {rightIcon}
        </span>
      )}
    </As>
  );
}
