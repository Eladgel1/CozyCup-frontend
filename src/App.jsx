import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/auth.context';
import { useState } from 'react';
import ToastHost from '@/components/ui/Toast';

export default function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const baseLink =
    'px-3 py-2 radius-sm text-sm hover:bg-black/5 transition-colors';
  const activeLink = ({ isActive }) =>
    `${baseLink} ${isActive ? 'bg-black/10 font-medium' : ''}`;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="border-b bg-[var(--card)] sticky top-0 z-30">
        <div className="container py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/src/assets/icons/coffee-cup.svg"
              alt="CozyCup"
              className="w-6 h-6"
            />
            <NavLink to="/" className="text-lg font-semibold tracking-tight">
              CozyCup
            </NavLink>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={activeLink}>
              Home
            </NavLink>
            <NavLink to="/menu" className={activeLink}>
              Menu
            </NavLink>
            <NavLink to="/bookings" className={activeLink}>
              Bookings
            </NavLink>
            <NavLink to="/orders" className={activeLink}>
              Orders
            </NavLink>
            <NavLink to="/wallet" className={activeLink}>
              Wallet
            </NavLink>
            <NavLink to="/history" className={activeLink}>
              History
            </NavLink>

            {user?.role === 'host' && (
              <>
                <span className="mx-2 text-[var(--muted)]">|</span>
                <NavLink to="/host/dashboard" className={activeLink}>
                  Dashboard
                </NavLink>
                <NavLink to="/host/orders" className={activeLink}>
                  Orders Board
                </NavLink>
                <NavLink to="/host/scanner" className={activeLink}>
                  Scanner
                </NavLink>
                <NavLink to="/host/reports" className={activeLink}>
                  Reports
                </NavLink>
              </>
            )}

            <span className="mx-2 text-[var(--muted)]">|</span>
            {user ? (
              <button
                className="px-3 py-2 radius-sm text-sm hover:bg-black/5 transition-colors cursor-pointer"
                onClick={async () => {
                  await logout();
                  navigate('/login');
                }}
              >
                Sign out
              </button>
            ) : (
              <NavLink to="/login" className={activeLink}>
                Sign in
              </NavLink>
            )}
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden btn-ghost px-2 py-1 cursor-pointer"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            ☰
          </button>
        </div>

        {/* Mobile sheet */}
        {open && (
          <div className="md:hidden border-t bg-[var(--card)]">
            <div className="container py-2 flex flex-wrap gap-1">
              <NavLink
                to="/"
                end
                className={activeLink}
                onClick={() => setOpen(false)}
              >
                Home
              </NavLink>
              <NavLink
                to="/menu"
                className={activeLink}
                onClick={() => setOpen(false)}
              >
                Menu
              </NavLink>
              <NavLink
                to="/bookings"
                className={activeLink}
                onClick={() => setOpen(false)}
              >
                Bookings
              </NavLink>
              <NavLink
                to="/orders"
                className={activeLink}
                onClick={() => setOpen(false)}
              >
                Orders
              </NavLink>
              <NavLink
                to="/wallet"
                className={activeLink}
                onClick={() => setOpen(false)}
              >
                Wallet
              </NavLink>
              <NavLink
                to="/history"
                className={activeLink}
                onClick={() => setOpen(false)}
              >
                History
              </NavLink>

              {user?.role === 'host' && (
                <>
                  <NavLink
                    to="/host/dashboard"
                    className={activeLink}
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/host/orders"
                    className={activeLink}
                    onClick={() => setOpen(false)}
                  >
                    Orders Board
                  </NavLink>
                  <NavLink
                    to="/host/scanner"
                    className={activeLink}
                    onClick={() => setOpen(false)}
                  >
                    Scanner
                  </NavLink>
                  <NavLink
                    to="/host/reports"
                    className={activeLink}
                    onClick={() => setOpen(false)}
                  >
                    Reports
                  </NavLink>
                </>
              )}

              {user ? (
                <button
                  className="btn-ghost px-3 py-2 cursor-pointer"
                  onClick={async () => {
                    await logout();
                    setOpen(false);
                    navigate('/login');
                  }}
                >
                  Sign out
                </button>
              ) : (
                <NavLink
                  to="/login"
                  className={activeLink}
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </NavLink>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="container py-6">
        <Outlet />
      </main>

      {/* Global toast host */}
      <ToastHost />
    </div>
  );
}
