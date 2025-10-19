import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/auth.context';
import { mapHttpErrorToMessage } from '@/lib/error.map';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (!form.email || !form.password) throw new Error('Email and password are required');
      await register(form, { remember: true });
      navigate('/', { replace: true });
    } catch (err) {
      setError(mapHttpErrorToMessage(err));
    }
  };

  return (
    <div className="mx-auto max-w-md p-6 bg-white rounded-md border">
      <h2 className="text-xl font-semibold mb-4">Register</h2>
      {error && <p className="mb-3 text-red-600 text-sm">{error}</p>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Name"
          value={form.name}
          onChange={(e)=>setForm({ ...form, name: e.target.value })}
          autoComplete="name"
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e)=>setForm({ ...form, email: e.target.value })}
          autoComplete="email"
          required
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e)=>setForm({ ...form, password: e.target.value })}
          autoComplete="new-password"
          required
          minLength={8}
        />
        <button className="w-full bg-slate-900 text-white py-2 rounded cursor-pointer">Create account</button>
      </form>
    </div>
  );
}
