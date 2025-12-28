export type RitualSessionStatus = "OPEN" | "CLOSED";

export interface RitualSessionSummary {
  id: string;
  workspaceId: string;
  teamId: string;
  ritualId: string;
  status: RitualSessionStatus;
  scheduledFor?: string | null;
  startedAt: string;
  closedAt?: string | null;
  responseCount: number;
  expectedResponses: number;
  createdAt: string;
  updatedAt: string;
}

export interface RitualResponse {
  id: string;
  sessionId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}
