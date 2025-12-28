"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import * as dashboardApi from "@/services/dashboard-api";
import type { DashboardSummary } from "@/types/dashboard";

interface DashboardState {
  summary: DashboardSummary | null;
  isLoading: boolean;
  error: string | null;
  fetchSummary: (workspaceId: string) => Promise<void>;
}

function transformError(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return "Failed to load dashboard metrics. Please try again.";
}

export const useDashboardStore = create<DashboardState>()(
  devtools((set) => ({
    summary: null,
    isLoading: false,
    error: null,

    async fetchSummary(workspaceId: string) {
      set({ isLoading: true, error: null });
      try {
        const summary = await dashboardApi.getWorkspaceSummary(workspaceId);
        set({ summary, isLoading: false });
      } catch (error) {
        set({ isLoading: false, error: transformError(error) });
      }
    },
  })),
);
