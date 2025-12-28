'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { CalendarDays, Loader2, Play, Target } from 'lucide-react';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useSessionStore } from '@/stores/session-store';
import { useAuth } from '@/hooks/useAuth';
import { useTeamStore } from '@/stores/team-store';
import { useRitualStore } from '@/stores/ritual-store';
import type { RitualSessionSummary } from '@/types/session';

const sessionTimestamp = (session?: RitualSessionSummary | null) => {
  if (!session) return null;
  const raw = session.startedAt ?? session.scheduledFor ?? session.createdAt;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
};

export default function RitualSessionsPage() {
  const { ritualId } = useParams<{ ritualId: string }>();
  const searchParams = useSearchParams();
  const teamId = searchParams.get('teamId');
  const { activeWorkspaceId } = useWorkspace();
  const { user } = useAuth();

  const sessionsByRitualId = useSessionStore((state) => state.sessionsByRitualId);
  const fetchSessions = useSessionStore((state) => state.fetchSessions);
  const isLoading = useSessionStore((state) => state.isLoading);
  const error = useSessionStore((state) => state.error);
  const startSession = useSessionStore((state) => state.startSession);
  const isStarting = useSessionStore(
    (state) => state.startingRitualIds[ritualId] ?? false,
  );

  const ritualsByTeamId = useRitualStore((state) => state.ritualsByTeamId);
  const fetchRituals = useRitualStore((state) => state.fetchRituals);
  const membersByTeamId = useTeamStore((state) => state.membersByTeamId);
  const fetchTeamMembers = useTeamStore((state) => state.fetchTeamMembers);

  useEffect(() => {
    if (!activeWorkspaceId || !teamId) return;
    fetchSessions(activeWorkspaceId, teamId, ritualId).catch(() => {});
  }, [activeWorkspaceId, teamId, ritualId, fetchSessions]);

  const hasLoadedRituals = Boolean(teamId && ritualsByTeamId[teamId]);
  useEffect(() => {
    if (!activeWorkspaceId || !teamId || hasLoadedRituals) return;
    fetchRituals(activeWorkspaceId, teamId).catch(() => {});
  }, [activeWorkspaceId, teamId, fetchRituals, hasLoadedRituals]);

  const hasLoadedMembers = Boolean(teamId && membersByTeamId[teamId]);
  useEffect(() => {
    if (!activeWorkspaceId || !teamId || hasLoadedMembers) return;
    fetchTeamMembers(activeWorkspaceId, teamId).catch(() => {});
  }, [activeWorkspaceId, teamId, fetchTeamMembers, hasLoadedMembers]);

  if (!teamId) {
    return (
      <div className='rounded-3xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-200'>
        Missing team context. Open sessions from a team page.
      </div>
    );
  }

  const sessions = sessionsByRitualId[ritualId] ?? [];
  const openSession = sessions.find((session) => session.status === 'OPEN') ?? null;
  const highlightedSession = openSession ?? sessions[0] ?? null;

  const teamMembers = membersByTeamId[teamId] ?? [];
  const membership = teamMembers.find((member) => member.userId === user?.id) ?? null;
  const isTeamLead = membership?.role === 'LEAD';

  const rituals = ritualsByTeamId[teamId] ?? [];
  const ritual = rituals.find((item) => item.id === ritualId) ?? null;

  const canShowStartButton = Boolean(ritual && isTeamLead && ritual.status === 'ACTIVE');
  const showStartButton = canShowStartButton && !openSession;

  const handleStartSession = async () => {
    if (!activeWorkspaceId || !teamId) return;
    await startSession(activeWorkspaceId, teamId, ritualId);
  };

  const responseTarget = highlightedSession?.expectedResponses ?? 0;
  const responseCount = highlightedSession?.responseCount ?? 0;
  const responseProgress =
    responseTarget > 0 ? Math.min(responseCount / responseTarget, 1) : 0;
  const highlightedDate = sessionTimestamp(highlightedSession);

  return (
    <div className='flex flex-col gap-8'>
      <header className='flex flex-col gap-4 rounded-3xl border border-slate-800/70 bg-slate-900/60 p-8 backdrop-blur-xl'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <p className='text-xs uppercase tracking-[0.35em] text-blue-300'>Ritual sessions</p>
            <h1 className='mt-2 text-3xl font-semibold text-white'>
              {ritual?.name ?? 'Session timeline'}
            </h1>
            <p className='mt-2 text-sm text-slate-300'>
              Sessions capture every single run of this ritual. Use them to gather responses,
              close the loop, and keep a continuous history.
            </p>
          </div>
          {canShowStartButton && showStartButton && (
            <button
              type='button'
              onClick={handleStartSession}
              disabled={!showStartButton || isStarting || !activeWorkspaceId}
              className='inline-flex items-center gap-2 rounded-2xl border border-blue-500/60 bg-blue-500/15 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-blue-100 transition hover:bg-blue-500/25 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isStarting ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Play className='h-4 w-4' />
              )}
              {isStarting ? 'Starting...' : 'Start session'}
            </button>
          )}
        </div>
        {!isTeamLead && (
          <p className='text-xs text-slate-500'>Only team leads can start or close sessions.</p>
        )}
        {canShowStartButton && openSession && (
          <p className='text-xs text-amber-300/80'>Close the current open session before starting a new one.</p>
        )}
      </header>

      <section className='rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6 backdrop-blur-xl'>
        <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <div>
            <p className='text-xs uppercase tracking-[0.35em] text-slate-400'>Current session</p>
            <h2 className='text-2xl font-semibold text-white'>
              {highlightedSession
                ? highlightedSession.status === 'OPEN'
                  ? 'Live session in progress'
                  : 'Most recent session'
                : 'No sessions yet'}
            </h2>
            <p className='text-sm text-slate-300'>
              {highlightedSession
                ? highlightedSession.status === 'OPEN'
                  ? 'Collect responses from the team and close the run when you are done.'
                  : 'Review the outcomes from the latest run or kick off another session.'
                : 'Start the first session to begin collecting member responses.'}
            </p>
          </div>
          {highlightedSession && (
            <Link
              href={`/sessions/${highlightedSession.id}?teamId=${teamId}&ritualId=${ritualId}`}
              className='rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-200 transition hover:border-blue-500/60 hover:text-blue-100'
            >
              View session
            </Link>
          )}
        </div>
        <div className='mt-6 grid gap-4 md:grid-cols-3'>
          <div className='rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4'>
            <p className='text-[10px] uppercase tracking-[0.3em] text-slate-500'>Status</p>
            <p className='mt-2 text-lg font-semibold text-white'>
              {highlightedSession ? highlightedSession.status : '—'}
            </p>
            <p className='text-[11px] uppercase tracking-[0.25em] text-slate-500'>
              {highlightedDate ? highlightedDate.toLocaleString() : 'Not started'}
            </p>
          </div>
          <div className='rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4'>
            <div className='flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-slate-500'>
              <span>Responses</span>
              <span>{responseTarget ? `${responseCount} / ${responseTarget}` : `${responseCount}`}</span>
            </div>
            <div className='mt-3 h-2 rounded-full bg-slate-800'>
              <div
                className='h-full rounded-full bg-gradient-to-r from-blue-400 to-violet-400'
                style={{ width: `${responseProgress * 100}%` }}
              />
            </div>
            <p className='mt-2 text-xs text-slate-400'>Live response progress updates automatically as members submit.</p>
          </div>
          <div className='rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4'>
            <div className='flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-slate-500'>
              <Target className='h-4 w-4 text-blue-300' />
              Expected responders
            </div>
            <p className='mt-3 text-lg font-semibold text-white'>
              {responseTarget || '—'}
            </p>
            <p className='text-xs text-slate-400'>Counts every team member assigned to this ritual.</p>
          </div>
        </div>
      </section>

      <section className='rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6 backdrop-blur-xl'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-white'>Session history</h2>
            <p className='text-xs text-slate-400'>Newest runs appear first. Each row links to full detail.</p>
          </div>
        </div>

        {isLoading && (
          <div className='mt-4 flex items-center justify-center rounded-2xl border border-slate-800/60 bg-slate-900/70 p-6 text-sm text-slate-400'>
            <Loader2 className='mr-3 h-4 w-4 animate-spin text-blue-300' />
            Loading sessions...
          </div>
        )}

        {error && !isLoading && (
          <div className='mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200'>
            {error}
          </div>
        )}

        {!isLoading && !error && sessions.length === 0 && (
          <div className='mt-4 rounded-2xl border border-slate-800/60 bg-slate-900/70 p-6 text-sm text-slate-400'>
            No sessions yet. Start one to begin collecting updates.
          </div>
        )}

        <div className='mt-4 space-y-4'>
          {sessions.map((session) => {
            const date = sessionTimestamp(session);
            const target = session.expectedResponses || 0;
            return (
              <article
                key={session.id}
                className='flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4'
              >
                <div className='flex items-center gap-3'>
                  <CalendarDays className='h-5 w-5 text-blue-300' />
                  <div>
                    <p className='text-sm font-semibold text-white'>
                      {date ? date.toLocaleString() : 'Unknown date'}
                    </p>
                    <p className='text-xs text-slate-400'>Status: {session.status}</p>
                    <p className='text-xs text-slate-500'>Responses: {session.responseCount}{target ? ` / ${target}` : ''}</p>
                  </div>
                </div>
                <Link
                  href={`/sessions/${session.id}?teamId=${teamId}&ritualId=${session.ritualId}`}
                  className='rounded-lg border border-blue-500/60 bg-blue-500/15 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-blue-100 transition hover:bg-blue-500/30'
                >
                  Open
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
