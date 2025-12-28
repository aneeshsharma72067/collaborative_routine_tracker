'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CalendarDays, Loader2, Users } from 'lucide-react';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useTeamStore } from '@/stores/team-store';
import { useRitualStore } from '@/stores/ritual-store';
import { useSessionStore } from '@/stores/session-store';
import type { RitualType, RitualFrequency, RitualStatus } from '@/types/ritual';
import type { TeamRole } from '@/types/team';
import { useWorkspaceMembersStore } from '@/stores/workspace-members-store';
import { useAuth } from '@/hooks/useAuth';

export default function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const router = useRouter();
  const { activeWorkspaceId } = useWorkspace();
  const { user } = useAuth();

  const teams = useTeamStore((state) => state.teams);
  const teamError = useTeamStore((state) => state.error);
  const isTeamsLoading = useTeamStore((state) => state.isLoading);
  const fetchTeams = useTeamStore((state) => state.fetchTeams);
  const fetchTeamMembers = useTeamStore((state) => state.fetchTeamMembers);
  const addTeamMemberToStore = useTeamStore((state) => state.addTeamMember);
  const isManagingMembers = useTeamStore((state) => state.isManagingMembers);
  const membersByTeamId = useTeamStore((state) => state.membersByTeamId);

  const ritualsByTeamId = useRitualStore((state) => state.ritualsByTeamId);
  const ritualError = useRitualStore((state) => state.error);
  const isRitualsLoading = useRitualStore((state) => state.isLoading);
  const isCreatingRitual = useRitualStore((state) => state.isCreating);
  const ritualUpdateState = useRitualStore((state) => state.updatingRitualIds);
  const fetchRituals = useRitualStore((state) => state.fetchRituals);
  const createRitual = useRitualStore((state) => state.createRitual);
  const updateRitualStatus = useRitualStore((state) => state.updateRitualStatus);

  const sessionsByRitualId = useSessionStore((state) => state.sessionsByRitualId);
  const fetchSessions = useSessionStore((state) => state.fetchSessions);
  const sessionsError = useSessionStore((state) => state.error);

  const workspaceMembers = useWorkspaceMembersStore((state) =>
    activeWorkspaceId
      ? state.membersByWorkspaceId[activeWorkspaceId] ?? []
      : []
  );
  const fetchWorkspaceMembers = useWorkspaceMembersStore((state) => state.fetchMembers);
  const workspaceMembersError = useWorkspaceMembersStore((state) => state.error);
  const resetWorkspaceMembersError = useWorkspaceMembersStore((state) => state.resetError);
  const isWorkspaceMembersLoading = useWorkspaceMembersStore((state) => state.isLoading);

  const team = useMemo(
    () => teams.find((item) => item.id === teamId) ?? null,
    [teams, teamId],
  );

  const members = membersByTeamId[teamId] ?? [];
  const rituals = ritualsByTeamId[teamId] ?? [];

  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedRole, setSelectedRole] = useState<TeamRole>('MEMBER');
  const [memberFormError, setMemberFormError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRitualName, setNewRitualName] = useState('');
  const [newRitualType, setNewRitualType] = useState<RitualType>('STANDUP');
  const [newRitualFrequency, setNewRitualFrequency] = useState<RitualFrequency>('WEEKLY');
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeWorkspaceId) return;

    if (!teams.length && !isTeamsLoading) {
      fetchTeams(activeWorkspaceId).catch(() => {});
    }

    fetchTeamMembers(activeWorkspaceId, teamId).catch(() => {});
    fetchRituals(activeWorkspaceId, teamId).catch(() => {});
  }, [
    activeWorkspaceId,
    teamId,
    teams.length,
    isTeamsLoading,
    fetchTeams,
    fetchTeamMembers,
    fetchRituals,
  ]);

  useEffect(() => {
    if (activeWorkspaceId) {
      fetchWorkspaceMembers(activeWorkspaceId).catch(() => {});
    }
  }, [activeWorkspaceId, fetchWorkspaceMembers]);

  useEffect(() => {
    if (!activeWorkspaceId || !rituals.length) return;

    rituals.forEach((ritual) => {
      if (!sessionsByRitualId[ritual.id]) {
        fetchSessions(activeWorkspaceId, teamId, ritual.id).catch(() => {});
      }
    });
  }, [activeWorkspaceId, teamId, rituals, sessionsByRitualId, fetchSessions]);

  if (!team && !isTeamsLoading && teamError) {
    return (
      <div className='rounded-3xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-200'>
        {teamError}
      </div>
    );
  }

  if (!team) {
    return (
      <div className='flex items-center justify-center rounded-3xl border border-slate-800/70 bg-slate-900/60 p-10 text-sm text-slate-300'>
        <Loader2 className='mr-3 h-4 w-4 animate-spin text-blue-300' />
        Loading team...
      </div>
    );
  }

  const upcomingSessions = rituals
    .flatMap((ritual) => sessionsByRitualId[ritual.id] ?? [])
    .filter((session) => session.status === 'OPEN')
    .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor))
    .slice(0, 5);

  const membershipByUserId = useMemo(() => {
    const map = new Map<string, boolean>();
    members.forEach((member) => map.set(member.userId, true));
    return map;
  }, [members]);

  const availableWorkspaceMembers = useMemo(() => {
    return workspaceMembers.filter(
      (workspaceMember) => !membershipByUserId.get(workspaceMember.userId),
    );
  }, [workspaceMembers, membershipByUserId]);

  const currentTeamMembership = useMemo(() => {
    if (!user?.id) {
      return null;
    }
    return members.find((member) => member.userId === user.id) ?? null;
  }, [members, user?.id]);

  const isTeamLead = currentTeamMembership?.role === 'LEAD';
  const canManageMembers = isTeamLead;

  const handleCreateRitual = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!activeWorkspaceId) return;
    if (!newRitualName.trim()) {
      setCreateError('Ritual name is required');
      return;
    }

    setCreateError(null);
    const created = await createRitual(activeWorkspaceId, teamId, {
      name: newRitualName.trim(),
      type: newRitualType,
      frequency: newRitualFrequency,
    });

    if (created) {
      setNewRitualName('');
      setNewRitualType('STANDUP');
      setNewRitualFrequency('WEEKLY');
      setIsCreateOpen(false);
    }
  };

  const handleAddMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeWorkspaceId) return;
    if (!selectedMemberId) {
      setMemberFormError('Select a workspace member to add');
      return;
    }
    setMemberFormError(null);

    const result = await addTeamMemberToStore(activeWorkspaceId, teamId, {
      userId: selectedMemberId,
      role: selectedRole,
    });

    if (result) {
      setSelectedMemberId('');
      setSelectedRole('MEMBER');
    }
  };

  const handleRitualStatusToggle = async (
    ritualId: string,
    currentStatus: RitualStatus,
  ) => {
    if (!activeWorkspaceId) return;
    const nextStatus: RitualStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    await updateRitualStatus(activeWorkspaceId, teamId, ritualId, nextStatus);
  };

  return (
    <div className='flex flex-col gap-8'>
      <header className='flex flex-col gap-4 rounded-3xl border border-slate-800/70 bg-slate-900/60 p-8 backdrop-blur-xl'>
        <button
          type='button'
          onClick={() => router.push('/teams')}
          className='text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 hover:text-slate-300'
        >
          Teams overview
        </button>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div>
            <p className='text-xs uppercase tracking-[0.35em] text-blue-300'>Team</p>
            <h1 className='mt-2 text-3xl font-semibold text-white'>{team.name}</h1>
            <p className='mt-2 text-sm text-slate-300'>Central hub for this team&apos;s rituals and sessions.</p>
          </div>
          <div className='flex items-center gap-6 text-xs uppercase tracking-[0.3em] text-slate-400'>
            <span className='inline-flex items-center gap-2'>
              <Users className='h-4 w-4' /> {members.length} members
            </span>
            <span>{rituals.length} rituals</span>
          </div>
        </div>
      </header>

      <section className='rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6 backdrop-blur-xl'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-white'>Team members</h2>
            <p className='text-xs text-slate-400'>Workspace members currently assigned to this team.</p>
          </div>
          <div className='text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400'>
            {members.length} members
          </div>
        </div>

        {workspaceMembersError && (
          <div className='mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-200'>
            {workspaceMembersError}
          </div>
        )}

        <div className='mt-6 space-y-3'>
          {members.length === 0 && (
            <div className='rounded-2xl border border-slate-800/60 bg-slate-900/70 p-5 text-sm text-slate-400'>
              No members yet. Leads can add workspace members to this team.
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
                <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] ${member.role === 'LEAD' ? 'border-blue-500/60 text-blue-200' : 'border-slate-700/60'}`}>
                  {member.role === 'LEAD' ? 'Team lead' : 'Member'}
                </span>
                <span className='mt-1 text-[10px] uppercase tracking-[0.25em]'>
                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className='mt-8 rounded-2xl border border-slate-800/60 bg-slate-900/70 p-5'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-semibold text-white'>Add team member</p>
              <p className='text-xs text-slate-400'>Only team leads can add workspace users to this team.</p>
            </div>
            <span className='text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400'>
              {canManageMembers ? 'Lead access' : 'View only'}
            </span>
          </div>

          {canManageMembers ? (
            <form onSubmit={handleAddMember} className='mt-4 space-y-4'>
              <div>
                <label className='text-xs font-semibold uppercase tracking-[0.3em] text-slate-400'>Workspace member</label>
                <select
                  value={selectedMemberId}
                  onChange={(event) => {
                    if (workspaceMembersError) {
                      resetWorkspaceMembersError();
                    }
                    setSelectedMemberId(event.target.value);
                  }}
                  disabled={isWorkspaceMembersLoading}
                  className='mt-2 w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 focus:border-blue-500/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60'
                >
                  <option value=''>Select member</option>
                  {availableWorkspaceMembers.map((workspaceMember) => (
                    <option key={workspaceMember.id} value={workspaceMember.userId}>
                      {workspaceMember.user?.name ?? workspaceMember.user?.email ?? workspaceMember.userId}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='text-xs font-semibold uppercase tracking-[0.3em] text-slate-400'>Role</label>
                <select
                  value={selectedRole}
                  onChange={(event) => setSelectedRole(event.target.value as TeamRole)}
                  className='mt-2 w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 focus:border-blue-500/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
                >
                  <option value='MEMBER'>Member</option>
                  <option value='LEAD'>Lead</option>
                </select>
              </div>

              {(memberFormError || teamError) && (
                <p className='text-xs text-red-300'>{memberFormError ?? teamError}</p>
              )}

              <button
                type='submit'
                disabled={!selectedMemberId || isManagingMembers}
                className='inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/60 bg-blue-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-blue-100 transition hover:bg-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {isManagingMembers && <Loader2 className='h-4 w-4 animate-spin' />}
                {isManagingMembers ? 'Adding member' : 'Add member'}
              </button>
              <p className='text-[10px] text-slate-500'>Workspace admins can adjust member roles later from the dashboard.</p>
            </form>
          ) : (
            <p className='mt-4 text-sm text-slate-400'>Only team leads can add or update team members. Contact a lead for access changes.</p>
          )}
        </div>
      </section>

      <section className='grid gap-6 lg:grid-cols-[1.1fr_0.9fr]'>
        <div className='rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6 backdrop-blur-xl'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-lg font-semibold text-white'>Rituals</h2>
              <p className='text-xs text-slate-400'>Recurring ceremonies this team participates in.</p>
            </div>
            <button
              type='button'
              onClick={() => setIsCreateOpen(true)}
              className='rounded-xl border border-blue-500/60 bg-blue-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-blue-100 transition hover:bg-blue-500/30'
            >
              Create ritual
            </button>
          </div>

          <div className='mt-6 space-y-4'>
            {isCreateOpen && (
              <div className='rounded-2xl border border-slate-800/60 bg-slate-900/70 p-5'>
                <form onSubmit={handleCreateRitual} className='space-y-4 text-sm'>
                  <div>
                    <label className='block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400'>
                      Ritual name
                    </label>
                    <input
                      value={newRitualName}
                      onChange={(event) => setNewRitualName(event.target.value)}
                      placeholder='Weekly team health check-in'
                      className='mt-2 w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
                    />
                  </div>

                  <div className='grid gap-4 sm:grid-cols-2'>
                    <div>
                      <label className='block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400'>
                        Type
                      </label>
                      <select
                        value={newRitualType}
                        onChange={(event) =>
                          setNewRitualType(event.target.value as RitualType)
                        }
                        className='mt-2 w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 focus:border-blue-500/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
                      >
                        <option value='STANDUP'>Standup</option>
                        <option value='RETRO'>Retro</option>
                        <option value='PLANNING'>Planning</option>
                        <option value='CUSTOM'>Custom</option>
                      </select>
                    </div>

                    <div>
                      <label className='block text-xs font-semibold uppercase tracking-[0.3em] text-slate-400'>
                        Frequency
                      </label>
                      <select
                        value={newRitualFrequency}
                        onChange={(event) =>
                          setNewRitualFrequency(event.target.value as RitualFrequency)
                        }
                        className='mt-2 w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 focus:border-blue-500/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
                      >
                        <option value='DAILY'>Daily</option>
                        <option value='WEEKLY'>Weekly</option>
                      </select>
                    </div>
                  </div>

                  {createError && (
                    <p className='text-xs text-red-300'>{createError}</p>
                  )}

                  <div className='flex items-center gap-3'>
                    <button
                      type='submit'
                      disabled={isCreatingRitual}
                      className='inline-flex items-center gap-2 rounded-xl border border-blue-500/60 bg-blue-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-blue-100 transition hover:bg-blue-500/30 disabled:opacity-60'
                    >
                      {isCreatingRitual && (
                        <Loader2 className='h-3 w-3 animate-spin' />
                      )}
                      Create ritual
                    </button>
                    <button
                      type='button'
                      onClick={() => {
                        setIsCreateOpen(false);
                        setNewRitualName('');
                        setCreateError(null);
                      }}
                      className='text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 hover:text-slate-200'
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {isRitualsLoading && (
              <div className='flex items-center justify-center rounded-2xl border border-slate-800/60 bg-slate-900/70 p-6 text-sm text-slate-400'>
                <Loader2 className='mr-3 h-4 w-4 animate-spin text-blue-300' />
                Loading rituals...
              </div>
            )}

            {ritualError && !isRitualsLoading && (
              <div className='rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200'>
                {ritualError}
              </div>
            )}

            {!isRitualsLoading && !ritualError && rituals.length === 0 && (
              <div className='rounded-2xl border border-slate-800/60 bg-slate-900/70 p-6 text-sm text-slate-400'>
                No rituals yet. Create a ritual to get this team into a sustainable rhythm.
              </div>
            )}

            {!isRitualsLoading && !ritualError &&
              rituals.map((ritual) => {
                const ritualSessions = sessionsByRitualId[ritual.id] ?? [];
                const upcomingSession = [...ritualSessions]
                  .filter((session) => session.status === 'OPEN')
                  .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor))[0];
                const completedSessions = ritualSessions.filter(
                  (session) => session.status === 'CLOSED',
                );
                const lastCompleted = [...completedSessions]
                  .sort((a, b) => b.scheduledFor.localeCompare(a.scheduledFor))[0];
                const isPaused = ritual.status === 'PAUSED';
                const isUpdating = !!ritualUpdateState[ritual.id];

                return (
                <article
                  key={ritual.id}
                  className='rounded-2xl border border-slate-800/60 bg-slate-900/70 p-5 transition hover:border-blue-500/60 hover:shadow-[0_35px_55px_-35px_rgba(30,64,175,0.75)]'
                >
                  <div className='flex flex-wrap items-start justify-between gap-4'>
                    <div>
                      <h3 className='text-sm font-semibold text-white'>{ritual.name}</h3>
                      <p className='text-xs text-slate-400'>
                        {ritual.type.toLowerCase()} / {ritual.frequency.toLowerCase()} cadence
                      </p>
                      <p className='mt-2 text-[10px] uppercase tracking-[0.25em] text-slate-500'>
                        Created {new Date(ritual.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className='flex flex-col items-end gap-2 text-[10px] uppercase tracking-[0.25em]'>
                      <span
                        className={`rounded-full border px-3 py-1 font-semibold ${
                          isPaused
                            ? 'border-amber-400/60 text-amber-200'
                            : 'border-emerald-400/60 text-emerald-200'
                        }`}
                      >
                        {isPaused ? 'Paused' : 'Active'}
                      </span>
                      <button
                        type='button'
                        disabled={!isTeamLead || isUpdating}
                        onClick={() => handleRitualStatusToggle(ritual.id, ritual.status)}
                        className='text-[10px] font-semibold uppercase tracking-[0.25em] text-blue-200 underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        {isUpdating
                          ? 'Updating...'
                          : isPaused
                            ? 'Resume ritual'
                            : 'Pause ritual'}
                      </button>
                    </div>
                  </div>

                  <div className='mt-4 grid gap-3 text-xs text-slate-400 sm:grid-cols-2'>
                    <div className='rounded-xl border border-slate-800/80 bg-slate-900/80 p-3'>
                      <p className='text-[10px] uppercase tracking-[0.25em] text-slate-500'>Next session</p>
                      <p className='mt-1 text-sm text-white'>
                        {upcomingSession ? (
                          <time dateTime={upcomingSession.scheduledFor}>
                            {new Date(upcomingSession.scheduledFor).toLocaleString()}
                          </time>
                        ) : (
                          'Not scheduled'
                        )}
                      </p>
                    </div>
                    <div className='rounded-xl border border-slate-800/80 bg-slate-900/80 p-3'>
                      <p className='text-[10px] uppercase tracking-[0.25em] text-slate-500'>Last completed</p>
                      <p className='mt-1 text-sm text-white'>
                        {lastCompleted ? (
                          <time dateTime={lastCompleted.scheduledFor}>
                            {new Date(lastCompleted.scheduledFor).toLocaleString()}
                          </time>
                        ) : (
                          'No sessions yet'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className='mt-4 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-slate-500'>
                    <span>{ritualSessions.length} total sessions</span>
                    <span>{completedSessions.length} completed</span>
                  </div>

                  <div className='mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400'>
                    <Link
                      href={`/rituals/${ritual.id}/sessions?teamId=${teamId}`}
                      className='rounded-lg border border-slate-700/60 px-3 py-2 font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:border-blue-500/60 hover:text-blue-200'
                    >
                      View sessions
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className='rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6 backdrop-blur-xl'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-lg font-semibold text-white'>Upcoming sessions</h2>
              <p className='text-xs text-slate-400'>Next few sessions this team is scheduled for.</p>
            </div>
            <CalendarDays className='h-5 w-5 text-blue-300' />
          </div>

          <div className='mt-6 space-y-4'>
            {sessionsError && (
              <div className='rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-200'>
                {sessionsError}
              </div>
            )}

            {upcomingSessions.length === 0 && !sessionsError && (
              <div className='rounded-2xl border border-slate-800/60 bg-slate-900/70 p-6 text-sm text-slate-400'>
                No upcoming sessions yet. Once rituals are active, new sessions will appear here automatically.
              </div>
            )}

            {upcomingSessions.map((session) => (
              <article
                key={session.id}
                className='flex items-center justify-between gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4'
              >
                <div>
                  <p className='text-sm font-medium text-slate-200'>
                    Session on{' '}
                    <time dateTime={session.scheduledFor}>
                      {new Date(session.scheduledFor).toLocaleDateString()}
                    </time>
                  </p>
                  <p className='text-xs text-slate-400'>Status: {session.status}</p>
                </div>
                <Link
                  href={`/sessions/${session.id}?teamId=${teamId}&ritualId=${session.ritualId}`}
                  className='rounded-lg border border-blue-500/60 bg-blue-500/20 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-blue-100 transition hover:bg-blue-500/30'
                >
                  Open
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
