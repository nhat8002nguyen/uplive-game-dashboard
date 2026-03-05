import type { AnalyticsSummary } from '../types/analytics'

interface SummaryCardsProps {
  summary: AnalyticsSummary
}

const topEntry = (record: Record<string, number>) => {
  const entries = Object.entries(record)
  if (entries.length === 0) return null
  return entries.reduce((a, b) => (b[1] > a[1] ? b : a))
}

const cardCls = 'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4'

export const SummaryCards = ({ summary }: SummaryCardsProps) => {
  const topEvent = topEntry(summary.byEvent)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total Events" value={String(summary.total)} />
      <StatCard label="Avg Value" value={summary.averageValue.toFixed(2)} />
      <StatCard
        label="Top Event"
        value={topEvent ? topEvent[0] : '—'}
        sub={topEvent ? `${topEvent[1]} occurrences` : undefined}
      />
      <div className={cardCls}>
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Events Breakdown
        </p>
        <ul className="space-y-1">
          {Object.entries(summary.byEvent).map(([event, count]) => (
            <li key={event} className="flex justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">{event}</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
  sub?: string
}

const StatCard = ({ label, value, sub }: StatCardProps) => (
  <div className={cardCls}>
    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</p>
    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
    {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
  </div>
)
