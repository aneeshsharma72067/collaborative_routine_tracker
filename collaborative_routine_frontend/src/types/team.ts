export type TeamRole = "LEAD" | "MEMBER";

export interface TeamSummary {
  id: string;
  name: string;
  createdAt: string;
  description?: string;
  membersCount?: number;
  ritualsCount?: number;
  lastActivity?: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  role: TeamRole;
  joinedAt: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface CreateTeamPayload {
  name: string;
  leadUserId: string;
}

export interface AddTeamMemberPayload {
  userId: string;
  role: TeamRole;
}
