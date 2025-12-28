'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { CalendarDays, Loader2 } from 'lucide-react';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useSessionStore } from '@/stores/session-store';

export default function RitualSessionsPage() {
  const { ritualId } = useParams<{ ritualId: string }>();
  const searchParams = useSearchParams();
  const teamId = searchParams.get('teamId');
  const { activeWorkspaceId } = useWorkspace();

  const sessionsByRitualId = useSessionStore(
    (state) => state.sessionsByRitualId,
  );
  const fetchSessions = useSessionStore((state) => state.fetchSessions);
  const isLoading = useSessionStore((state) => state.isLoading);
  const error = useSessionStore((state) => state.error);

  useEffect(() => {
    if (!activeWorkspaceId || !teamId) return;
    fetchSessions(activeWorkspaceId, teamId, ritualId).catch(() => {});
  }, [activeWorkspaceId, teamId, ritualId, fetchSessions]);

  if (!teamId) {
    return (
      <div className='rounded-3xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-200'>
        Missing team context. Open sessions from a team page.
      </div>
    );
  }

  const sessions = sessionsByRitualId[ritualId] ?? [];

  return (
    <div className='flex flex-col gap-8'>
      <header className='flex flex-col gap-3 rounded-3xl border border-slate-800/70 bg-slate-900/60 p-8 backdrop-blur-xl'>
        <p className='text-xs uppercase tracking-[0.35em] text-blue-300'>Ritual sessions</p>
        <h1 className='text-3xl font-semibold text-white'>Scheduled sessions</h1>
        <p className='text-sm text-slate-300'>View upcoming and past sessions for this ritual.</p>
      </header>

      <section className='rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6 backdrop-blur-xl'>
        {isLoading && (
          <div className='flex items-center justify-center rounded-2xl border border-slate-800/60 bg-slate-900/70 p-6 text-sm text-slate-400'>
            <Loader2 className='mr-3 h-4 w-4 animate-spin text-blue-300' />
            Loading sessions...
          </div>
        )}

        {error && !isLoading && (
          <div className='rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200'>
            {error}
          </div>
        )}

        {!isLoading && !error && sessions.length === 0 && (
          <div className='rounded-2xl border border-slate-800/60 bg-slate-900/70 p-6 text-sm text-slate-400'>
            No sessions scheduled yet for this ritual.
          </div>
        )}

        <div className='mt-4 space-y-4'>
          {sessions.map((session) => (
            <article
              key={session.id}
              className='flex items-center justify-between gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4'
            >
              <div className='flex items-center gap-3'>
                <CalendarDays className='h-5 w-5 text-blue-300' />
                <div>
                  <p className='text-sm font-medium text-slate-200'>
                    <time dateTime={session.scheduledFor}>
                      {new Date(session.scheduledFor).toLocaleDateString()}
                    </time>
                  </p>
                  <p className='text-xs text-slate-400'>Status: {session.status}</p>
                </div>
              </div>
              <Link
                href={`/sessions/${session.id}?teamId=${teamId}&ritualId=${session.ritualId}`}
                className='rounded-lg border border-blue-500/60 bg-blue-500/20 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-blue-100 transition hover:bg-blue-500/30'
              >
                Open session
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
