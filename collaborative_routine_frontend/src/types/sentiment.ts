export interface SentimentSnapshot {
  id: string;
  teamId: string;
  score: number;
  createdAt: string;
}

export interface TeamSentimentAverage {
  teamId: string;
  average: number | null;
}
