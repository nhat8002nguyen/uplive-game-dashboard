import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SummaryCards } from './SummaryCards'
import type { AnalyticsSummary } from '../types/analytics'

const mockSummary: AnalyticsSummary = {
  total: 42,
  averageValue: 75.5,
  byEvent: { match_start: 10, purchase: 5, login: 27 },
  byGame: { 'game-1': 20, 'game-2': 22 },
}

describe('SummaryCards', () => {
  it('renders total', () => {
    render(<SummaryCards summary={mockSummary} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders averageValue', () => {
    render(<SummaryCards summary={mockSummary} />)
    expect(screen.getByText('75.50')).toBeInTheDocument()
  })

  it('renders event counts', () => {
    render(<SummaryCards summary={mockSummary} />)
    expect(screen.getByText('match_start')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })
})
