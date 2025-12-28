"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import * as ritualApi from "@/services/ritual-api";
import type {
  RitualSummary,
  CreateRitualPayload,
  RitualStatus,
} from "@/types/ritual";

interface RitualState {
  ritualsByTeamId: Record<string, RitualSummary[]>;
  isLoading: boolean;
  isCreating: boolean;
  updatingRitualIds: Record<string, boolean>;
  error: string | null;
  fetchRituals: (workspaceId: string, teamId: string) => Promise<void>;
  createRitual: (
    workspaceId: string,
    teamId: string,
    payload: CreateRitualPayload,
  ) => Promise<RitualSummary | null>;
  updateRitualStatus: (
    workspaceId: string,
    teamId: string,
    ritualId: string,
    status: RitualStatus,
  ) => Promise<void>;
}

function transformError(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return "Failed to load rituals. Please try again.";
}

export const useRitualStore = create<RitualState>()(
  devtools((set) => ({
    ritualsByTeamId: {},
    isLoading: false,
    isCreating: false,
    updatingRitualIds: {},
    error: null,

    async fetchRituals(workspaceId: string, teamId: string) {
      set({ isLoading: true, error: null });
      try {
        const rituals = await ritualApi.listRituals(workspaceId, teamId);
        set((state) => ({
          ritualsByTeamId: {
            ...state.ritualsByTeamId,
            [teamId]: rituals,
          },
          isLoading: false,
        }));
      } catch (error) {
        set({
          isLoading: false,
          error: transformError(error),
        });
      }
    },

    async createRitual(workspaceId, teamId, payload) {
      set({ isCreating: true, error: null });
      try {
        const ritual = await ritualApi.createRitual(
          workspaceId,
          teamId,
          payload,
        );
        set((state) => ({
          ritualsByTeamId: {
            ...state.ritualsByTeamId,
            [teamId]: [...(state.ritualsByTeamId[teamId] ?? []), ritual],
          },
          isCreating: false,
        }));
        return ritual;
      } catch (error) {
        set({ error: transformError(error), isCreating: false });
        return null;
      }
    },

    async updateRitualStatus(workspaceId, teamId, ritualId, status) {
      set((state) => ({
        updatingRitualIds: {
          ...state.updatingRitualIds,
          [ritualId]: true,
        },
        error: null,
      }));

      try {
        const ritual = await ritualApi.updateRitualStatus(
          workspaceId,
          teamId,
          ritualId,
          status,
        );

        set((state) => ({
          ritualsByTeamId: {
            ...state.ritualsByTeamId,
            [teamId]: (state.ritualsByTeamId[teamId] ?? []).map((item) =>
              item.id === ritualId ? ritual : item,
            ),
          },
          updatingRitualIds: {
            ...state.updatingRitualIds,
            [ritualId]: false,
          },
        }));
      } catch (error) {
        set((state) => ({
          updatingRitualIds: {
            ...state.updatingRitualIds,
            [ritualId]: false,
          },
          error: transformError(error),
        }));
      }
    },
  })),
);
