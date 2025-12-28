"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import * as sessionApi from "@/services/session-api";
import type { RitualSessionSummary, RitualResponse } from "@/types/session";

interface SessionState {
  sessionsByRitualId: Record<string, RitualSessionSummary[]>;
  responsesBySessionId: Record<string, RitualResponse[]>;
  isLoading: boolean;
  error: string | null;
  fetchSessions: (
    workspaceId: string,
    teamId: string,
    ritualId: string,
  ) => Promise<void>;
  fetchResponses: (
    workspaceId: string,
    teamId: string,
    ritualId: string,
    sessionId: string,
  ) => Promise<void>;
  submitResponse: (
    workspaceId: string,
    teamId: string,
    ritualId: string,
    sessionId: string,
    content: string,
  ) => Promise<RitualResponse | null>;
}

function transformError(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return "Failed to load ritual sessions. Please try again.";
}

export const useSessionStore = create<SessionState>()(
  devtools((set) => ({
    sessionsByRitualId: {},
    responsesBySessionId: {},
    isLoading: false,
    error: null,

    async fetchSessions(workspaceId, teamId, ritualId) {
      set({ isLoading: true, error: null });
      try {
        const sessions = await sessionApi.listSessions(
          workspaceId,
          teamId,
          ritualId,
        );
        set((state) => ({
          sessionsByRitualId: {
            ...state.sessionsByRitualId,
            [ritualId]: sessions,
          },
          isLoading: false,
        }));
      } catch (error) {
        set({ isLoading: false, error: transformError(error) });
      }
    },

    async fetchResponses(workspaceId, teamId, ritualId, sessionId) {
      set({ error: null });
      try {
        const responses = await sessionApi.listSessionResponses(
          workspaceId,
          teamId,
          ritualId,
          sessionId,
        );
        set((state) => ({
          responsesBySessionId: {
            ...state.responsesBySessionId,
            [sessionId]: responses,
          },
        }));
      } catch (error) {
        set({ error: transformError(error) });
      }
    },

    async submitResponse(workspaceId, teamId, ritualId, sessionId, content) {
      try {
        const response = await sessionApi.submitSessionResponse(
          workspaceId,
          teamId,
          ritualId,
          sessionId,
          content,
        );

        set((state) => ({
          responsesBySessionId: {
            ...state.responsesBySessionId,
            [sessionId]: [
              ...(state.responsesBySessionId[sessionId] ?? []),
              response,
            ],
          },
        }));

        return response;
      } catch (error) {
        set({ error: transformError(error) });
        return null;
      }
    },
  })),
);
