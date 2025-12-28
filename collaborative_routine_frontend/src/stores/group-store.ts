"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { GroupSummary } from "@/types/group";

interface GroupState {
  groups: GroupSummary[];
  isLoading: boolean;
  error: string | null;
  fetchGroups: () => Promise<void>;
}

const mockGroups: GroupSummary[] = [
  {
    id: "grp-1",
    name: "Customer Success Cadence",
    description: "Async daily standup with weekly retrospective",
    members: 12,
    routinesActive: 4,
    lastActivity: new Date().toISOString(),
    timezone: "America/New_York",
  },
  {
    id: "grp-2",
    name: "Platform Engineering",
    description: "Sprint planning and weekly demo showcase",
    members: 18,
    routinesActive: 5,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    timezone: "Europe/London",
  },
  {
    id: "grp-3",
    name: "Marketing Ops",
    description: "Monday kickoff and quarterly planning",
    members: 9,
    routinesActive: 3,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    timezone: "Asia/Singapore",
  },
];

export const useGroupStore = create<GroupState>()(
  devtools((set) => ({
    groups: [],
    isLoading: false,
    error: null,
    fetchGroups: async () => {
      set({ isLoading: true, error: null });
      try {
        // TODO: replace with real API call when backend endpoint is ready
        await new Promise((resolve) => setTimeout(resolve, 450));
        set({ groups: mockGroups, isLoading: false });
      } catch (error) {
        const fallback = "Failed to load groups. Please try again.";
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : fallback,
        });
      }
    },
  }))
);
