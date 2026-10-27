import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sprout,
  LogIn,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  KeyRound,
  RotateCcw
} from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password / quick reset state
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState('');

  const { signIn, resetPassword, isSupabaseConfigured, authProvider } = useAuth();
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
    if (!password.trim()) {
      setError('Please enter your account password.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      await signIn(email.trim(), password.trim());
      navigate(from, { replace: true });
    } catch (err) {
      if (err.message?.includes('fetch failed') || err.message?.includes('Failed to fetch')) {
        setError('Cannot connect to backend service. Please verify that FastAPI is running on http://127.0.0.1:8000.');
      } else {
        setError(err.message || 'Invalid email or password. You can reset your password below if you forgot it.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResetMsg('');

    const cleanEmail = resetEmail.trim();
    if (!cleanEmail) {
      setError('Please enter the email address for your account.');
      return;
    }
    if (newPassword.trim().length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setResetLoading(true);

    try {
      const res = await resetPassword(cleanEmail, newPassword.trim());
      setSuccessMsg(res.message || 'Password updated successfully! Logging you in...');
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 800);
    } catch (err) {
      setError(err.message || 'Unable to update password. Please check the email address.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#faf8f5] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-2xl border border-[#e4dfd5] shadow-sm">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#1b432a] text-white mx-auto flex items-center justify-center mb-4 shadow-sm">
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
          <div className="mb-6 p-4 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-xs font-medium flex items-start gap-3 animate-shake">
            <AlertCircle className="w-4 h-4 text-[#dc2626] shrink-0 mt-0.5" />
            <div className="leading-relaxed flex-1">
              <span>{error}</span>
              {!showReset && (
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email.trim() || 'mohammedkhalanderk3636@gmail.com');
                    setShowReset(true);
                    setError('');
                  }}
                  className="block mt-2 font-bold text-[#b91c1c] underline hover:text-[#7f1d1d] cursor-pointer"
                >
                  Forgot your password? Click here to set a new password &rarr;
                </button>
              )}
            </div>
          </div>
        )}

        {/* Success message banner */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] text-xs font-medium flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span>{successMsg}</span>
            </div>
          </div>
        )}

        {!showReset ? (
          /* Normal Sign In Form */
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#2d3a2f] uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#1b432a]" />
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email.trim() || 'mohammedkhalanderk3636@gmail.com');
                    setShowReset(true);
                    setError('');
                  }}
                  className="text-xs text-[#1b432a] hover:underline font-medium cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-lg border border-[#d6cfc3] focus:outline-none focus:ring-2 focus:ring-[#1b432a] focus:border-transparent font-normal text-[#1a2e1d] text-sm bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#526055] hover:text-[#1b432a] transition-colors p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
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

            {/* Quick Demo Credentials */}
            <div className="pt-3 space-y-2">
              <p className="text-[11px] font-semibold text-[#526055] uppercase tracking-wider text-center">
                One-Click Instant Sign In
              </p>
              
              <button
                type="button"
                onClick={() => {
                  setEmail('mohammedkhalanderk3636@gmail.com');
                  setPassword('password123');
                  setError('');
                }}
                className="w-full py-2 px-3 rounded-lg border border-dashed border-[#1b432a]/40 bg-[#f0fdf4] hover:bg-[#dcfce7] text-[#166534] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>👤 Primary Farmer: mohammedkhalanderk3636@gmail.com</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('test_farmer@krishi.in');
                  setPassword('password123');
                  setError('');
                }}
                className="w-full py-2 px-3 rounded-lg border border-dashed border-[#526055]/30 bg-[#f9fafb] hover:bg-[#f3f4f6] text-[#374151] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>⚡ Demo Account: test_farmer@krishi.in</span>
              </button>
            </div>
          </form>
        ) : (
          /* Inline Password Reset Form */
          <form onSubmit={handleResetSubmit} className="space-y-4" noValidate>
            <div className="p-3 rounded-xl bg-[#eff6ff] border border-[#bfdbfe] text-[#1e40af] text-xs leading-relaxed flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#2563eb] shrink-0" />
              <span>Enter your registered email and choose a new password. It will update instantly.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2d3a2f] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#1b432a]" />
                Registered Email
              </label>
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => {
                  setResetEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="mohammedkhalanderk3636@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#d6cfc3] focus:outline-none focus:ring-2 focus:ring-[#1b432a] focus:border-transparent font-normal text-[#1a2e1d] text-sm bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2d3a2f] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#1b432a]" />
                New Password (min 6 characters)
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your new password"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-lg border border-[#d6cfc3] focus:outline-none focus:ring-2 focus:ring-[#1b432a] focus:border-transparent font-normal text-[#1a2e1d] text-sm bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#526055] hover:text-[#1b432a] transition-colors p-1"
                  title={showNewPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={resetLoading}
              className="w-full py-3 px-5 rounded-lg bg-[#1b432a] hover:bg-[#143420] text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors mt-6 cursor-pointer"
            >
              {resetLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Set New Password & Sign In</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowReset(false);
                setError('');
              }}
              className="w-full py-2 px-3 text-[#526055] hover:text-[#1a2e1d] text-xs font-medium text-center hover:underline cursor-pointer"
            >
              Back to Standard Sign In
            </button>
          </form>
        )}

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
