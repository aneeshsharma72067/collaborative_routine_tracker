export type RitualType = "STANDUP" | "RETRO" | "PLANNING" | "CUSTOM";
export type RitualFrequency = "DAILY" | "WEEKLY";

export type RitualStatus = "ACTIVE" | "PAUSED";

export interface RitualSummary {
  id: string;
  teamId: string;
  name: string;
  type: RitualType;
  frequency: RitualFrequency;
  status: RitualStatus;
  createdAt: string;
}

export interface CreateRitualPayload {
  name: string;
  type: RitualType;
  frequency: RitualFrequency;
}
