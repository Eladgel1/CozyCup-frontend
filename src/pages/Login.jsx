import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/auth.context';
import { mapHttpErrorToMessage } from '@/lib/error.map';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/';

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (!email || !password) throw new Error('Email and password are required');
      await login(email, password, { remember });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(mapHttpErrorToMessage(err));
    }
  };

  return (
    <div className="mx-auto max-w-md p-6 bg-white rounded-md border">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      {error && <p className="mb-3 text-red-600 text-sm">{error}</p>}

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          autoComplete="current-password"
          required
          minLength={8}
        />

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={remember} onChange={(e)=>setRemember(e.target.checked)} />
          Remember me
        </label>

        <button className="w-full bg-slate-900 text-white py-2 rounded cursor-pointer">Sign in</button>
      </form>

      <div className="mt-4 text-sm flex items-center justify-center gap-2">
        <span className="text-slate-600">Don’t have an account?</span>
        <Link
          to="/register"
          className="inline-flex items-center rounded bg-slate-100 hover:bg-slate-200 px-3 py-1 font-medium"
          role="button"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
