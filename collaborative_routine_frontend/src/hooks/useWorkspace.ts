"use client";

import { useEffect } from "react";
import { useWorkspaceStore } from "@/stores/workspace-store";

export function useWorkspace() {
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId,
  );
  const isLoading = useWorkspaceStore((state) => state.isLoading);
  const isSaving = useWorkspaceStore((state) => state.isSaving);
  const error = useWorkspaceStore((state) => state.error);
  const hasInitialized = useWorkspaceStore((state) => state.hasInitialized);
  const fetchWorkspaces = useWorkspaceStore((state) => state.fetchWorkspaces);
  const createWorkspace = useWorkspaceStore((state) => state.createWorkspace);
  const setActiveWorkspace = useWorkspaceStore(
    (state) => state.setActiveWorkspace,
  );
  const resetError = useWorkspaceStore((state) => state.resetError);

  useEffect(() => {
    if (!hasInitialized && !isLoading) {
      fetchWorkspaces().catch(() => {});
    }
  }, [hasInitialized, isLoading, fetchWorkspaces]);

  const activeWorkspace =
    workspaces.find((workspace) => workspace.id === activeWorkspaceId) ??
    null;

  return {
    workspaces,
    activeWorkspaceId,
    activeWorkspace,
    isLoading,
     isSaving,
    error,
     hasInitialized,
     fetchWorkspaces,
     createWorkspace,
    setActiveWorkspace,
     resetError,
  };
}
