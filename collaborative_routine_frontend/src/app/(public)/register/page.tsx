'use client';

import { FormEvent, useMemo, useState } from 'react';
import {
  Server,
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  User,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { RegisterData } from '@/types/user';

export default function RegisterPage() {
  type FormErrors = {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC',
    []
  );

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    setFormError(null);

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}/.test(password)
    ) {
      newErrors.password =
        'Use 8+ characters with upper, lower, number, and symbol.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    if (!acceptPolicy) {
      setFormError('Please accept the Terms of Service and Privacy Policy.');
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0 || !acceptPolicy) {
      return false;
    }

    return true;
  };

  const passwordStrength = useMemo(() => {
    if (!password) {
      return { label: 'Set a strong password', score: 0 };
    }

    let score = 0;

    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^\w\s]/.test(password)) score += 1;

    if (score <= 2) {
      return { label: 'Weak', score };
    }
    if (score === 3) {
      return { label: 'Fair', score };
    }
    if (score === 4) {
      return { label: 'Good', score };
    }
    return { label: 'Excellent', score };
  }, [password]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const payload: RegisterData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        timezone,
      };
      await register(payload);
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      const fallback =
        'Something went wrong while creating your account. Please try again.';
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

      <div className='relative z-10 w-full max-w-6xl mx-4'>
        <div className='grid gap-10 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] items-stretch'>
          {/* Form Card */}
          <div className='relative bg-slate-900/55 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl px-6 py-8 sm:px-10 sm:py-12 overflow-hidden'>
            <div className='absolute -top-28 -right-28 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl'></div>
            <div className='absolute -bottom-32 -left-24 w-64 h-64 bg-cyan-500/15 rounded-full blur-[110px]'></div>

            <div className='relative'>
              <div className='mb-8'>
                <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-5 shadow-lg shadow-blue-500/50'>
                  <Server className='w-8 h-8 text-white' strokeWidth={2.5} />
                </div>
                <h1 className='text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent tracking-tight'>
                  Create your account
                </h1>
                <p className='mt-3 text-slate-300 text-sm font-medium tracking-wide max-w-md'>
                  Launch a high-trust workspace for rituals, standups, and planning in minutes. No credit card required.
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
                    htmlFor='name'
                    className='block text-sm font-semibold text-slate-200 tracking-wide'
                  >
                    Full name
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                      <User className='w-5 h-5 text-slate-400' />
                    </div>
                    <input
                      id='name'
                      type='text'
                      value={name}
                      autoComplete='name'
                      onChange={(e) => setName(e.target.value)}
                      required
                      className='w-full pl-12 pr-4 py-3 bg-slate-800/50 backdrop-blur-sm text-white rounded-xl border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-slate-500'
                      placeholder='Jane Cooper'
                    />
                  </div>
                  {errors.name && (
                    <p className='text-xs text-red-300 font-medium'>{errors.name}</p>
                  )}
                </div>

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
                  <label
                    htmlFor='password'
                    className='block text-sm font-semibold text-slate-200 tracking-wide'
                  >
                    Password
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                      <Lock className='w-5 h-5 text-slate-400' />
                    </div>
                    <input
                      id='password'
                      type='password'
                      value={password}
                      autoComplete='new-password'
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className='w-full pl-12 pr-4 py-3 bg-slate-800/50 backdrop-blur-sm text-white rounded-xl border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-slate-500'
                      placeholder='Create a strong password'
                    />
                  </div>
                  {errors.password ? (
                    <p className='text-xs text-red-300 font-medium'>{errors.password}</p>
                  ) : (
                    <div className='flex items-center justify-between text-xs text-slate-400 uppercase tracking-[0.2em] font-semibold'>
                      <span>Password strength</span>
                      <span
                        className={
                          passwordStrength.score >= 4
                            ? 'text-emerald-300'
                            : passwordStrength.score === 3
                            ? 'text-blue-300'
                            : 'text-amber-300'
                        }
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div className='space-y-2'>
                  <label
                    htmlFor='confirmPassword'
                    className='block text-sm font-semibold text-slate-200 tracking-wide'
                  >
                    Confirm password
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                      <Lock className='w-5 h-5 text-slate-400' />
                    </div>
                    <input
                      id='confirmPassword'
                      type='password'
                      value={confirmPassword}
                      autoComplete='new-password'
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className='w-full pl-12 pr-4 py-3 bg-slate-800/50 backdrop-blur-sm text-white rounded-xl border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-slate-500'
                      placeholder='Re-enter your password'
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className='text-xs text-red-300 font-medium'>
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className='grid gap-2 text-xs text-slate-400'>
                  <div className='flex items-center gap-3'>
                    <ShieldCheck className='w-4 h-4 text-blue-300' />
                    <span>
                      Credentials encrypted in transit and at rest.
                    </span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <CheckCircle2 className='w-4 h-4 text-blue-300' />
                    <span>Single sign-on and SCIM provisioning ready.</span>
                  </div>
                </div>

                <div className='flex items-start gap-3 text-sm text-slate-300'>
                  <input
                    id='terms'
                    type='checkbox'
                    checked={acceptPolicy}
                    onChange={(event) => setAcceptPolicy(event.target.checked)}
                    className='mt-1 h-4 w-4 rounded border border-slate-500 bg-slate-800/60 text-blue-500 focus:ring-blue-500 focus:ring-offset-0'
                  />
                  <label htmlFor='terms' className='leading-relaxed'>
                    I agree to the{' '}
                    <Link
                      href='/legal/terms'
                      className='text-blue-300 hover:text-blue-200 underline-offset-2 hover:underline'
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href='/legal/privacy'
                      className='text-blue-300 hover:text-blue-200 underline-offset-2 hover:underline'
                    >
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>

                <button
                  type='submit'
                  disabled={isLoading}
                  className='w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2'
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='w-5 h-5 animate-spin' />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <Lock className='w-5 h-5' />
                      <span>Get started</span>
                      <ArrowRight className='w-4 h-4' />
                    </>
                  )}
                </button>
              </form>

              <p className='text-center text-slate-400 text-sm mt-6'>
                Already have a workspace?{' '}
                <Link
                  href='/login'
                  className='text-blue-300 hover:text-blue-200 font-semibold'
                >
                  Sign in instead
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Insight Panel */}
          <div className='relative hidden lg:flex flex-col justify-between rounded-2xl border border-slate-700/50 bg-slate-900/45 backdrop-blur-xl shadow-[0_40px_80px_-40px_rgba(15,23,42,0.7)] p-10 overflow-hidden'>
            <div className='absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-slate-900/40'></div>
            <div className='absolute -top-32 right-0 w-56 h-56 rounded-full bg-blue-400/20 blur-3xl'></div>
            <div className='absolute bottom-[-60px] left-[-30px] w-48 h-48 rounded-full bg-cyan-400/15 blur-3xl'></div>

            <div className='relative space-y-6'>
              <div>
                <span className='inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-blue-200'>
                  Live workspace
                </span>
                <h2 className='mt-5 text-3xl font-semibold text-white leading-tight'>
                  Orchestrate every routine in one place.
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
                  <ArrowRight className='w-5 h-5 text-blue-300 mt-1 flex-shrink-0' />
                  <div>
                    <h3 className='text-sm font-semibold text-white'>Insights that ship</h3>
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
