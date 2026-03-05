import { useState } from 'react'
import { EventBadge } from './EventBadge'
import type { AnalyticsEntry } from '../types/analytics'

interface AnalyticsTableProps {
  entries: AnalyticsEntry[]
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

type SortKey = keyof AnalyticsEntry
type SortDir = 'asc' | 'desc'

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'gameId', label: 'Game ID' },
  { key: 'gameName', label: 'Game' },
  { key: 'playerId', label: 'Player' },
  { key: 'event', label: 'Event' },
  { key: 'value', label: 'Value' },
  { key: 'timestamp', label: 'Timestamp' },
]

export const AnalyticsTable = ({ entries, total, page, pageSize, onPageChange, onPageSizeChange }: AnalyticsTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>('timestamp')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = [...entries].sort((a, b) => {
    const av = a[sortKey]
    const bv = b[sortKey]
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, total)

  if (total === 0) {
    return (
      <div className="text-center py-12 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        No data available
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <table className="min-w-full bg-white dark:bg-gray-800 text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <tr>
            {COLUMNS.map(({ key, label }) => (
              <th
                key={key}
                onClick={() => handleSort(key)}
                className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide text-xs cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                {label}
                {sortKey === key && (
                  <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {sorted.map((entry) => (
            <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{entry.gameId}</td>
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{entry.gameName}</td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{entry.playerId}</td>
              <td className="px-4 py-3">
                <EventBadge event={entry.event} />
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{entry.value.toLocaleString()}</td>
              <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                {new Date(entry.timestamp).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400">
        <span>
          {total === 0 ? 'No entries' : `Showing ${startItem}–${endItem} of ${total}`}
        </span>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5">
            Rows:
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="border border-gray-300 dark:border-gray-600 rounded px-1.5 py-0.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs"
            >
              {[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              ‹
            </button>
            <span className="px-2">{page} / {totalPages}</span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
