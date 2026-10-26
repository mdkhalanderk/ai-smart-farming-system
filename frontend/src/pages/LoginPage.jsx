import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, LogIn, Loader2, AlertCircle, Lock, Mail, ArrowRight, Info } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, configStatus, isSupabaseConfigured, authProvider } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const validateForm = () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address (e.g., farmer@example.in).');
      return false;
    }
    if (!password) {
      setError('Please enter your account password.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err.message?.includes('fetch failed') || err.message?.includes('Failed to fetch')) {
        setError('Cannot connect to authentication service. Please ensure the backend server is running on http://127.0.0.1:8000.');
      } else {
        setError(err.message || 'Failed to sign in. Please verify your credentials and network connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#faf8f5] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-2xl border border-[#e4dfd5] shadow-sm">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#1b432a] text-white mx-auto flex items-center justify-center mb-4">
            <Sprout className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#1a2e1d] tracking-tight">
            Farmer Sign In
          </h1>
          <p className="text-xs text-[#526055] mt-1.5 font-medium">
            Smart Crop Advisory Platform
          </p>
        </div>

        {/* Auth Mode Indicator */}
        <div className="mb-6 p-3 rounded-xl bg-[#f5f8f5] border border-[#d8e2dc] text-[#2d5038] text-xs leading-relaxed flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="font-medium text-[#1b432a]">Auth Service Active</span>
          </div>
          <span className="text-[11px] text-[#526055] font-mono">
            {authProvider === 'supabase' && isSupabaseConfigured ? 'Supabase Cloud' : 'Local FastAuth Engine'}
          </span>
        </div>

        {/* Error message banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-xs font-medium flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-[#dc2626] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-xs font-semibold text-[#2d3a2f] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#1b432a]" />
              Email Address
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              placeholder="farmer@example.in"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#d6cfc3] focus:outline-none focus:ring-2 focus:ring-[#1b432a] focus:border-transparent font-normal text-[#1a2e1d] text-sm bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2d3a2f] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#1b432a]" />
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#d6cfc3] focus:outline-none focus:ring-2 focus:ring-[#1b432a] focus:border-transparent font-normal text-[#1a2e1d] text-sm bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-5 rounded-lg bg-[#1b432a] hover:bg-[#143420] text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors mt-6 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Dashboard</span>
              </>
            )}
          </button>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setEmail('test_farmer@krishi.in');
                setPassword('password123');
                setError('');
              }}
              className="w-full py-2 px-3 rounded-lg border border-dashed border-[#1b432a]/40 bg-[#f0fdf4] hover:bg-[#dcfce7] text-[#166534] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>⚡ One-Click Fill: Demo Farmer (test_farmer@krishi.in)</span>
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-[#e4dfd5] text-center text-xs text-[#526055]">
          New to Smart Crop Advisory?{' '}
          <Link to="/signup" className="text-[#1b432a] font-semibold hover:underline">
            Create an Account
          </Link>
        </div>

      </div>
    </div>
  );
};
