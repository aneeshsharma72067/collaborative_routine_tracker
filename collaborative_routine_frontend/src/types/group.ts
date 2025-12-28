export interface GroupSummary {
  id: string;
  name: string;
  description?: string;
  members: number;
  routinesActive: number;
  lastActivity: string;
  timezone?: string;
}
