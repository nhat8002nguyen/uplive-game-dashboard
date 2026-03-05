interface LiveBadgeProps {
  connected: boolean
}

export const LiveBadge = ({ connected }: LiveBadgeProps) => (
  <span
    className={[
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
      connected
        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
        : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
    ].join(' ')}
  >
    <span className={connected ? 'text-green-500' : 'text-gray-400'}>
      {connected ? '●' : '○'}
    </span>
    {connected ? 'Live' : 'Offline'}
  </span>
)
