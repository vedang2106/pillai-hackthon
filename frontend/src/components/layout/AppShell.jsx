import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Zap, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AppShell() {
  const { user, logout, isGovernment } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-ef-text">
      <header className="border-b border-ef-border bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 font-extrabold text-lg">
              <span className="p-1.5 rounded-lg bg-ef-primary text-white">
                <Zap className="w-5 h-5" />
              </span>
              EventFlow <span className="text-ef-primary">AI</span>
            </Link>
            {isGovernment && (
              <Link
                to="/government"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs hover:bg-emerald-100 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Govt Command Center
              </Link>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm">
            {user ? (
              <>
                <span className="text-ef-muted hidden sm:inline">
                  {user.name} · <span className="font-semibold text-ef-text">{user.role}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="inline-flex items-center gap-1 text-ef-muted hover:text-ef-text"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-ef-muted hover:text-ef-primary font-medium">
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-ef-primary hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
