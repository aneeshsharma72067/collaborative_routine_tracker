import { apiClient, type ApiResponse } from "@/lib/api-client";
import type { DashboardSummary } from "@/types/dashboard";

export async function getWorkspaceSummary(
  workspaceId: string,
): Promise<DashboardSummary> {
  const { data } = await apiClient.get<ApiResponse<DashboardSummary>>(
    `/workspaces/${workspaceId}/dashboard`,
  );
  return data.data;
}
