import { Navigate } from 'react-router-dom';
import { useAuth } from './auth.context';

export default function PublicOnlyRoute({ children }) {
  const { isAuthed, status } = useAuth();
  if (status !== 'ready') return null;
  return isAuthed ? <Navigate to="/" replace /> : children;
}
