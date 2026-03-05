import { useState, useEffect } from 'react'
import { EVENT_TYPES } from '../constants/analytics'
import { useDebounce } from '../hooks/useDebounce'
import type { FilterParams } from '../types/analytics'

interface FilterBarProps {
  onFilter: (params: FilterParams) => void
}

const DEBOUNCE_MS = 400

const filterInputCls = [
  'border rounded px-3 py-1.5 text-sm',
  'bg-white dark:bg-gray-700',
  'text-gray-900 dark:text-gray-100',
  'border-gray-300 dark:border-gray-600',
  'placeholder-gray-400 dark:placeholder-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-blue-500',
].join(' ')

export const FilterBar = ({ onFilter }: FilterBarProps) => {
  const [params, setParams] = useState<FilterParams>({})
  const debouncedParams = useDebounce(params, DEBOUNCE_MS)

  useEffect(() => {
    onFilter(debouncedParams)
  }, [debouncedParams]) // onFilter is intentionally omitted — it is a stable setter from parent useState

  const update = (patch: Partial<FilterParams>) =>
    setParams((prev) => ({ ...prev, ...patch }))

  return (
    <div className="flex flex-wrap gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <input
        type="text"
        placeholder="Game ID"
        value={params.gameId ?? ''}
        onChange={(e) => update({ gameId: e.target.value || undefined })}
        className={filterInputCls}
      />
      <input
        type="text"
        placeholder="Player ID"
        value={params.playerId ?? ''}
        onChange={(e) => update({ playerId: e.target.value || undefined })}
        className={filterInputCls}
      />
      <label className="sr-only" htmlFor="event-filter">Event</label>
      <select
        id="event-filter"
        aria-label="Event"
        value={params.event ?? ''}
        onChange={(e) => update({ event: e.target.value || undefined })}
        className={filterInputCls}
      >
        <option value="">All Events</option>
        {EVENT_TYPES.map((type) => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
      <input
        type="date"
        value={params.startDate ?? ''}
        onChange={(e) => update({ startDate: e.target.value || undefined })}
        className={filterInputCls}
      />
      <input
        type="date"
        value={params.endDate ?? ''}
        onChange={(e) => update({ endDate: e.target.value || undefined })}
        className={filterInputCls}
      />
    </div>
  )
}
