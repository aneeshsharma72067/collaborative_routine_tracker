"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import * as teamApi from "@/services/team-api";
import type {
  TeamSummary,
  TeamMember,
  CreateTeamPayload,
  AddTeamMemberPayload,
} from "@/types/team";

interface TeamState {
  teams: TeamSummary[];
  membersByTeamId: Record<string, TeamMember[]>;
  isLoading: boolean;
  error: string | null;
  hasLoadedOnce: boolean;
  isManagingMembers: boolean;
  fetchTeams: (workspaceId: string) => Promise<void>;
  createTeam: (
    workspaceId: string,
    payload: CreateTeamPayload,
  ) => Promise<TeamSummary | null>;
  fetchTeamMembers: (workspaceId: string, teamId: string) => Promise<void>;
  addTeamMember: (
    workspaceId: string,
    teamId: string,
    payload: AddTeamMemberPayload,
  ) => Promise<TeamMember | null>;
}

function transformError(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return "Failed to load teams. Please try again.";
}

export const useTeamStore = create<TeamState>()(
  devtools((set) => ({
    teams: [],
    membersByTeamId: {},
    isLoading: false,
    error: null,
    hasLoadedOnce: false,
    isManagingMembers: false,

    async fetchTeams(workspaceId: string) {
      console.log("fetching teams");
      set({ isLoading: true, error: null });
      try {
        const teams = await teamApi.listTeams(workspaceId);
        set({ teams, isLoading: false, hasLoadedOnce: true });
      } catch (error) {
        console.log(error);
        set({
          isLoading: false,
          error: transformError(error),
          hasLoadedOnce: true,
        });
      }
    },

    async createTeam(workspaceId, payload) {
      try {
        const team = await teamApi.createTeam(workspaceId, payload);
        set((state) => ({
          teams: [...state.teams, team],
          hasLoadedOnce: true,
        }));
        return team;
      } catch (error) {
        set({ error: transformError(error), hasLoadedOnce: true });
        return null;
      }
    },

    async fetchTeamMembers(workspaceId: string, teamId: string) {
      set({ error: null });
      try {
        const members = await teamApi.listTeamMembers(workspaceId, teamId);
        set((state) => ({
          membersByTeamId: {
            ...state.membersByTeamId,
            [teamId]: members,
          },
        }));
      } catch (error) {
        set({ error: transformError(error) });
      }
    },

    async addTeamMember(workspaceId, teamId, payload) {
      set({ isManagingMembers: true, error: null });
      try {
        const member = await teamApi.addTeamMember(workspaceId, teamId, payload);
        set((state) => ({
          membersByTeamId: {
            ...state.membersByTeamId,
            [teamId]: [...(state.membersByTeamId[teamId] ?? []), member],
          },
          isManagingMembers: false,
        }));
        return member;
      } catch (error) {
        set({ isManagingMembers: false, error: transformError(error) });
        return null;
      }
    },
  })),
);
