export interface SteamGameResponse {
  id: number;
  steamId: string;
  appId: number;
  name: string;
  playtimeForeverMinutes: number;
  imgIconUrl: string | null;
  isBacklog: boolean;
}

export interface SyncSummaryResponse {
  steamId: string;
  totalImported: number;
  totalUpdated: number;
  backlogCount: number;
}

export interface TriageRequest {
  mood: string;
  availableMinutes: number;
  maxRecommendations?: number;
}

export interface GameRecommendationDto {
  appId: number;
  name: string;
  playtimeForeverMinutes: number;
  imgIconUrl: string | null;
  matchScore: number;
  whyPlayNow: string;
  estimatedSessionMinutes: number;
}

export interface TriageResponse {
  steamId: string;
  playerPersonaSummary: string;
  recommendations: GameRecommendationDto[];
}

export interface ProblemDetail {
  type?: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  timestamp?: string;
  errors?: string[];
}
