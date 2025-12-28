'use client';

import { useMemo, useState } from 'react';
import { Layers3, Loader2, Search, Users } from 'lucide-react';
import { useGroup } from '@/hooks/useGroup';

export default function GroupsPage() {
  const { groups, isLoading, error, refetch } = useGroup();
  const [query, setQuery] = useState('');
  const filteredGroups = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    if (!lowered) {
      return groups;
    }
    return groups.filter((group) =>
      [group.name, group.description]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(lowered))
    );
  }, [groups, query]);

  return (
    <div className='flex flex-col gap-8'>
      <header className='flex flex-col gap-3 rounded-3xl border border-slate-800/70 bg-slate-900/60 p-8 backdrop-blur-xl md:flex-row md:items-center md:justify-between'>
        <div>
          <p className='text-xs uppercase tracking-[0.35em] text-blue-300'>Groups</p>
          <h1 className='mt-2 text-3xl font-semibold text-white'>Your collaborative spaces</h1>
          <p className='mt-2 text-sm text-slate-300'>Create rituals, assign facilitators, and keep visibility across every team.</p>
        </div>
        <button
          type='button'
          onClick={() => console.info('Navigate to create group flow')}
          className='mt-4 inline-flex items-center gap-2 rounded-xl border border-blue-500/40 bg-blue-500/20 px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-blue-100 shadow-[0_20px_40px_-30px_rgba(14,165,233,0.8)] transition hover:bg-blue-500/30 md:mt-0'
        >
          <Layers3 className='h-4 w-4' />
          New group
        </button>
      </header>

      <section className='rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6 backdrop-blur-xl'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='relative w-full max-w-sm'>
            <Search className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500' />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder='Filter by name or ritual'
              className='w-full rounded-xl border border-slate-700/60 bg-slate-900/70 py-3 pl-12 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
            />
          </div>
          <div className='flex items-center gap-3 text-xs text-slate-400'>
            <button
              type='button'
              onClick={() => refetch()}
              className='rounded-xl border border-slate-700/60 px-4 py-2 font-semibold uppercase tracking-[0.25em] transition hover:border-blue-500/60 hover:text-blue-200'
            >
              Refresh
            </button>
            <span className='hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-700/60 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400'>
              <Users className='h-3.5 w-3.5' /> {groups.length} teams
            </span>
          </div>
        </div>

        <div className='mt-6 space-y-4'>
          {isLoading && (
            <div className='flex items-center justify-center rounded-2xl border border-slate-800/60 bg-slate-900/70 p-6 text-sm text-slate-400'>
              <Loader2 className='mr-3 h-4 w-4 animate-spin text-blue-300' />
              Syncing groups...
            </div>
          )}

          {error && !isLoading && (
            <div className='flex items-start gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200'>
              <span>{error}</span>
            </div>
          )}

          {!isLoading && !error && filteredGroups.length === 0 && (
            <div className='rounded-2xl border border-slate-800/60 bg-slate-900/70 p-6 text-sm text-slate-400'>
              No groups match your filters. Adjust search or create a new collaborative space.
            </div>
          )}

          {!isLoading && !error && filteredGroups.map((group) => (
            <article
              key={group.id}
              className='rounded-2xl border border-slate-800/60 bg-slate-900/70 p-6 transition hover:border-blue-500/60 hover:shadow-[0_35px_55px_-35px_rgba(30,64,175,0.75)]'
            >
              <div className='flex flex-wrap items-center justify-between gap-4'>
                <div>
                  <h2 className='text-lg font-semibold text-white'>{group.name}</h2>
                  <p className='text-sm text-slate-300'>{group.description}</p>
                </div>
                <div className='flex items-center gap-6 text-xs uppercase tracking-[0.3em] text-slate-400'>
                  <span>{group.members} members</span>
                  <span>{group.routinesActive} rituals</span>
                  <span>{group.timezone}</span>
                </div>
              </div>
              <div className='mt-4 flex flex-col gap-3 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  Last activity{' '}
                  <time dateTime={group.lastActivity} className='font-medium text-slate-200'>
                    {new Date(group.lastActivity).toLocaleString()}
                  </time>
                </div>
                <div className='flex items-center gap-2'>
                  <button
                    type='button'
                    className='rounded-lg border border-slate-700/60 px-3 py-2 font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:border-blue-500/60 hover:text-blue-200'
                  >
                    Manage
                  </button>
                  <button
                    type='button'
                    className='rounded-lg border border-blue-500/60 bg-blue-500/20 px-3 py-2 font-semibold uppercase tracking-[0.2em] text-blue-100 transition hover:bg-blue-500/30'
                  >
                    Start ritual
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
