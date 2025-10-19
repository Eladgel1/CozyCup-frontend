import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './auth.context';

export default function ProtectedRoute() {
  const { isAuthed, status } = useAuth();
  const location = useLocation();

  if (status !== 'ready') return <div className="p-6">Loading…</div>;
  if (!isAuthed) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
