export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-black/10 rounded-[var(--radius)] ${className}`} />;
}
