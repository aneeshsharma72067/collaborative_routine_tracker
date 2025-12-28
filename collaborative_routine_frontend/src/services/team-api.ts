import { apiClient, type ApiResponse } from "@/lib/api-client";
import type {
  TeamSummary,
  TeamMember,
  CreateTeamPayload,
  AddTeamMemberPayload,
} from "@/types/team";

export async function listTeams(
  workspaceId: string,
): Promise<TeamSummary[]> {
  const { data } = await apiClient.get<ApiResponse<TeamSummary[]>>(
    `/workspaces/${workspaceId}/teams`,
  );
  return data.data;
}

export async function getTeam(
  workspaceId: string,
  teamId: string,
): Promise<TeamSummary> {
  const { data } = await apiClient.get<ApiResponse<TeamSummary>>(
    `/workspaces/${workspaceId}/teams/${teamId}`,
  );
  return data.data;
}

export async function listTeamMembers(
  workspaceId: string,
  teamId: string,
): Promise<TeamMember[]> {
  const { data } = await apiClient.get<ApiResponse<TeamMember[]>>(
    `/workspaces/${workspaceId}/teams/${teamId}/members`,
  );
  return data.data;
}

export async function createTeam(
  workspaceId: string,
  payload: CreateTeamPayload,
): Promise<TeamSummary> {
  const { data } = await apiClient.post<ApiResponse<TeamSummary>>(
    `/workspaces/${workspaceId}/teams`,
    payload,
  );
  return data.data;
}

export async function addTeamMember(
  workspaceId: string,
  teamId: string,
  payload: AddTeamMemberPayload,
): Promise<TeamMember> {
  const { data } = await apiClient.post<ApiResponse<TeamMember>>(
    `/workspaces/${workspaceId}/teams/${teamId}/members`,
    payload,
  );
  return data.data;
}
