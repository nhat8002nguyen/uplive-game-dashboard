import axios from 'axios'
import type { AnalyticsEntry, AnalyticsSummary, CreateAnalyticsEntry, FilterParams } from '../types/analytics'

const api = axios.create({ baseURL: 'http://localhost:3000' })

export const fetchAnalytics = async (params?: FilterParams): Promise<AnalyticsEntry[]> => {
  const { data } = await api.get<{ data: AnalyticsEntry[] }>('/analytics', { params })
  return data.data
}

export const createAnalytic = async (body: CreateAnalyticsEntry): Promise<AnalyticsEntry> => {
  const { data } = await api.post<{ data: AnalyticsEntry }>('/analytics', body)
  return data.data
}

export const fetchSummary = async (params?: FilterParams): Promise<AnalyticsSummary> => {
  const { data } = await api.get<{ data: AnalyticsSummary }>('/analytics/summary', { params })
  return data.data
}
