import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold text-ef-text">Sign in</h1>
      <p className="text-ef-muted mt-1 text-sm">Access EventFlow AI dashboards and event management.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4 bg-ef-muted-bg border border-ef-border rounded-2xl p-6">
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
        <label className="block text-sm font-medium">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ef-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ef-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-ef-primary hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="text-sm text-ef-muted mt-4 text-center">
        No account?{' '}
        <Link to="/register" className="text-ef-primary font-semibold">
          Register
        </Link>
      </p>
    </div>
  );
}
