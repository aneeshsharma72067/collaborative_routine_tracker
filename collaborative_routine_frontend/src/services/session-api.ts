import { apiClient, type ApiResponse } from "@/lib/api-client";
import type {
  RitualSessionSummary,
  RitualResponse,
} from "@/types/session";

export async function listSessions(
  workspaceId: string,
  teamId: string,
  ritualId: string,
): Promise<RitualSessionSummary[]> {
  const { data } = await apiClient.get<ApiResponse<RitualSessionSummary[]>>(
    `/workspaces/${workspaceId}/teams/${teamId}/rituals/${ritualId}/sessions`,
  );
  return data.data;
}

export async function startSession(
  workspaceId: string,
  teamId: string,
  ritualId: string,
): Promise<RitualSessionSummary> {
  const { data } = await apiClient.post<ApiResponse<RitualSessionSummary>>(
    `/workspaces/${workspaceId}/teams/${teamId}/rituals/${ritualId}/sessions/start`,
    {},
  );
  return data.data;
}

export async function getSession(
  workspaceId: string,
  teamId: string,
  ritualId: string,
  sessionId: string,
): Promise<RitualSessionSummary> {
  const { data } = await apiClient.get<ApiResponse<RitualSessionSummary>>(
    `/workspaces/${workspaceId}/teams/${teamId}/rituals/${ritualId}/sessions/${sessionId}`,
  );
  return data.data;
}

export async function submitSessionResponse(
  workspaceId: string,
  teamId: string,
  ritualId: string,
  sessionId: string,
  content: string,
): Promise<RitualResponse> {
  const { data } = await apiClient.post<ApiResponse<RitualResponse>>(
    `/workspaces/${workspaceId}/teams/${teamId}/rituals/${ritualId}/sessions/${sessionId}/responses`,
    { content },
  );
  return data.data;
}

export async function listSessionResponses(
  workspaceId: string,
  teamId: string,
  ritualId: string,
  sessionId: string,
): Promise<RitualResponse[]> {
  const { data } = await apiClient.get<ApiResponse<RitualResponse[]>>(
    `/workspaces/${workspaceId}/teams/${teamId}/rituals/${ritualId}/sessions/${sessionId}/responses`,
  );
  return data.data;
}

export async function closeSession(
  workspaceId: string,
  teamId: string,
  sessionId: string,
): Promise<RitualSessionSummary> {
  const { data } = await apiClient.patch<ApiResponse<RitualSessionSummary>>(
    `/workspaces/${workspaceId}/teams/${teamId}/sessions/${sessionId}/close`,
    {},
  );
  return data.data;
}
