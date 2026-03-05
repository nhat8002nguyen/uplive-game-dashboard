import type { ReactNode } from 'react'

export const inputCls = (hasError = false) =>
  [
    'w-full border rounded px-3 py-2 text-sm',
    'bg-white dark:bg-gray-700',
    'text-gray-900 dark:text-gray-100',
    'placeholder-gray-400 dark:placeholder-gray-500',
    'focus:outline-none focus:ring-2',
    hasError
      ? 'border-red-400 focus:ring-red-400'
      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500',
  ].join(' ')

interface FieldProps {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
}

export const Field = ({ label, htmlFor, error, children }: FieldProps) => (
  <div>
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
)
