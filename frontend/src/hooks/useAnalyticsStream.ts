import { useEffect, useRef, useState } from 'react'
import type { AnalyticsEntry } from '../types/analytics'

const STREAM_URL = '/analytics/stream'

export const useAnalyticsStream = (onNewEntry: (entry: AnalyticsEntry) => void) => {
  const [isConnected, setIsConnected] = useState(false)

  // Always keep ref pointing at the latest callback so the EventSource
  // never needs to be recreated when the caller re-renders with a new function ref.
  const onNewEntryRef = useRef(onNewEntry)
  onNewEntryRef.current = onNewEntry

  useEffect(() => {
    const es = new EventSource(STREAM_URL)

    es.onopen = () => setIsConnected(true)
    es.onmessage = (e: MessageEvent) => {
      try {
        onNewEntryRef.current(JSON.parse(e.data) as AnalyticsEntry)
      } catch {
        // ignore malformed SSE frames
      }
    }
    es.onerror = () => setIsConnected(false)

    return () => {
      es.close()
    }
  }, []) // connect once on mount, disconnect on unmount

  return { isConnected }
}
