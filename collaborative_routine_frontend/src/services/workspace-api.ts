import { apiClient, type ApiResponse } from "@/lib/api-client";
import type {
  Workspace,
  CreateWorkspacePayload,
  WorkspaceMember,
  AddWorkspaceMemberPayload,
} from "@/types/workspace";

export async function listWorkspaces(): Promise<Workspace[]> {
  const { data } = await apiClient.get<ApiResponse<Workspace[]>>("/workspaces");
  return data.data;
}

export async function createWorkspace(
  payload: CreateWorkspacePayload,
): Promise<Workspace> {
  const { data } = await apiClient.post<ApiResponse<Workspace>>(
    "/workspaces",
    payload,
  );
  return data.data;
}

export async function listWorkspaceMembers(
  workspaceId: string,
): Promise<WorkspaceMember[]> {
  const { data } = await apiClient.get<ApiResponse<WorkspaceMember[]>>(
    `/workspaces/${workspaceId}/members`,
  );
  return data.data;
}

export async function addWorkspaceMember(
  workspaceId: string,
  payload: AddWorkspaceMemberPayload,
): Promise<WorkspaceMember> {
  const { data } = await apiClient.post<ApiResponse<WorkspaceMember>>(
    `/workspaces/${workspaceId}/members`,
    payload,
  );
  return data.data;
}
