import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAnalyticsStream } from './useAnalyticsStream'
import type { AnalyticsEntry } from '../types/analytics'

// --- Mock EventSource ---
let lastInstance: MockEventSource | null = null

class MockEventSource {
  url: string
  onopen: ((e: Event) => void) | null = null
  onmessage: ((e: MessageEvent) => void) | null = null
  onerror: ((e: Event) => void) | null = null
  close = vi.fn()

  constructor(url: string) {
    this.url = url
    lastInstance = this
  }
}

vi.stubGlobal('EventSource', MockEventSource)

// helper to get a typed entry
const makeEntry = (): AnalyticsEntry => ({
  id: '1', gameId: 'g1', gameName: 'Test', playerId: 'p1',
  event: 'login', value: 1, timestamp: new Date().toISOString(),
})

describe('useAnalyticsStream', () => {
  beforeEach(() => { lastInstance = null })

  it('calls onNewEntry when a message event fires', () => {
    const onNewEntry = vi.fn()
    renderHook(() => useAnalyticsStream(onNewEntry))

    const entry = makeEntry()
    act(() => {
      lastInstance!.onmessage!(new MessageEvent('message', { data: JSON.stringify(entry) }))
    })

    expect(onNewEntry).toHaveBeenCalledWith(entry)
  })

  it('sets isConnected to true on open event', () => {
    const { result } = renderHook(() => useAnalyticsStream(vi.fn()))

    act(() => { lastInstance!.onopen!(new Event('open')) })

    expect(result.current.isConnected).toBe(true)
  })

  it('sets isConnected to false on error event', () => {
    const { result } = renderHook(() => useAnalyticsStream(vi.fn()))

    act(() => { lastInstance!.onopen!(new Event('open')) })
    act(() => { lastInstance!.onerror!(new Event('error')) })

    expect(result.current.isConnected).toBe(false)
  })

  it('calls EventSource.close() on unmount', () => {
    const { unmount } = renderHook(() => useAnalyticsStream(vi.fn()))
    unmount()
    expect(lastInstance!.close).toHaveBeenCalled()
  })
})
