import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LiveBadge } from './LiveBadge'

describe('LiveBadge', () => {
  it('renders "Live" when connected', () => {
    render(<LiveBadge connected={true} />)
    expect(screen.getByText(/live/i)).toBeInTheDocument()
  })

  it('renders "Offline" when not connected', () => {
    render(<LiveBadge connected={false} />)
    expect(screen.getByText(/offline/i)).toBeInTheDocument()
  })
})
