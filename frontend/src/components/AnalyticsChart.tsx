import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import type { AnalyticsSummary } from '../types/analytics'

interface AnalyticsChartProps {
  summary: AnalyticsSummary
  isDark: boolean
}

export const AnalyticsChart = ({ summary, isDark }: AnalyticsChartProps) => {
  const data = Object.entries(summary.byEvent).map(([event, count]) => ({ event, count }))

  const gridColor = isDark ? '#374151' : '#f0f0f0'
  const axisColor = isDark ? '#9ca3af' : '#6b7280'
  const tooltipStyle = isDark
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#f9fafb' }
    : { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#111827' }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-4">
        Events Distribution
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="event" tick={{ fontSize: 12, fill: axisColor }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: axisColor }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
