'use client';

import { FormEvent, useState } from 'react';
import {
  Server,
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { LoginCredentials } from '@/types/user';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    setFormError(null);

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const credentials: LoginCredentials = { email, password };
      await login(credentials);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      const fallback =
        'We could not sign you in with those credentials. Please try again or reset your password.';
      setFormError(error instanceof Error ? error.message : fallback);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen relative flex items-center justify-center overflow-hidden'>
      {/* Background Image with Overlay */}
      <div
        className='absolute inset-0 bg-cover bg-center bg-no-repeat'
      >
        <div className='absolute inset-0 bg-gradient-to-br from-slate-900/95 via-blue-900/90 to-slate-900/95 backdrop-blur-sm'></div>
      </div>

      {/* Animated Grid Overlay */}
      <div className='absolute inset-0 opacity-20'>
        <div
          className='absolute inset-0'
          style={{
            backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        ></div>
      </div>

      {/* Login Card */}
      <div className='relative z-10 w-full max-w-6xl mx-4'>
        <div className='grid gap-10 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] items-stretch'>
          <div className='relative bg-slate-900/55 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl px-6 py-8 sm:px-10 sm:py-12 overflow-hidden'>
            <div className='absolute -top-28 -right-28 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl'></div>
            <div className='absolute -bottom-32 -left-24 w-64 h-64 bg-cyan-500/15 rounded-full blur-[110px]'></div>

            <div className='relative'>
              <div className='mb-8'>
                <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-5 shadow-lg shadow-blue-500/50'>
                  <Server className='w-8 h-8 text-white' strokeWidth={2.5} />
                </div>
                <h1 className='text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent tracking-tight'>
                  Welcome back
                </h1>
                <p className='text-slate-300 text-sm font-medium tracking-wide max-w-sm'>
                  Access your collaborative rituals, review team insights, and keep every routine on schedule.
                </p>
              </div>

              <form
                className='space-y-6'
                onSubmit={handleSubmit}
                noValidate
                aria-live='polite'
              >
                {formError && (
                  <div className='bg-red-500/10 backdrop-blur-sm border border-red-500/50 text-red-200 px-4 py-3 rounded-xl flex items-start gap-3'>
                    <AlertCircle className='w-5 h-5 mt-0.5 flex-shrink-0' />
                    <span className='text-sm'>{formError}</span>
                  </div>
                )}

                <div className='space-y-2'>
                  <label
                    htmlFor='email'
                    className='block text-sm font-semibold text-slate-200 tracking-wide'
                  >
                    Work email
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                      <Mail className='w-5 h-5 text-slate-400' />
                    </div>
                    <input
                      id='email'
                      type='email'
                      value={email}
                      autoComplete='email'
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className='w-full pl-12 pr-4 py-3 bg-slate-800/50 backdrop-blur-sm text-white rounded-xl border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-slate-500'
                      placeholder='you@company.com'
                    />
                  </div>
                  {errors.email && (
                    <p className='text-xs text-red-300 font-medium'>{errors.email}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <label
                      htmlFor='password'
                      className='block text-sm font-semibold text-slate-200 tracking-wide'
                    >
                      Password
                    </label>
                    <Link
                      href='/forgot-password'
                      className='text-xs font-semibold text-blue-300 hover:text-blue-200'
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                      <Lock className='w-5 h-5 text-slate-400' />
                    </div>
                    <input
                      id='password'
                      type='password'
                      value={password}
                      autoComplete='current-password'
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className='w-full pl-12 pr-4 py-3 bg-slate-800/50 backdrop-blur-sm text-white rounded-xl border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-slate-500'
                      placeholder='Enter your password'
                    />
                  </div>
                  {errors.password && (
                    <p className='text-xs text-red-300 font-medium'>{errors.password}</p>
                  )}
                </div>

                <div className='flex items-center justify-between text-sm text-slate-300'>
                  <label className='inline-flex items-center gap-2'>
                    <input
                      type='checkbox'
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className='h-4 w-4 rounded border border-slate-500 bg-slate-800/60 text-blue-500 focus:ring-blue-500 focus:ring-offset-0'
                    />
                    <span>Remember me on this device</span>
                  </label>
                  <span className='text-xs uppercase tracking-[0.2em] text-slate-500'>SAML • SSO</span>
                </div>

                <button
                  type='submit'
                  disabled={isLoading}
                  className='w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2'
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='w-5 h-5 animate-spin' />
                      <span>Signing you in...</span>
                    </>
                  ) : (
                    <>
                      <Lock className='w-5 h-5' />
                      <span>Sign in to workspace</span>
                    </>
                  )}
                </button>
              </form>

              <div className='mt-8 border border-slate-700/40 rounded-xl bg-slate-900/30 px-5 py-4 text-sm text-slate-300 flex flex-col gap-4'>
                <div className='flex items-start gap-3'>
                  <ShieldCheck className='w-5 h-5 text-blue-300 mt-1' />
                  <div>
                    Enterprise-grade security by default. SOC2 in progress, continuous monitoring, and role-based access controls.
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <CheckCircle2 className='w-5 h-5 text-blue-300 mt-1' />
                  <div>
                    Sync routines across time zones, capture blockers, and surface insights automatically.
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <Sparkles className='w-5 h-5 text-blue-300 mt-1' />
                  <div>
                    Join thousands of leaders orchestrating rituals with measurable impact.
                  </div>
                </div>
              </div>

              <p className='text-center text-slate-400 text-sm mt-6'>
                New to Collaborative Routine?{' '}
                <Link
                  href='/register'
                  className='text-blue-300 hover:text-blue-200 font-semibold'
                >
                  Create an account
                </Link>
                .
              </p>
            </div>
          </div>

          <div className='relative hidden lg:flex flex-col justify-between rounded-2xl border border-slate-700/50 bg-slate-900/45 backdrop-blur-xl shadow-[0_40px_80px_-40px_rgba(15,23,42,0.7)] p-10 overflow-hidden'>
            <div className='absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-slate-900/40'></div>
            <div className='absolute -top-32 right-0 w-56 h-56 rounded-full bg-blue-400/20 blur-3xl'></div>
            <div className='absolute bottom-[-60px] left-[-30px] w-48 h-48 rounded-full bg-cyan-400/15 blur-3xl'></div>

            <div className='relative space-y-6'>
              <div>
                <span className='inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-blue-200'>
                  Operator insights
                </span>
                <h2 className='mt-5 text-3xl font-semibold text-white leading-tight'>
                  Operate with clarity, even asynchronously.
                </h2>
                <p className='mt-4 text-sm text-slate-300 max-w-md'>
                  Automate daily standups, centralize notes, and give leaders a reliable pulse on momentum without context switching.
                </p>
              </div>

              <div className='grid gap-5'>
                <div className='flex gap-3 rounded-xl border border-slate-700/60 bg-slate-900/60 p-4'>
                  <ShieldCheck className='w-5 h-5 text-blue-300 mt-1 flex-shrink-0' />
                  <div>
                    <h3 className='text-sm font-semibold text-white'>Enterprise security</h3>
                    <p className='text-xs text-slate-300'>Granular roles, audit logs, and compliance-ready infrastructure out of the box.</p>
                  </div>
                </div>
                <div className='flex gap-3 rounded-xl border border-slate-700/60 bg-slate-900/60 p-4'>
                  <CheckCircle2 className='w-5 h-5 text-blue-300 mt-1 flex-shrink-0' />
                  <div>
                    <h3 className='text-sm font-semibold text-white'>Purpose-built rituals</h3>
                    <p className='text-xs text-slate-300'>Run retros, planning, and async updates with tailored templates that keep teams aligned.</p>
                  </div>
                </div>
                <div className='flex gap-3 rounded-xl border border-slate-700/60 bg-slate-900/60 p-4'>
                  <Sparkles className='w-5 h-5 text-blue-300 mt-1 flex-shrink-0' />
                  <div>
                    <h3 className='text-sm font-semibold text-white'>Outcomes over output</h3>
                    <p className='text-xs text-slate-300'>Surface blockers early, track commitments, and celebrate wins with real-time dashboards.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className='relative mt-8'>
              <div className='rounded-2xl border border-slate-700/40 bg-slate-900/60 p-6'>
                <p className='text-sm text-slate-200 italic'>
                  “Collaborative Routine gives our distributed teams a shared rhythm. Engagement in our weekly rituals jumped 38% in the first month.”
                </p>
                <div className='mt-5 flex items-center justify-between text-xs text-slate-400 uppercase tracking-[0.3em]'>
                  <span>4,200+ teams onboarded</span>
                  <span>99.95% uptime SLA</span>
                  <span>GDPR & ISO-ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className='relative z-10 text-center mt-10 text-slate-400 text-sm'>
          Secure Access • Encrypted Connection • 24/7 Monitoring
        </p>
      </div>
    </div>
  );
}
