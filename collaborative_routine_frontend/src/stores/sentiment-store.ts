"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import * as sentimentApi from "@/services/sentiment-api";
import type { TeamSentimentAverage } from "@/types/sentiment";

interface SentimentState {
  averagesByTeamId: Record<string, TeamSentimentAverage>;
  isSubmitting: boolean;
  isFetchingAverage: boolean;
  error: string | null;
  submitScore: (
    workspaceId: string,
    teamId: string,
    score: number,
  ) => Promise<void>;
  fetchAverage: (
    workspaceId: string,
    teamId: string,
  ) => Promise<void>;
}

function transformError(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return "Unable to submit sentiment. Please try again.";
}

export const useSentimentStore = create<SentimentState>()(
  devtools((set) => ({
    averagesByTeamId: {},
    isSubmitting: false,
    isFetchingAverage: false,
    error: null,

    async submitScore(workspaceId, teamId, score) {
      set({ isSubmitting: true, error: null });
      try {
        await sentimentApi.submitSentiment(workspaceId, teamId, score);
        set({ isSubmitting: false });
      } catch (error) {
        set({ isSubmitting: false, error: transformError(error) });
      }
    },

    async fetchAverage(workspaceId, teamId) {
      set({ error: null, isFetchingAverage: true });
      try {
        const average = await sentimentApi.getTeamAverage(workspaceId, teamId);
        set((state) => ({
          averagesByTeamId: {
            ...state.averagesByTeamId,
            [teamId]: average,
          },
          isFetchingAverage: false,
        }));
      } catch (error) {
        set({ error: transformError(error), isFetchingAverage: false });
      }
    },
  })),
);
