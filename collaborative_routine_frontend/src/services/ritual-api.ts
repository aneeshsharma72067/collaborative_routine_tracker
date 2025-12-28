import { apiClient, type ApiResponse } from "@/lib/api-client";
import type {
  RitualSummary,
  CreateRitualPayload,
  RitualStatus,
} from "@/types/ritual";

export async function listRituals(
  workspaceId: string,
  teamId: string,
): Promise<RitualSummary[]> {
  const { data } = await apiClient.get<ApiResponse<RitualSummary[]>>(
    `/workspaces/${workspaceId}/teams/${teamId}/rituals`,
  );
  return data.data;
}

export async function createRitual(
  workspaceId: string,
  teamId: string,
  payload: CreateRitualPayload,
): Promise<RitualSummary> {
  const { data } = await apiClient.post<ApiResponse<RitualSummary>>(
    `/workspaces/${workspaceId}/teams/${teamId}/rituals`,
    payload,
  );
  return data.data;
}

export async function updateRitualStatus(
  workspaceId: string,
  teamId: string,
  ritualId: string,
  status: RitualStatus,
): Promise<RitualSummary> {
  const { data } = await apiClient.patch<ApiResponse<RitualSummary>>(
    `/workspaces/${workspaceId}/teams/${teamId}/rituals/${ritualId}/status`,
    { status },
  );
  return data.data;
}
