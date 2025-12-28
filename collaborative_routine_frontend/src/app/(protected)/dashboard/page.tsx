'use client';

import { useEffect, useMemo, useState } from 'react';
import { Clock, Flame, ListChecks, TrendingUp, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTeams } from '@/hooks/useTeams';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useSentimentStore } from '@/stores/sentiment-store';
import { useWorkspaceMembersStore } from '@/stores/workspace-members-store';
import type { WorkspaceRole } from '@/types/workspace';

export default function DashboardPage() {
  const { user } = useAuth();
  const { teams } = useTeams();
  const { summary, isLoading: isMetricsLoading, error: metricsError } =
    useDashboardSummary();
  const { activeWorkspaceId } = useWorkspace();
  const [sentimentScore, setSentimentScore] = useState(3);
  const sentimentAverages = useSentimentStore((state) => state.averagesByTeamId);
  const submitSentimentScore = useSentimentStore((state) => state.submitScore);
  const fetchSentimentAverage = useSentimentStore((state) => state.fetchAverage);
  const sentimentError = useSentimentStore((state) => state.error);
  const isSentimentSubmitting = useSentimentStore((state) => state.isSubmitting);
  const isFetchingSentimentAverage = useSentimentStore((state) => state.isFetchingAverage);

  const members = useWorkspaceMembersStore((state) =>
    activeWorkspaceId ? state.membersByWorkspaceId[activeWorkspaceId] ?? [] : []
  );
  const fetchMembers = useWorkspaceMembersStore((state) => state.fetchMembers);
  const inviteMember = useWorkspaceMembersStore((state) => state.inviteMember);
  const membersError = useWorkspaceMembersStore((state) => state.error);
  const resetMembersError = useWorkspaceMembersStore((state) => state.resetError);
  const isMembersLoading = useWorkspaceMembersStore((state) => state.isLoading);
  const isInviting = useWorkspaceMembersStore((state) => state.isInviting);

  const [inviteUserId, setInviteUserId] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('MEMBER');

  useEffect(() => {
    if (activeWorkspaceId) {
      fetchMembers(activeWorkspaceId).catch(() => {});
    }
  }, [activeWorkspaceId, fetchMembers]);

  const currentMembership = useMemo(() => {
    if (!user?.id) return null;
    return members.find((member) => member.userId === user.id) ?? null;
  }, [members, user?.id]);

  const isWorkspaceAdmin = currentMembership?.role === 'ADMIN';

  const handleInviteSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeWorkspaceId) return;
    const trimmed = inviteUserId.trim();
    if (!trimmed) return;

    const created = await inviteMember(activeWorkspaceId, {
      userId: trimmed,
      role: inviteRole,
    });

    if (created) {
      setInviteUserId('');
      setInviteRole('MEMBER');
    }
  };

  const primaryTeamId = teams[0]?.id;
  const primaryTeamAverage = primaryTeamId
    ? sentimentAverages[primaryTeamId] ?? null
    : null;

  useEffect(() => {
    if (!activeWorkspaceId || !primaryTeamId) return;
    fetchSentimentAverage(activeWorkspaceId, primaryTeamId).catch(() => {});
  }, [activeWorkspaceId, primaryTeamId, fetchSentimentAverage]);

  const handleSentimentSubmit = async () => {
    if (!activeWorkspaceId || !primaryTeamId) return;
    await submitSentimentScore(activeWorkspaceId, primaryTeamId, sentimentScore);
    await fetchSentimentAverage(activeWorkspaceId, primaryTeamId);
  };

  const liveTeamHealthPercent =
    primaryTeamAverage?.average != null
      ? Math.round((primaryTeamAverage.average / 5) * 100)
      : null;

  return (
    <div className='flex flex-col gap-10'>
      <section className='flex flex-col gap-4 rounded-3xl border border-slate-800/70 bg-slate-900/60 p-8 backdrop-blur-xl'>
        <p className='text-sm uppercase tracking-[0.35em] text-blue-300'>Operator dashboard</p>
        <h1 className='text-3xl font-semibold text-white sm:text-4xl'>
          Welcome back, {user?.name ?? 'team lead'}
        </h1>
        <p className='max-w-2xl text-sm text-slate-300'>
          Stay on top of your rituals, unblock teams faster, and keep the entire organization in rhythm. Here’s what is happening across your workspaces today.
        </p>
      </section>

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <div className='rounded-2xl border border-slate-800/60 bg-slate-900/50 p-6 shadow-[0_30px_50px_-30px_rgba(15,23,42,0.8)]'>
          <div className='flex items-center justify-between'>
            <span className='text-xs uppercase tracking-[0.3em] text-slate-400'>Active rituals</span>
            <Flame className='h-5 w-5 text-blue-300' />
          </div>
          <div className='mt-6 flex items-baseline gap-3'>
            <span className='text-3xl font-semibold text-white'>
              {summary?.activeRituals ?? (isMetricsLoading ? '—' : 0)}
            </span>
            <span className='text-xs font-medium uppercase tracking-[0.25em] text-blue-300'>Workspace-wide</span>
          </div>
          <p className='mt-4 text-xs text-slate-400'>Active rituals across all teams in this workspace.</p>
        </div>

        <div className='rounded-2xl border border-slate-800/60 bg-slate-900/50 p-6 shadow-[0_30px_50px_-30px_rgba(15,23,42,0.8)]'>
          <div className='flex items-center justify-between'>
            <span className='text-xs uppercase tracking-[0.3em] text-slate-400'>Upcoming sessions</span>
            <Clock className='h-5 w-5 text-blue-300' />
          </div>
          <div className='mt-6 flex items-baseline gap-3'>
            <span className='text-3xl font-semibold text-white'>
              {summary?.upcomingSessions ?? (isMetricsLoading ? '—' : 0)}
            </span>
            <span className='text-xs font-medium uppercase tracking-[0.25em] text-blue-300'>Next 7 days</span>
          </div>
          <p className='mt-4 text-xs text-slate-400'>Scheduled ritual sessions coming up this week.</p>
        </div>

        <div className='rounded-2xl border border-slate-800/60 bg-slate-900/50 p-6 shadow-[0_30px_50px_-30px_rgba(15,23,42,0.8)]'>
          <div className='flex items-center justify-between'>
            <span className='text-xs uppercase tracking-[0.3em] text-slate-400'>Completed sessions</span>
            <ListChecks className='h-5 w-5 text-blue-300' />
          </div>
          <div className='mt-6 flex items-baseline gap-3'>
            <span className='text-3xl font-semibold text-white'>
              {summary?.completedSessions ?? (isMetricsLoading ? '—' : 0)}
            </span>
            <span className='text-xs font-medium uppercase tracking-[0.25em] text-blue-300'>This workspace</span>
          </div>
          <p className='mt-4 text-xs text-slate-400'>Sessions successfully completed across all rituals.</p>
        </div>

        <div className='rounded-2xl border border-slate-800/60 bg-slate-900/50 p-6 shadow-[0_30px_50px_-30px_rgba(15,23,42,0.8)]'>
          <div className='flex items-center justify-between'>
            <span className='text-xs uppercase tracking-[0.3em] text-slate-400'>Team health score</span>
            <TrendingUp className='h-5 w-5 text-blue-300' />
          </div>
          <div className='mt-6 flex items-baseline gap-3'>
            <span className='text-3xl font-semibold text-white'>
              {liveTeamHealthPercent ??
                (summary?.averageSentiment != null
                  ? Math.round(summary.averageSentiment * 20)
                  : '—')}
            </span>
            <span className='text-xs font-medium uppercase tracking-[0.25em] text-blue-300'>/ 100</span>
          </div>
          <p className='mt-4 text-xs text-slate-400'>
            {primaryTeamAverage?.average != null
              ? `Live pulse from your primary team (${primaryTeamAverage.average.toFixed(1)}/5).`
              : 'Aggregated sentiment from weekly pulses.'}
          </p>
          {isFetchingSentimentAverage && (
            <p className='mt-2 text-[10px] uppercase tracking-[0.25em] text-slate-500'>Refreshing pulse…</p>
          )}
        </div>

        {metricsError && !isMetricsLoading && (
          <div className='md:col-span-2 xl:col-span-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-200'>
            {metricsError}
          </div>
        )}
      </section>

      <section className='grid gap-6 lg:grid-cols-[1.1fr_0.9fr]'>
        <div className='rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6 backdrop-blur-xl'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-lg font-semibold text-white'>Today’s agenda</h2>
              <p className='text-xs text-slate-400'>Upcoming rituals across all teams</p>
            </div>
            <button
              type='button'
              className='rounded-xl border border-slate-700/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-300 transition hover:border-blue-500/60 hover:text-blue-200'
            >
              Export
            </button>
          </div>
          <div className='mt-6 space-y-4'>
            {teams.slice(0, 3).map((team) => (
              <div
                key={team.id}
                className='rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4'
              >
                <div className='flex flex-wrap items-center justify-between gap-3'>
                  <div>
                    <p className='text-sm font-semibold text-white'>{team.name}</p>
                    <p className='text-xs text-slate-400'>Rituals and sessions for this team.</p>
                  </div>
                  <div className='flex items-center gap-4 text-xs text-slate-400'>
                    <span>Team created</span>
                    <span>
                      {team.createdAt
                        ? new Date(team.createdAt).toLocaleDateString()
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {!teams.length && (
              <div className='rounded-2xl border border-slate-800/60 bg-slate-900/70 p-6 text-sm text-slate-400'>
                No rituals scheduled yet. Create your first team to get started.
              </div>
            )}
          </div>
        </div>

        <div className='rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6 backdrop-blur-xl'>
          <h2 className='text-lg font-semibold text-white'>Sentiment pulse</h2>
          <p className='text-xs text-slate-400'>Weekly sentiment snapshot for your primary team.</p>

          <div className='mt-6 space-y-4'>
            <div className='rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4'>
              <label className='flex items-center justify-between text-sm font-medium text-slate-200'>
                <span>How is your team feeling this week?</span>
                <span className='text-xs text-blue-300'>Score: {sentimentScore}</span>
              </label>
              <input
                type='range'
                min={1}
                max={5}
                step={1}
                value={sentimentScore}
                onChange={(event) => setSentimentScore(Number(event.target.value))}
                className='mt-4 w-full accent-blue-500'
              />
              <div className='mt-3 flex justify-between text-[10px] uppercase tracking-[0.2em] text-slate-500'>
                <span>Low</span>
                <span>Neutral</span>
                <span>High</span>
              </div>
              <button
                type='button'
                disabled={!activeWorkspaceId || !primaryTeamId || isSentimentSubmitting}
                onClick={handleSentimentSubmit}
                className='mt-4 w-full rounded-xl border border-blue-500/60 bg-blue-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-blue-100 transition hover:bg-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {isSentimentSubmitting ? 'Submitting pulse...' : 'Submit weekly pulse'}
              </button>
              {primaryTeamAverage?.average != null && (
                <p className='mt-3 text-xs text-slate-400'>Current average: {primaryTeamAverage.average.toFixed(1)} / 5</p>
              )}
              {sentimentError && (
                <p className='mt-2 text-xs text-red-300'>{sentimentError}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className='rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6 backdrop-blur-xl'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-white'>Workspace members</h2>
            <p className='text-xs text-slate-400'>Owners, admins, and members with access to this workspace.</p>
          </div>
          <div className='text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400'>
            {members.length} members
          </div>
        </div>

        {membersError && (
          <div className='mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-200'>
            {membersError}
          </div>
        )}

        {isMembersLoading ? (
          <div className='mt-6 flex items-center justify-center rounded-2xl border border-slate-800/60 bg-slate-900/70 p-6 text-sm text-slate-400'>
            <Loader2 className='mr-3 h-4 w-4 animate-spin text-blue-300' />
            Syncing workspace roster...
          </div>
        ) : (
          <div className='mt-6 space-y-3'>
            {members.length === 0 && (
              <div className='rounded-2xl border border-slate-800/60 bg-slate-900/70 p-6 text-sm text-slate-400'>
                No members synced yet. Invite teammates by user ID.
              </div>
            )}
            {members.map((member) => (
              <div
                key={member.id}
                className='flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/70 px-4 py-3'
              >
                <div>
                  <p className='text-sm font-semibold text-white'>{member.user?.name ?? member.user?.email ?? member.userId}</p>
                  <p className='text-xs text-slate-400'>{member.user?.email ?? 'User not available'}</p>
                </div>
                <div className='flex flex-col items-end text-xs text-slate-400'>
                  <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] ${member.role === 'ADMIN' ? 'border-blue-500/60 text-blue-200' : 'border-slate-700/60'}`}>
                    {member.role === 'ADMIN' ? 'Workspace owner' : 'Member'}
                  </span>
                  <span className='mt-1 text-[10px] uppercase tracking-[0.25em]'>
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className='mt-8 rounded-2xl border border-slate-800/60 bg-slate-900/70 p-5'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-semibold text-white'>Invite member</p>
              <p className='text-xs text-slate-400'>Requires workspace admin permissions.</p>
            </div>
            {isWorkspaceAdmin ? (
              <span className='text-[10px] font-semibold uppercase tracking-[0.35em] text-blue-300'>Admin</span>
            ) : (
              <span className='text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-500'>View only</span>
            )}
          </div>

          {isWorkspaceAdmin ? (
            <form onSubmit={handleInviteSubmit} className='mt-4 space-y-4'>
              <div>
                <label className='text-xs font-semibold uppercase tracking-[0.3em] text-slate-400'>User ID</label>
                <input
                  value={inviteUserId}
                  onChange={(event) => {
                    if (membersError) {
                      resetMembersError();
                    }
                    setInviteUserId(event.target.value);
                  }}
                  placeholder='Paste existing user ID'
                  className='mt-2 w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
                />
              </div>
              <div>
                <label className='text-xs font-semibold uppercase tracking-[0.3em] text-slate-400'>Role</label>
                <select
                  value={inviteRole}
                  onChange={(event) => setInviteRole(event.target.value as WorkspaceRole)}
                  className='mt-2 w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 focus:border-blue-500/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
                >
                  <option value='MEMBER'>Member</option>
                  <option value='ADMIN'>Admin</option>
                </select>
              </div>
              <button
                type='submit'
                disabled={!inviteUserId.trim() || isInviting}
                className='inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/60 bg-blue-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-blue-100 transition hover:bg-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {isInviting ? <Loader2 className='h-4 w-4 animate-spin' /> : null}
                {isInviting ? 'Sending invite' : 'Add member'}
              </button>
              <p className='text-[10px] text-slate-500'>Invites require the user to exist in the system today. SCIM-based provisioning will hook in later.</p>
            </form>
          ) : (
            <p className='mt-4 text-sm text-slate-400'>Only workspace admins can invite additional members. Contact an owner if you need elevated access.</p>
          )}
        </div>
      </section>
    </div>
  );
}
