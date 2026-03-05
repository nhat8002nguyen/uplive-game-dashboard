import type { EventType } from '../types/analytics'

export const EVENT_TYPES: readonly EventType[] = [
  'match_start',
  'match_end',
  'purchase',
  'level_up',
  'login',
]

export const EVENT_BADGE_COLORS: Record<EventType, string> = {
  match_start: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  match_end: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  purchase: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  level_up: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  login: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
}

export const QUERY_KEYS = {
  analytics: 'analytics',
  summary: 'analytics-summary',
} as const
