import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { AddEntryForm } from './AddEntryForm'

describe('AddEntryForm', () => {
  it('submits with correct payload on valid input', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<AddEntryForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText(/game id/i), 'game-1')
    await userEvent.type(screen.getByLabelText(/game name/i), 'Super Game')
    await userEvent.type(screen.getByLabelText(/player id/i), 'player-1')
    await userEvent.type(screen.getByLabelText(/value/i), '100')

    const eventSelect = screen.getByLabelText(/event/i)
    await userEvent.selectOptions(eventSelect, 'match_start')

    await userEvent.click(screen.getByRole('button', { name: /add entry/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        gameId: 'game-1',
        gameName: 'Super Game',
        playerId: 'player-1',
        event: 'match_start',
        value: 100,
      })
    })
  })

  it('shows validation errors for empty required fields', async () => {
    const onSubmit = vi.fn()
    render(<AddEntryForm onSubmit={onSubmit} />)

    await userEvent.click(screen.getByRole('button', { name: /add entry/i }))

    await waitFor(() => {
      expect(screen.getByText(/game id is required/i)).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
