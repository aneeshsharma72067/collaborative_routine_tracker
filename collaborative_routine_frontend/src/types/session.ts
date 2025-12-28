export type RitualSessionStatus = "OPEN" | "CLOSED";

export interface RitualSessionSummary {
  id: string;
  ritualId: string;
  scheduledFor: string;
  status: RitualSessionStatus;
  createdAt: string;
}

export interface RitualResponse {
  id: string;
  sessionId: string;
  userId: string;
  content: string;
  createdAt: string;
}
