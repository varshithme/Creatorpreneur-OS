'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Target, CheckCircle, Sun, Moon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function SubscribePage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');

  const supabase = createClient();

  const bgClass = darkMode ? 'bg-black' : 'bg-white';
  const textClass = darkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const cardBg = darkMode ? 'bg-zinc-900' : 'bg-white';
  const borderClass = darkMode ? 'border-zinc-800' : 'border-slate-200';

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();
      if (profile?.name) setUserName(profile.name);

      // If already subscribed, redirect to dashboard
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .single();
      if (sub?.status === 'active') router.push('/dashboard');
    };
    loadUser();
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
  }, []);

  const handleSubscribe = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/razorpay/create-subscription', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create subscription');

      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user!.id)
        .single();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: data.subscription_id,
        name: 'Creatorpreneur OS',
        description: 'Sales Dashboard — Monthly Subscription',
        prefill: {
          name: profile?.name || '',
          email: user?.email || '',
        },
        theme: { color: '#FF6B35' },
        handler: async (response: Record<string, string>) => {
          try {
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              router.push('/dashboard');
            } else {
              setError('Payment verification failed. Please contact support.');
            }
          } catch {
            setError('Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to initiate payment';
      setError(message);
      setLoading(false);
    }
  };

  const features = [
    'Weekly sales metrics tracking',
    'Lead source analytics (Inbound/Outbound/Referral)',
    'Interactive charts — weekly, monthly, quarterly, yearly',
    'AI-powered insights via Claude',
    'KPI cards and revenue tracking',
    'Dark & light mode',
    'Export and data management',
  ];

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
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

      <div className="max-w-2xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-orange-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h1 className={`text-5xl font-semibold ${textClass} mb-3 tracking-tight`}>
            {userName ? `Welcome, ${userName}` : 'Get Started'}
          </h1>
          <p className={`text-xl ${textSecondary} font-light`}>
            Subscribe to unlock your sales dashboard
          </p>
        </div>

        {/* Pricing card */}
        <div className={`${cardBg} rounded-3xl p-10 shadow-2xl border ${borderClass} mb-6`}>
          <div className="text-center mb-8">
            <div className="text-6xl font-semibold text-orange-500 tracking-tight">
              ₹999
              <span className={`text-2xl ${textSecondary} font-light`}>/month</span>
            </div>
            <p className={`mt-2 ${textSecondary} font-light`}>Cancel anytime</p>
          </div>

          <ul className="space-y-4 mb-10">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className={`${textClass} font-light`}>{f}</span>
              </li>
            ))}
          </ul>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6">
              <p className="text-red-500 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-orange-500 text-white px-6 py-4 rounded-2xl font-semibold text-lg hover:bg-orange-600 transition duration-300 shadow-xl disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Subscribe Now'}
          </button>
        </div>

        <p className={`text-center text-sm ${textSecondary} font-light`}>
          Secure payment via Razorpay. All major cards, UPI, and net banking accepted.
        </p>
      </div>
    </div>
  );
}
