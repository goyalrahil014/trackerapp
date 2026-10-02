import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Sparkles, Mail, Lock, ArrowRight, AlertTriangle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmailNotConfirmed, setIsEmailNotConfirmed] = useState(false);

  const { signIn, isSecretKey, loginAsDemo, resendConfirmationEmail } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setIsEmailNotConfirmed(false);
      await signIn(email, password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err?.message || 'Invalid email or password.';
      if (msg.toLowerCase().includes('email not confirmed')) {
        setIsEmailNotConfirmed(true);
        setError(null);
      } else {
        setIsEmailNotConfirmed(false);
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Please enter your email above first.');
      return;
    }
    try {
      setResending(true);
      await resendConfirmationEmail(email);
      toast.success(`Confirmation email sent to ${email}! Please check your inbox or spam folder.`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to resend confirmation email.');
    } finally {
      setResending(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsEmailNotConfirmed(false);
      await loginAsDemo();
      toast.success('Logged in as Alex Morgan (Demo)');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Could not initialize demo login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 antialiased">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
          <span className="font-extrabold text-xl tracking-tighter">HF</span>
        </div>
        <span className="font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
          HabitFlow
        </span>
      </div>

      <Card className="w-full max-w-md p-6 sm:p-8 shadow-xl border-slate-200/90 dark:border-slate-800">
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome back
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sign in to track your 30-day habit adherence
          </p>
        </div>

        {isSecretKey && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Secret API Key Detected in .env
            </div>
            <p className="leading-relaxed">
              Your <code>VITE_SUPABASE_ANON_KEY</code> is set to an admin secret key (<code>sb_secret_...</code>). Supabase blocks secret keys in browser apps for security.
            </p>
            <p className="font-medium text-[11px] text-amber-800 dark:text-amber-300">
              To fix: Go to Supabase Dashboard &rarr; <strong>Project Settings</strong> &rarr; <strong>API</strong> &rarr; copy the <strong>anon public</strong> key into your <code>.env</code>.
            </p>
          </div>
        )}

        {isEmailNotConfirmed && (
          <div className="mb-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 text-xs space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300 text-sm">
              <Mail className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              Email Not Confirmed
            </div>
            <p className="leading-relaxed">
              Supabase has email confirmation enabled by default. To sign in right now:
            </p>
            <div className="space-y-2 bg-white/70 dark:bg-slate-900/60 p-3 rounded-lg border border-amber-500/20">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Option 1 (Fastest — 10 seconds):</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Go to Supabase Dashboard &rarr; <strong>Authentication</strong> &rarr; <strong>Users</strong> &rarr; click <strong>...</strong> next to <code className="text-indigo-600 dark:text-indigo-400">{email || 'your email'}</code> &rarr; select <strong>"Confirm email"</strong>.
                </p>
              </div>
              <div className="pt-1 border-t border-amber-500/10">
                <span className="font-bold text-slate-900 dark:text-white">Option 2 (Inbox link):</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Check your email inbox or spam folder for the Supabase confirmation link.
                </p>
              </div>
              <div className="pt-1 border-t border-amber-500/10">
                <span className="font-bold text-slate-900 dark:text-white">Option 3 (Auto-confirm future signups):</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  In Supabase Dashboard &rarr; <strong>Authentication</strong> &rarr; <strong>Providers</strong> &rarr; <strong>Email</strong> &rarr; toggle OFF <strong>"Confirm email"</strong>.
                </p>
              </div>
            </div>
            <div className="pt-1">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors"
              >
                {resending ? 'Sending...' : 'Resend Confirmation Email'}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            className="w-full shadow-md shadow-indigo-500/25"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-900 px-3 text-slate-400">or</span>
          </div>
        </div>

        {/* Quick Demo Access Button */}
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={handleDemoLogin}
          isLoading={loading}
          className="w-full justify-center text-xs"
          leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
        >
          Explore with 1-Click Demo Account
        </Button>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Don't have an account yet?{' '}
          <Link
            to="/signup"
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
};
