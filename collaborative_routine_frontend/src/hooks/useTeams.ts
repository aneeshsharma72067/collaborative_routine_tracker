"use client";

import { useEffect } from "react";
import { useTeamStore } from "@/stores/team-store";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useAuth } from "@/hooks/useAuth";

export function useTeams() {
  const { activeWorkspaceId } = useWorkspace();
  const { user } = useAuth();
  const teams = useTeamStore((state) => state.teams);
  const isLoading = useTeamStore((state) => state.isLoading);
  const error = useTeamStore((state) => state.error);
  const hasLoadedOnce = useTeamStore((state) => state.hasLoadedOnce);
  const fetchTeams = useTeamStore((state) => state.fetchTeams);
  const createTeamInStore = useTeamStore((state) => state.createTeam);

  useEffect(() => {
    // Only auto-fetch once per workspace. We rely on hasLoadedOnce
    // instead of teams.length so we don't loop forever if the API
    // legitimately returns an empty list of teams.
    if (activeWorkspaceId && !hasLoadedOnce && !isLoading) {
      fetchTeams(activeWorkspaceId).catch(() => {});
    }
  }, [activeWorkspaceId, hasLoadedOnce, isLoading, fetchTeams]);

  const refetch = async () => {
    if (!activeWorkspaceId) return;
    await fetchTeams(activeWorkspaceId);
  };

  const createTeam = async (name: string) => {
    if (!activeWorkspaceId || !user?.id) return null;
    const trimmedName = name.trim();
    if (!trimmedName) return null;

    return createTeamInStore(activeWorkspaceId, {
      name: trimmedName,
      leadUserId: user.id,
    });
  };

  return {
    teams,
    isLoading,
    error,
    refetch,
    createTeam,
  };
}
