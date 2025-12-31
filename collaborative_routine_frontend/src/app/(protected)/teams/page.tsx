'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Layers3, Loader, Loader2, Search, Users } from 'lucide-react';
import { useTeams } from '@/hooks/useTeams';

export default function TeamsPage() {
  const { teams, isLoading, error, refetch, createTeam, isWorkspaceOwner } = useTeams();
  const [query, setQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  const filteredTeams = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    if (!lowered) {
      return teams;
    }
    return teams.filter((team) =>
      team.name.toLowerCase().includes(lowered),
    );
  }, [teams, query]);

  const handleCreateTeam = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!newTeamName.trim()) {
      setCreateError('Team name is required');
      return;
    }

    setCreateError(null);
    const created = await createTeam(newTeamName);

    if (created) {
      setNewTeamName('');
      setIsCreateOpen(false);
    }
  };

  return (
    <div className='flex flex-col gap-8'>
      <header className='flex flex-col gap-3 rounded-3xl border border-slate-800/70 bg-slate-900/60 p-8 backdrop-blur-xl md:flex-row md:items-center md:justify-between'>
        <div>
          <p className='text-xs uppercase tracking-[0.35em] text-blue-300'>Teams</p>
          <h1 className='mt-2 text-3xl font-semibold text-white'>Your teams</h1>
          <p className='mt-2 text-sm text-slate-300'>Create rituals, assign facilitators, and keep visibility across every team.</p>
        </div>
        {isWorkspaceOwner ? (
          <button
            type='button'
            onClick={() => setIsCreateOpen(true)}
            className='mt-4 inline-flex items-center gap-2 rounded-xl border border-blue-500/40 bg-blue-500/20 px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-blue-100 shadow-[0_20px_40px_-30px_rgba(14,165,233,0.8)] transition hover:bg-blue-500/30 md:mt-0'
          >
            <Layers3 className='h-4 w-4' />
            New team
          </button>
        ) : (
          <span className='mt-4 rounded-full border border-slate-700/70 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-500 md:mt-0'>Owner only</span>
        )}
      </header>

      {isWorkspaceOwner && isCreateOpen && (
        <section className='rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6 backdrop-blur-xl'>
          <form onSubmit={handleCreateTeam} className='space-y-4'>
            <div>
              <label className='block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400'>
                Team name
              </label>
              <input
                value={newTeamName}
                onChange={(event) => setNewTeamName(event.target.value)}
                placeholder='Product Pod A'
                className='mt-2 w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
              />
            </div>

            {createError && (
              <p className='text-xs text-red-300'>{createError}</p>
            )}

            <div className='flex items-center gap-3'>
              <button
                type='submit'
                className='inline-flex items-center gap-2 rounded-xl border border-blue-500/60 bg-blue-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-blue-100 transition hover:bg-blue-500/30'
              >
                <Loader2 className='h-3 w-3' />
                Create team
              </button>
              <button
                type='button'
                onClick={() => {
                  setIsCreateOpen(false);
                  setNewTeamName('');
                  setCreateError(null);
                }}
                className='text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 hover:text-slate-200'
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className='rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6 backdrop-blur-xl'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='relative w-full max-w-sm'>
            <Search className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500' />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder='Filter by team name'
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
              <Users className='h-3.5 w-3.5' /> {teams.length} teams
            </span>
          </div>
        </div>

        <div className='mt-6 space-y-4'>
          {isLoading && (
            <div className='flex items-center justify-center rounded-2xl border border-slate-800/60 bg-slate-900/70 p-6 text-sm text-slate-400'>
              <Loader className='mr-3 h-4 w-4 animate-spin text-blue-300' />
              Syncing teams...
            </div>
          )}

          {error && !isLoading && (
            <div className='flex items-start gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200'>
              <span>{error}</span>
            </div>
          )}

          {!isLoading && !error && filteredTeams.length === 0 && (
            <div className='rounded-2xl border border-slate-800/60 bg-slate-900/70 p-6 text-sm text-slate-400'>
              No teams match your filters. Adjust search or create a new team.
            </div>
          )}

          {!isLoading && !error &&
            filteredTeams.map((team) => (
              <article
                key={team.id}
                className='rounded-2xl border border-slate-800/60 bg-slate-900/70 p-6 transition hover:border-blue-500/60 hover:shadow-[0_35px_55px_-35px_rgba(30,64,175,0.75)]'
              >
                <div className='flex flex-wrap items-center justify-between gap-4'>
                  <div>
                    <h2 className='text-lg font-semibold text-white'>{team.name}</h2>
                  </div>
                  <div className='flex items-center gap-6 text-xs uppercase tracking-[0.3em] text-slate-400'>
                    <span>{team.createdAt ? new Date(team.createdAt).toLocaleDateString() : '—'}</span>
                  </div>
                </div>
                <div className='mt-4 flex flex-col gap-3 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between'>
                  <div>
                    Created{' '}
                    {team.createdAt ? (
                      <time dateTime={team.createdAt} className='font-medium text-slate-200'>
                        {new Date(team.createdAt).toLocaleString()}
                      </time>
                    ) : (
                      <span className='font-medium text-slate-200'>—</span>
                    )}
                  </div>
                  <div className='flex items-center gap-2'>
                    <Link
                      href={`/teams/${team.id}`}
                      className='rounded-lg border border-slate-700/60 px-3 py-2 font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:border-blue-500/60 hover:text-blue-200'
                    >
                      Manage team
                    </Link>
                    <Link
                      href={`/teams/${team.id}`}
                      className='rounded-lg border border-blue-500/60 bg-blue-500/20 px-3 py-2 font-semibold uppercase tracking-[0.2em] text-blue-100 transition hover:bg-blue-500/30'
                    >
                      View rituals
                    </Link>
                  </div>
                </div>
              </article>
            ))}
        </div>
      </section>
    </div>
  );
}
