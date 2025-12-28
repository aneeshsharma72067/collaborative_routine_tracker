'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LogOut, Menu, PanelsTopLeft, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { WorkspaceGate } from '@/components/layout/workspace-gate';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: PanelsTopLeft },
  { label: 'Teams', href: '/teams', icon: Users },
];

export function ProtectedShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, hasHydrated, logout, user } = useAuth();
  const { workspaces, activeWorkspaceId, setActiveWorkspace } = useWorkspace();

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace('/login');
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-slate-950 text-slate-200'>
        <div className='flex flex-col items-center gap-3'>
          <div className='h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500'></div>
          <p className='text-sm uppercase tracking-[0.2em] text-slate-500'>Validating session {hasHydrated.toString()} {isAuthenticated.toString()  }</p>
        </div>
      </div>
    );
  }

  return (
    <WorkspaceGate>
      <div className='min-h-screen bg-slate-950 text-slate-100'>
        <header className='sticky top-0 z-40 border-b border-slate-800/60 bg-slate-900/70 backdrop-blur-md'>
        <div className='mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4'>
          <div className='flex items-center gap-3'>
            <Menu className='hidden h-5 w-5 text-blue-400 lg:block' />
            <span className='text-lg font-semibold tracking-tight text-white'>Team Rituals & Health</span>
          </div>
          <div className='flex items-center gap-6'>
            <nav className='hidden gap-6 text-sm font-medium text-slate-300 lg:flex'>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-2 transition-colors ${
                      active
                        ? 'text-blue-300'
                        : 'hover:text-blue-200 text-slate-300'
                    }`}
                  >
                    <Icon className='h-4 w-4' />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className='hidden flex-col gap-1 text-xs text-slate-400 lg:flex'>
              <span className='uppercase tracking-[0.3em]'>Workspace</span>
              <select
                value={activeWorkspaceId ?? ''}
                onChange={(event) => {
                  if (!event.target.value) return;
                  setActiveWorkspace(event.target.value);
                }}
                className='rounded-lg border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-blue-500/60 focus:outline-none'
              >
                {workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
            </div>
            <div className='flex items-center gap-4 text-sm text-slate-300'>
              <div className='hidden flex-col text-right leading-tight sm:flex'>
                <span className='font-semibold text-white'>{user?.name ?? 'Operator'}</span>
                <span className='text-xs text-slate-400'>{user?.email}</span>
              </div>
              <button
                type='button'
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                className='inline-flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-blue-500/60 hover:text-blue-200'
              >
                <LogOut className='h-4 w-4' />
                Sign out
              </button>
            </div>
          </div>
        </div>
        </header>
        <main className='mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8'>
          {children}
        </main>
      </div>
    </WorkspaceGate>
  );
}
