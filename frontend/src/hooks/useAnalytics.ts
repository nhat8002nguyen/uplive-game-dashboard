import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAnalytics, createAnalytic, fetchSummary } from '../api/analytics'
import { QUERY_KEYS } from '../constants/analytics'
import type { FilterParams, CreateAnalyticsEntry } from '../types/analytics'

export const useAnalytics = (params?: FilterParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.analytics, params],
    queryFn: () => fetchAnalytics(params),
  })
}

export const useSummary = (params?: FilterParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.summary, params],
    queryFn: () => fetchSummary(params),
  })
}

export const useCreateAnalytic = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateAnalyticsEntry) => createAnalytic(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.analytics] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.summary] })
    },
  })
}
