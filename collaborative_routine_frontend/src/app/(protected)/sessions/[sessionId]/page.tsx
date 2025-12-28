'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useSessionStore } from '@/stores/session-store';
import { useAuth } from '@/hooks/useAuth';
import { useTeamStore } from '@/stores/team-store';

export default function SessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const searchParams = useSearchParams();
  const teamId = searchParams.get('teamId');
  const ritualId = searchParams.get('ritualId');
  const { activeWorkspaceId } = useWorkspace();
  const { user } = useAuth();

  const sessionsByRitualId = useSessionStore((state) => state.sessionsByRitualId);
  const responsesBySessionId = useSessionStore((state) => state.responsesBySessionId);
  const fetchSessions = useSessionStore((state) => state.fetchSessions);
  const fetchResponses = useSessionStore((state) => state.fetchResponses);
  const submitResponse = useSessionStore((state) => state.submitResponse);
  const closeSession = useSessionStore((state) => state.closeSession);
  const isLoading = useSessionStore((state) => state.isLoading);
  const error = useSessionStore((state) => state.error);
  const isClosing = useSessionStore(
    (state) => state.closingSessionIds[sessionId] ?? false,
  );

  const membersByTeamId = useTeamStore((state) => state.membersByTeamId);
  const fetchTeamMembers = useTeamStore((state) => state.fetchTeamMembers);

  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!activeWorkspaceId || !teamId || !ritualId) return;
    fetchSessions(activeWorkspaceId, teamId, ritualId).catch(() => {});
    fetchResponses(activeWorkspaceId, teamId, ritualId, sessionId).catch(() => {});
  }, [
    activeWorkspaceId,
    teamId,
    ritualId,
    sessionId,
    fetchSessions,
    fetchResponses,
  ]);

  const teamMembers = teamId ? membersByTeamId[teamId] ?? [] : [];
  const hasLoadedMembers = Boolean(teamId && membersByTeamId[teamId]);
  useEffect(() => {
    if (!activeWorkspaceId || !teamId || hasLoadedMembers) return;
    fetchTeamMembers(activeWorkspaceId, teamId).catch(() => {});
  }, [activeWorkspaceId, teamId, fetchTeamMembers, hasLoadedMembers]);

  if (!teamId || !ritualId) {
    return (
      <div className='rounded-3xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-200'>
        Missing ritual or team context. Open sessions from a ritual or team page.
      </div>
    );
  }

  const allSessionsForRitual = sessionsByRitualId[ritualId] ?? [];
  const session = allSessionsForRitual.find((s) => s.id === sessionId) ?? null;
  const responses = responsesBySessionId[sessionId] ?? [];

  const isOpen = session?.status === 'OPEN';
  const scheduledDate = session?.scheduledFor ? new Date(session.scheduledFor) : null;
  const startedDate = session ? new Date(session.startedAt) : null;
  const closedDate = session?.closedAt ? new Date(session.closedAt) : null;
  const recordedResponses = session?.responseCount ?? responses.length;
  const expectedResponses = session?.expectedResponses ?? 0;
  const responseProgress =
    expectedResponses > 0 ? Math.min(recordedResponses / expectedResponses, 1) : 0;

  const membership = teamMembers.find((member) => member.userId === user?.id) ?? null;
  const isTeamMember = Boolean(membership);
  const isTeamLead = membership?.role === 'LEAD';
  const canSubmitResponse = isOpen && isTeamMember;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !activeWorkspaceId ||
      !teamId ||
      !ritualId ||
      !sessionId ||
      !content.trim() ||
      !canSubmitResponse
    ) {
      return;
    }
    setIsSubmitting(true);
    try {
      await submitResponse(
        activeWorkspaceId,
        teamId,
        ritualId,
        sessionId,
        content.trim(),
      );
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSession = async () => {
    if (!activeWorkspaceId || !teamId || !ritualId) return;
    await closeSession(activeWorkspaceId, teamId, ritualId, sessionId);
  };

  if (!session && isLoading) {
    return (
      <div className='flex items-center justify-center rounded-3xl border border-slate-800/70 bg-slate-900/60 p-10 text-sm text-slate-300'>
        <Loader2 className='mr-3 h-4 w-4 animate-spin text-blue-300' />
        Loading session...
      </div>
    );
  }

  if (!session && !isLoading) {
    return (
      <div className='rounded-3xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-200'>
        Session not found.
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-8'>
      <header className='flex flex-col gap-2 rounded-3xl border border-slate-800/70 bg-slate-900/60 p-8 backdrop-blur-xl'>
        <p className='text-xs uppercase tracking-[0.35em] text-blue-300'>Session</p>
        <h1 className='text-3xl font-semibold text-white'>Ritual session</h1>
        <p className='text-sm text-slate-300'>
          {canSubmitResponse
            ? 'Share your update for this open session.'
            : isOpen
              ? 'You need to be part of this team to submit a response.'
              : 'This session is closed. Review the responses below.'}
        </p>
      </header>

      <section className='grid gap-4 md:grid-cols-3'>
        <div className='rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4'>
          <p className='text-[10px] uppercase tracking-[0.25em] text-slate-500'>Scheduled window</p>
          <p className='mt-2 text-sm font-semibold text-white'>
            {scheduledDate ? scheduledDate.toLocaleString() : '—'}
          </p>
          <p className='text-[10px] uppercase tracking-[0.25em] text-slate-500'>
            {startedDate ? `Started ${startedDate.toLocaleString()}` : 'Not started yet'}
          </p>
          {closedDate && (
            <p className='text-[10px] uppercase tracking-[0.25em] text-slate-500'>
              Closed {closedDate.toLocaleString()}
            </p>
          )}
        </div>
        <div className='rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4'>
          <p className='text-[10px] uppercase tracking-[0.25em] text-slate-500'>Responses collected</p>
          <p className='mt-2 text-2xl font-semibold text-white'>
            {recordedResponses}
            {expectedResponses ? (
              <span className='text-sm font-normal text-slate-400'> / {expectedResponses}</span>
            ) : null}
          </p>
          <div className='mt-3 h-2 rounded-full bg-slate-800'>
            <div
              className='h-full rounded-full bg-gradient-to-r from-blue-400 to-violet-400'
              style={{ width: `${responseProgress * 100}%` }}
            />
          </div>
          <p className='mt-2 text-[10px] uppercase tracking-[0.25em] text-slate-500'>
            {expectedResponses
              ? `${Math.round(responseProgress * 100)}% of members responded`
              : 'Responses update in real time'}
          </p>
        </div>
        <div className='rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4'>
          <p className='text-[10px] uppercase tracking-[0.25em] text-slate-500'>Session status</p>
          <p className='mt-2 text-lg font-semibold text-white'>
            {isOpen ? 'Open for responses' : 'Closed session'}
          </p>
          {startedDate && (
            <p className='text-[10px] uppercase tracking-[0.25em] text-slate-500'>
              Opened {startedDate.toLocaleString()}
            </p>
          )}
          {isTeamLead && isOpen && (
            <button
              type='button'
              onClick={handleCloseSession}
              disabled={isClosing}
              className='mt-3 inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/60 bg-emerald-500/15 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-100 transition hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isClosing && <Loader2 className='h-3.5 w-3.5 animate-spin' />}
              {isClosing ? 'Closing...' : 'Close session'}
            </button>
          )}
        </div>
      </section>

      <section className='grid gap-6 lg:grid-cols-[1.1fr_0.9fr]'>
        <div className='rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6 backdrop-blur-xl'>
          <h2 className='text-lg font-semibold text-white'>Your response</h2>
          <p className='text-xs text-slate-400'>
            {canSubmitResponse
              ? 'Share updates, blockers, or reflections for this session.'
              : isOpen
                ? 'Only team members can submit responses.'
                : 'Session closed. New responses can no longer be submitted.'}
          </p>

          <form onSubmit={handleSubmit} className='mt-4 space-y-3'>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              disabled={!canSubmitResponse}
              rows={5}
              className='w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60'
              placeholder={
                canSubmitResponse
                  ? 'Write your response for this ritual session...'
                  : 'You do not have permission to submit a response.'
              }
            />

            <button
              type='submit'
              disabled={!canSubmitResponse || isSubmitting || !content.trim()}
              className='rounded-xl border border-blue-500/60 bg-blue-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-blue-100 transition hover:bg-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isSubmitting ? 'Submitting...' : 'Submit response'}
            </button>
          </form>

          {error && (
            <p className='mt-3 text-xs text-red-300'>{error}</p>
          )}
        </div>

        <div className='rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6 backdrop-blur-xl'>
          <h2 className='text-lg font-semibold text-white'>Team responses</h2>
          <p className='text-xs text-slate-400'>Collected responses for this ritual session.</p>

          <div className='mt-4 space-y-3'>
            {responses.length === 0 && (
              <div className='rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4 text-sm text-slate-400'>
                No responses yet.
              </div>
            )}

            {responses.map((response) => (
              <article
                key={response.id}
                className='rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4 text-sm text-slate-200'
              >
                <p>{response.content}</p>
                <p className='mt-2 text-[10px] uppercase tracking-[0.25em] text-slate-500'>
                  {new Date(response.createdAt).toLocaleString()}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
