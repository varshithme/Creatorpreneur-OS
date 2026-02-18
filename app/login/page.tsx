'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Target, Sun, Moon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const bgClass = darkMode ? 'bg-black' : 'bg-white';
  const textClass = darkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const cardBg = darkMode ? 'bg-zinc-900' : 'bg-white';
  const borderClass = darkMode ? 'border-zinc-800' : 'border-slate-200';
  const inputClass = darkMode
    ? 'bg-zinc-800 text-white border-zinc-700'
    : 'bg-slate-50 text-slate-900 border-slate-200';

  const handleAuth = async () => {
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (isSignUp && !name.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (signUpError) throw signUpError;

        if (data.user) {
          // Create profile row
          await supabase.from('profiles').upsert({
            id: data.user.id,
            name: name.trim(),
          });
          // Create inactive subscription row
          await supabase.from('subscriptions').upsert({
            user_id: data.user.id,
            status: 'inactive',
          });
          router.push('/subscribe');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;

        // Check subscription status
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('status')
            .eq('user_id', user.id)
            .single();

          if (!sub || sub.status !== 'active') {
            router.push('/subscribe');
          } else {
            router.push('/dashboard');
          }
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${bgClass} transition-colors duration-300`}
    >
      {/* Theme toggle */}
      <div className="absolute top-8 right-8">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-3 rounded-full ${darkMode ? 'bg-zinc-800' : 'bg-slate-100'} hover:bg-opacity-80 transition duration-300`}
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-orange-500" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700" />
          )}
        </button>
      </div>

      <div className="w-full max-w-md px-6">
        {/* Logo + Title */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-orange-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h1 className={`text-4xl font-semibold ${textClass} mb-2 tracking-tight`}>
            Sales Dashboard
          </h1>
          <p className={`text-lg ${textSecondary} font-light`}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {/* Card */}
        <div className={`${cardBg} rounded-3xl p-8 shadow-2xl border ${borderClass}`}>
          <div className="space-y-5">
            {isSignUp && (
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className={`w-full px-4 py-3 rounded-xl ${inputClass} border focus:outline-none focus:ring-2 focus:ring-orange-500 transition`}
                />
              </div>
            )}

            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                placeholder="you@example.com"
                className={`w-full px-4 py-3 rounded-xl ${inputClass} border focus:outline-none focus:ring-2 focus:ring-orange-500 transition`}
                autoFocus
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                placeholder={isSignUp ? 'At least 6 characters' : 'Enter your password'}
                className={`w-full px-4 py-3 rounded-xl ${inputClass} border focus:outline-none focus:ring-2 focus:ring-orange-500 transition`}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-red-500 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition duration-300 shadow-lg disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className={`text-sm ${textSecondary} hover:text-orange-500 transition duration-300`}
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        <p className={`text-center mt-6 text-sm ${textSecondary} font-light`}>
          Secure access to your sales metrics
        </p>
      </div>
    </div>
  );
}
