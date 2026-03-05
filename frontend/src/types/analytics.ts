export type EventType = 'match_start' | 'match_end' | 'purchase' | 'level_up' | 'login'

export interface AnalyticsEntry {
  id: string
  gameId: string
  gameName: string
  playerId: string
  event: EventType | string
  value: number
  timestamp: string
}

export interface AnalyticsSummary {
  total: number
  averageValue: number
  byEvent: Record<string, number>
  byGame: Record<string, number>
}

export interface FilterParams {
  gameId?: string
  event?: string
  playerId?: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

export interface PaginatedAnalyticsResponse {
  entries: AnalyticsEntry[]
  total: number
}

export type CreateAnalyticsEntry = Omit<AnalyticsEntry, 'id' | 'timestamp'>
