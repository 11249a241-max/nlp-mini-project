import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ArrowRight, ShieldCheck, UserCheck, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'FACULTY') {
        navigate('/faculty/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("We couldn't sign you in. Check your email and password, or create an account if you're new.");
      } else if (err.response?.status >= 500) {
        setError('Sign-in is temporarily unavailable. Please try again later.');
      } else if (err.response) {
        setError(err.response.data?.detail || 'Unable to sign in. Please check your credentials and try again.');
      } else {
        setError('Unable to connect to the server. Check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (role) => {
    if (role === 'STUDENT') {
      setEmail('student@campusmind.edu');
      setPassword('password123');
    } else {
      setEmail('faculty@campusmind.edu');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-brand-600 via-purpleAccent-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <GraduationCap className="h-7 w-7" />
          </div>
          <span className="font-extrabold text-2xl text-slate-900 tracking-tight">CampusMind AI</span>
        </Link>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to your university intelligence dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-200/80">
          {/* Quick Demo Fill Buttons */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">
              Quick Demo Access
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDemoCredentials('STUDENT')}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-brand-200 bg-brand-50/60 text-brand-700 hover:bg-brand-100 text-xs font-bold transition-colors"
              >
                <UserCheck className="h-4 w-4 text-brand-600" />
                <span>Student Demo</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('FACULTY')}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-purpleAccent-200 bg-purpleAccent-50/60 text-purpleAccent-700 hover:bg-purpleAccent-100 text-xs font-bold transition-colors"
              >
                <ShieldCheck className="h-4 w-4 text-purpleAccent-600" />
                <span>Faculty Demo</span>
              </button>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-semibold">Or enter credentials</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-purpleAccent-600 hover:from-brand-700 hover:to-purpleAccent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-600">
              New to CampusMind AI?{' '}
              <Link to="/register" className="font-bold text-brand-600 hover:text-brand-500">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
