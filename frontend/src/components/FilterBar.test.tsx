import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { FilterBar } from './FilterBar'

// Bypass the debounce delay in unit tests so assertions don't need timer control
vi.mock('../hooks/useDebounce', () => ({
  useDebounce: <T,>(value: T) => value,
}))

describe('FilterBar', () => {
  it('fires onFilter callback with updated params on gameId input change', async () => {
    const onFilter = vi.fn()
    render(<FilterBar onFilter={onFilter} />)

    await userEvent.type(screen.getByPlaceholderText(/game id/i), 'game-1')

    expect(onFilter).toHaveBeenLastCalledWith(
      expect.objectContaining({ gameId: 'game-1' }),
    )
  })

  it('fires onFilter callback with updated params on event select change', async () => {
    const onFilter = vi.fn()
    render(<FilterBar onFilter={onFilter} />)

    await userEvent.selectOptions(screen.getByRole('combobox', { name: /event/i }), 'purchase')

    expect(onFilter).toHaveBeenLastCalledWith(
      expect.objectContaining({ event: 'purchase' }),
    )
  })
})
