"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/stores/dashboard-store";
import { useWorkspace } from "@/hooks/useWorkspace";

export function useDashboardSummary() {
  const { activeWorkspaceId } = useWorkspace();
  const summary = useDashboardStore((state) => state.summary);
  const isLoading = useDashboardStore((state) => state.isLoading);
  const error = useDashboardStore((state) => state.error);
  const fetchSummary = useDashboardStore((state) => state.fetchSummary);

  useEffect(() => {
    if (activeWorkspaceId && !summary && !isLoading) {
      fetchSummary(activeWorkspaceId).catch(() => {});
    }
  }, [activeWorkspaceId, summary, isLoading, fetchSummary]);

  const refetch = async () => {
    if (!activeWorkspaceId) return;
    await fetchSummary(activeWorkspaceId);
  };

  return {
    summary,
    isLoading,
    error,
    refetch,
  };
}
