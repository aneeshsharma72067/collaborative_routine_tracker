import { apiClient, type ApiResponse } from "@/lib/api-client";
import type { TeamSentimentAverage } from "@/types/sentiment";

export async function submitSentiment(
  workspaceId: string,
  teamId: string,
  score: number,
): Promise<void> {
  await apiClient.post<ApiResponse<unknown>>(
    `/workspaces/${workspaceId}/teams/${teamId}/sentiment`,
    { score },
  );
}

export async function getTeamAverage(
  workspaceId: string,
  teamId: string,
): Promise<TeamSentimentAverage> {
  const { data } = await apiClient.get<ApiResponse<{ average: number | null }>>(
    `/workspaces/${workspaceId}/teams/${teamId}/sentiment/average`,
  );

  return {
    teamId,
    average: data.data.average,
  };
}
