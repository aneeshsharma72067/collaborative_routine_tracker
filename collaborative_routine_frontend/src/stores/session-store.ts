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
  startingRitualIds: Record<string, boolean>;
  closingSessionIds: Record<string, boolean>;
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
  startSession: (
    workspaceId: string,
    teamId: string,
    ritualId: string,
  ) => Promise<RitualSessionSummary | null>;
  closeSession: (
    workspaceId: string,
    teamId: string,
    ritualId: string,
    sessionId: string,
  ) => Promise<RitualSessionSummary | null>;
}

function transformError(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return "Session request failed. Please try again.";
}

export const useSessionStore = create<SessionState>()(
  devtools((set) => ({
    sessionsByRitualId: {},
    responsesBySessionId: {},
    isLoading: false,
    error: null,
    startingRitualIds: {},
    closingSessionIds: {},

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

        set((state) => {
          const existingResponses = state.responsesBySessionId[sessionId] ?? [];
          const hasExistingResponse = existingResponses.some(
            (item) => item.id === response.id,
          );
          const updatedResponses = hasExistingResponse
            ? existingResponses.map((item) =>
                item.id === response.id ? response : item,
              )
            : [...existingResponses, response];

          let nextSessionsByRitualId = state.sessionsByRitualId;
          if (!hasExistingResponse && state.sessionsByRitualId[ritualId]) {
            nextSessionsByRitualId = {
              ...state.sessionsByRitualId,
              [ritualId]: state.sessionsByRitualId[ritualId].map((session) =>
                session.id === sessionId
                  ? {
                      ...session,
                      responseCount: session.responseCount + 1,
                    }
                  : session,
              ),
            };
          }

          return {
            responsesBySessionId: {
              ...state.responsesBySessionId,
              [sessionId]: updatedResponses,
            },
            sessionsByRitualId: nextSessionsByRitualId,
          };
        });

        return response;
      } catch (error) {
        set({ error: transformError(error) });
        return null;
      }
    },

    async startSession(workspaceId, teamId, ritualId) {
      set((state) => ({
        startingRitualIds: {
          ...state.startingRitualIds,
          [ritualId]: true,
        },
        error: null,
      }));

      try {
        const session = await sessionApi.startSession(
          workspaceId,
          teamId,
          ritualId,
        );

        set((state) => {
          const existingSessions = state.sessionsByRitualId[ritualId] ?? [];
          const filtered = existingSessions.filter((item) => item.id !== session.id);
          const nextSessions = [session, ...filtered];
          const nextStarting = { ...state.startingRitualIds };
          delete nextStarting[ritualId];

          return {
            sessionsByRitualId: {
              ...state.sessionsByRitualId,
              [ritualId]: nextSessions,
            },
            startingRitualIds: nextStarting,
          };
        });

        return session;
      } catch (error) {
        set((state) => {
          const nextStarting = { ...state.startingRitualIds };
          delete nextStarting[ritualId];
          return {
            startingRitualIds: nextStarting,
            error: transformError(error),
          };
        });
        return null;
      }
    },

    async closeSession(workspaceId, teamId, ritualId, sessionId) {
      set((state) => ({
        closingSessionIds: {
          ...state.closingSessionIds,
          [sessionId]: true,
        },
        error: null,
      }));

      try {
        const session = await sessionApi.closeSession(
          workspaceId,
          teamId,
          sessionId,
        );

        set((state) => {
          const existingSessions = state.sessionsByRitualId[ritualId] ?? [];
          const nextSessions = existingSessions.length
            ? existingSessions.map((item) =>
                item.id === sessionId ? session : item,
              )
            : [session];
          const nextClosing = { ...state.closingSessionIds };
          delete nextClosing[sessionId];

          return {
            sessionsByRitualId: {
              ...state.sessionsByRitualId,
              [ritualId]: nextSessions,
            },
            closingSessionIds: nextClosing,
          };
        });

        return session;
      } catch (error) {
        set((state) => {
          const nextClosing = { ...state.closingSessionIds };
          delete nextClosing[sessionId];
          return {
            closingSessionIds: nextClosing,
            error: transformError(error),
          };
        });
        return null;
      }
    },
  })),
);
