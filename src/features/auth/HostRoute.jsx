import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './auth.context';

export default function HostRoute() {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status !== 'ready') return <div className="p-6">Loading…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user.role !== 'host') return <Navigate to="/" replace />;

  return <Outlet />;
}
