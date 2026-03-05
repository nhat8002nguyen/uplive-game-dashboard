import axios from 'axios'
import type { AnalyticsEntry, AnalyticsSummary, CreateAnalyticsEntry, FilterParams, PaginatedAnalyticsResponse } from '../types/analytics'

const api = axios.create({ baseURL: 'http://localhost:3000' })

export const exportAnalytics = (params: FilterParams, format: 'csv' | 'json'): void => {
  const entries = Object.entries({ ...params, format })
    .filter(([key, val]) => val != null && val !== '' && key !== 'limit' && key !== 'offset')
    .map(([key, val]) => [key, String(val)] as [string, string])
  const query = new URLSearchParams(entries).toString()
  window.open(`http://localhost:3000/analytics/export?${query}`, '_blank')
}

export const fetchAnalytics = async (params?: FilterParams): Promise<PaginatedAnalyticsResponse> => {
  const { data } = await api.get<{ data: PaginatedAnalyticsResponse }>('/analytics', { params })
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
