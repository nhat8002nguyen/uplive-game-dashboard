import { exportAnalytics } from '../api/analytics'
import type { FilterParams } from '../types/analytics'

interface ExportButtonsProps {
  filters: FilterParams
}

export const ExportButtons = ({ filters }: ExportButtonsProps) => (
  <div className="flex gap-2">
    <button
      onClick={() => exportAnalytics(filters, 'csv')}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <DownloadIcon />
      Export CSV
    </button>
    <button
      onClick={() => exportAnalytics(filters, 'json')}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <DownloadIcon />
      Export JSON
    </button>
  </div>
)

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)
