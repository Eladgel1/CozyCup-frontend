import './App.css';
import { Outlet, NavLink } from 'react-router-dom';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">CozyCup ☕</h1>
          <nav className="flex gap-4 text-sm">
            <NavLink to="/" end className="hover:underline">Home</NavLink>
            <NavLink to="/menu" className="hover:underline">Menu</NavLink>
            <NavLink to="/bookings" className="hover:underline">Bookings</NavLink>
            <NavLink to="/orders" className="hover:underline">Orders</NavLink>
            <NavLink to="/checkin" className="hover:underline">Check-in</NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-4">
        <p className="text-slate-600 mb-4">Frontend skeleton ready.</p>
        <Outlet />
      </main>
    </div>
  );
}
