import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AnalyticsTable } from './AnalyticsTable'
import type { AnalyticsEntry } from '../types/analytics'

const mockEntries: AnalyticsEntry[] = [
  {
    id: '1',
    gameId: 'game-1',
    gameName: 'Super Game',
    playerId: 'player-1',
    event: 'match_start',
    value: 100,
    timestamp: '2024-01-01T10:00:00.000Z',
  },
  {
    id: '2',
    gameId: 'game-2',
    gameName: 'Mega Game',
    playerId: 'player-2',
    event: 'purchase',
    value: 9.99,
    timestamp: '2024-01-02T12:00:00.000Z',
  },
]

describe('AnalyticsTable', () => {
  it('renders rows from entries prop', () => {
    render(<AnalyticsTable entries={mockEntries} />)
    expect(screen.getByText('Super Game')).toBeInTheDocument()
    expect(screen.getByText('Mega Game')).toBeInTheDocument()
    expect(screen.getByText('player-1')).toBeInTheDocument()
    expect(screen.getByText('match_start')).toBeInTheDocument()
    expect(screen.getByText('purchase')).toBeInTheDocument()
  })

  it('shows "No data" when empty', () => {
    render(<AnalyticsTable entries={[]} />)
    expect(screen.getByText(/no data/i)).toBeInTheDocument()
  })
})
