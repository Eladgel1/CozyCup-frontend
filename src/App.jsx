import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/auth.context';

export default function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">CozyCup ☕</h1>
          <nav className="flex items-center gap-4 text-sm">
            <NavLink to="/" end className="hover:underline">Home</NavLink>
            <NavLink to="/menu" className="hover:underline">Menu</NavLink>
            <NavLink to="/bookings" className="hover:underline">Bookings</NavLink>
            <NavLink to="/orders" className="hover:underline">Orders</NavLink>
            <NavLink to="/checkin" className="hover:underline">Check-in</NavLink>
            <span className="mx-2">|</span>
            {user ? (
              <button className="underline" onClick={async () => { await logout(); navigate('/login'); }}>
                Sign out
              </button>
            ) : (
              <NavLink to="/login" className="underline">Sign in</NavLink>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-4">
        <Outlet />
      </main>
    </div>
  );
}
