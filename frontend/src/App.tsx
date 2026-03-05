import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAnalytics, useSummary, useCreateAnalytic } from './hooks/useAnalytics'
import { useTheme } from './hooks/useTheme'
import { useAnalyticsStream } from './hooks/useAnalyticsStream'
import { FilterBar } from './components/FilterBar'
import { SummaryCards } from './components/SummaryCards'
import { AnalyticsTable } from './components/AnalyticsTable'
import { AddEntryForm } from './components/AddEntryForm'
import { AnalyticsChart } from './components/AnalyticsChart'
import { LiveBadge } from './components/LiveBadge'
import { ExportButtons } from './components/ExportButtons'
import { QUERY_KEYS } from './constants/analytics'
import type { FilterParams, CreateAnalyticsEntry } from './types/analytics'

export const App = () => {
  const [filters, setFilters] = useState<FilterParams>({})
  const [showNewEntryNotice, setShowNewEntryNotice] = useState(false)
  const { isDark, toggle } = useTheme()
  const queryClient = useQueryClient()

  const { isConnected } = useAnalyticsStream((_entry) => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.analytics] })
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.summary] })
    setShowNewEntryNotice(true)
  })

  useEffect(() => {
    if (!showNewEntryNotice) return
    const id = setTimeout(() => setShowNewEntryNotice(false), 3000)
    return () => clearTimeout(id)
  }, [showNewEntryNotice])

  const { data: entries, isLoading: loadingEntries, error: entriesError } = useAnalytics(filters)
  const { data: summary, isLoading: loadingSummary } = useSummary(filters)
  const { mutateAsync: createEntryMutation } = useCreateAnalytic()
  const createEntry = (entry: CreateAnalyticsEntry) => createEntryMutation(entry).then(() => undefined)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Game Analytics Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Monitor player activity across all games
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LiveBadge connected={isConnected} />
            <ThemeToggle isDark={isDark} onToggle={toggle} />
          </div>
        </div>
      </header>

      {showNewEntryNotice && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded px-3 py-2">
            <span className="text-green-500">●</span>
            New entry received — data refreshed
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {loadingSummary && (
          <div className="text-sm text-gray-400 dark:text-gray-500 animate-pulse">
            Loading summary…
          </div>
        )}
        {summary && (
          <>
            <SummaryCards summary={summary} />
            <AnalyticsChart summary={summary} isDark={isDark} />
          </>
        )}

        <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-4">
            Add Entry
          </h2>
          <AddEntryForm onSubmit={createEntry} />
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
              Filter Entries
            </h2>
            <ExportButtons filters={filters} />
          </div>
          <FilterBar onFilter={setFilters} />
        </section>

        {loadingEntries && (
          <div className="text-sm text-gray-400 dark:text-gray-500 animate-pulse">
            Loading entries…
          </div>
        )}
        {entriesError && (
          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
            Failed to load analytics data. Make sure the backend is running on{' '}
            <code className="font-mono">http://localhost:3000</code>.
          </div>
        )}
        {entries && <AnalyticsTable entries={entries} />}
      </main>
    </div>
  )
}

interface ThemeToggleProps {
  isDark: boolean
  onToggle: () => void
}

const ThemeToggle = ({ isDark, onToggle }: ThemeToggleProps) => (
  <button
    onClick={onToggle}
    aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
  >
    {isDark ? <SunIcon /> : <MoonIcon />}
  </button>
)

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
)

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)
