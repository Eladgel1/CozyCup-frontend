import { cx } from '@/lib/cx';

function Root({ className = '', interactive = false, elevation = 1, onClick, children }) {
  const elev = {
    0: 'shadow-none',
    1: 'shadow',
    2: 'shadow-md',
  }[elevation] || 'shadow';
  return (
    <div
      className={cx(
        'bg-[var(--card)] border rounded-[var(--radius)]',
        elev,
        interactive && 'transition hover:shadow-md hover:translate-y-[-1px] cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function Header({ className = '', children }) {
  return <div className={cx('px-4 py-3 border-b', className)}>{children}</div>;
}
function Body({ className = '', children }) {
  return <div className={cx('p-4', className)}>{children}</div>;
}
function Footer({ className = '', children }) {
  return <div className={cx('px-4 py-3 border-t', className)}>{children}</div>;
}
function Title({ className = '', children }) {
  return <h3 className={cx('font-semibold', className)}>{children}</h3>;
}
function Description({ className = '', children }) {
  return <p className={cx('muted text-sm', className)}>{children}</p>;
}

const Card = Object.assign(Root, { Header, Body, Footer, Title, Description });

export default Card;
