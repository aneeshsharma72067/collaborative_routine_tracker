"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import * as workspaceApi from "@/services/workspace-api";
import type { Workspace, CreateWorkspacePayload } from "@/types/workspace";

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  hasInitialized: boolean;
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (
    payload: CreateWorkspacePayload,
  ) => Promise<Workspace | null>;
  setActiveWorkspace: (workspaceId: string) => void;
  resetError: () => void;
}

function transformError(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return "Unable to load workspace. Please try again.";
}

export const useWorkspaceStore = create<WorkspaceState>()(
  devtools(
    persist(
      (set, get) => ({
        workspaces: [],
        activeWorkspaceId: null,
        isLoading: false,
        isSaving: false,
        error: null,
        hasInitialized: false,

        async fetchWorkspaces() {
          if (get().isLoading) {
            return;
          }

          set({ isLoading: true, error: null });

          try {
            const workspaces = await workspaceApi.listWorkspaces();

            set((state) => {
              const activeExists = workspaces.some(
                (workspace) => workspace.id === state.activeWorkspaceId,
              );

              return {
                workspaces,
                activeWorkspaceId: activeExists
                  ? state.activeWorkspaceId
                  : null,
                isLoading: false,
                hasInitialized: true,
              };
            });
          } catch (error) {
            set({
              isLoading: false,
              hasInitialized: true,
              error: transformError(error),
            });
          }
        },

        async createWorkspace(payload) {
          set({ isSaving: true, error: null });
          try {
            const workspace = await workspaceApi.createWorkspace(payload);
            set((state) => ({
              workspaces: [...state.workspaces, workspace],
              activeWorkspaceId: workspace.id,
              isSaving: false,
              hasInitialized: true,
            }));
            return workspace;
          } catch (error) {
            set({ isSaving: false, error: transformError(error) });
            return null;
          }
        },

        setActiveWorkspace(workspaceId: string) {
          set({ activeWorkspaceId: workspaceId });
        },

        resetError() {
          set({ error: null });
        },
      }),
      {
        name: "workspace-storage",
        partialize: (state) => ({
          activeWorkspaceId: state.activeWorkspaceId,
        }),
      },
    ),
  ),
);
