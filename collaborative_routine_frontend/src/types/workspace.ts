export type WorkspaceRole = "ADMIN" | "MEMBER";

export interface Workspace {
  id: string;
  name: string;
  createdAt: string;
}

export interface CreateWorkspacePayload {
  name: string;
}

export interface WorkspaceMemberUser {
  id: string;
  name?: string;
  email: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
  user?: WorkspaceMemberUser;
}

export interface AddWorkspaceMemberPayload {
  userId: string;
  role: WorkspaceRole;
}
