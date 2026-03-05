import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ExportButtons } from './ExportButtons'
import { exportAnalytics } from '../api/analytics'

vi.mock('../api/analytics', () => ({
  exportAnalytics: vi.fn(),
  fetchAnalytics: vi.fn(),
  createAnalytic: vi.fn(),
  fetchSummary: vi.fn(),
}))

describe('ExportButtons', () => {
  const filters = { gameId: 'game-1' }

  it('renders CSV and JSON export buttons', () => {
    render(<ExportButtons filters={filters} />)
    expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /export json/i })).toBeInTheDocument()
  })

  it('calls exportAnalytics with csv format on CSV button click', async () => {
    render(<ExportButtons filters={filters} />)
    await userEvent.click(screen.getByRole('button', { name: /export csv/i }))
    expect(vi.mocked(exportAnalytics)).toHaveBeenCalledWith(filters, 'csv')
  })

  it('calls exportAnalytics with json format on JSON button click', async () => {
    render(<ExportButtons filters={filters} />)
    await userEvent.click(screen.getByRole('button', { name: /export json/i }))
    expect(vi.mocked(exportAnalytics)).toHaveBeenCalledWith(filters, 'json')
  })
})
