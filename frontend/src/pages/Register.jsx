import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'VISITOR',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/events');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold text-ef-text">Create account</h1>
      <p className="text-ef-muted mt-1 text-sm">Organizers can create events and zones after registration.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4 bg-ef-muted-bg border border-ef-border rounded-2xl p-6">
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
        <label className="block text-sm font-medium">
          Full name
          <input
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="mt-1 w-full rounded-lg border border-ef-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
        </label>
        <label className="block text-sm font-medium">
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="mt-1 w-full rounded-lg border border-ef-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            className="mt-1 w-full rounded-lg border border-ef-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
        </label>
        <label className="block text-sm font-medium">
          Role
          <select
            value={form.role}
            onChange={(e) => update('role', e.target.value)}
            className="mt-1 w-full rounded-lg border border-ef-border px-3 py-2 bg-white"
          >
            <option value="VISITOR">Visitor</option>
            <option value="ORGANIZER">Event Organizer</option>
            <option value="GOVERNMENT_AUTHORITY">Government Authority (City Official)</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-ef-primary hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg disabled:opacity-60"
        >
          {submitting ? 'Creating…' : 'Register'}
        </button>
      </form>
      <p className="text-sm text-ef-muted mt-4 text-center">
        Already registered?{' '}
        <Link to="/login" className="text-ef-primary font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  );
}
