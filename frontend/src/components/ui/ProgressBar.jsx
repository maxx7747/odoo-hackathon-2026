export default function ProgressBar({ value, max = 100, colorClass = 'bg-moss-500', trackClass = 'bg-ink-100', height = 'h-2' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className={`w-full overflow-hidden rounded-full ${trackClass} ${height}`}>
      <div className={`${height} rounded-full ${colorClass} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  )
}
