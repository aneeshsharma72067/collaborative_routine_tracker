"use client";

import { useEffect } from "react";
import { useGroupStore } from "@/stores/group-store";

export function useGroup() {
  const groups = useGroupStore((state) => state.groups);
  const isLoading = useGroupStore((state) => state.isLoading);
  const error = useGroupStore((state) => state.error);
  const fetchGroups = useGroupStore((state) => state.fetchGroups);

  useEffect(() => {
    if (!groups.length && !isLoading) {
      fetchGroups().catch(() => {});
    }
  }, [groups.length, isLoading, fetchGroups]);

  return {
    groups,
    isLoading,
    error,
    refetch: fetchGroups,
  };
}