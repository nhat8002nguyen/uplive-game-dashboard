import { EVENT_BADGE_COLORS } from '../constants/analytics'

interface EventBadgeProps {
  event: string
}

export const EventBadge = ({ event }: EventBadgeProps) => {
  const color = EVENT_BADGE_COLORS[event as keyof typeof EVENT_BADGE_COLORS] ?? 'bg-gray-100 text-gray-700'
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {event}
    </span>
  )
}
