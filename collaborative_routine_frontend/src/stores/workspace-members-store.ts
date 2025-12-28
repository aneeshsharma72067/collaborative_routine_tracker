"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import * as workspaceApi from "@/services/workspace-api";
import type {
  WorkspaceMember,
  AddWorkspaceMemberPayload,
} from "@/types/workspace";

interface WorkspaceMembersState {
  membersByWorkspaceId: Record<string, WorkspaceMember[]>;
  isLoading: boolean;
  isInviting: boolean;
  error: string | null;
  fetchMembers: (workspaceId: string) => Promise<void>;
  inviteMember: (
    workspaceId: string,
    payload: AddWorkspaceMemberPayload,
  ) => Promise<WorkspaceMember | null>;
  resetError: () => void;
}

function transformError(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return "Unable to sync workspace members. Please try again.";
}

export const useWorkspaceMembersStore = create<WorkspaceMembersState>()(
  devtools((set, get) => ({
    membersByWorkspaceId: {},
    isLoading: false,
    isInviting: false,
    error: null,

    async fetchMembers(workspaceId: string) {
      if (!workspaceId) return;
      set({ isLoading: true, error: null });
      try {
        const members = await workspaceApi.listWorkspaceMembers(workspaceId);
        set((state) => ({
          membersByWorkspaceId: {
            ...state.membersByWorkspaceId,
            [workspaceId]: members,
          },
          isLoading: false,
        }));
      } catch (error) {
        set({ isLoading: false, error: transformError(error) });
      }
    },

    async inviteMember(workspaceId, payload) {
      if (!workspaceId) return null;
      set({ isInviting: true, error: null });
      try {
        const member = await workspaceApi.addWorkspaceMember(
          workspaceId,
          payload,
        );
        set((state) => ({
          membersByWorkspaceId: {
            ...state.membersByWorkspaceId,
            [workspaceId]: [
              ...(state.membersByWorkspaceId[workspaceId] ?? []),
              member,
            ],
          },
          isInviting: false,
        }));
        return member;
      } catch (error) {
        set({ isInviting: false, error: transformError(error) });
        return null;
      }
    },

    resetError() {
      if (get().error) {
        set({ error: null });
      }
    },
  })),
);
