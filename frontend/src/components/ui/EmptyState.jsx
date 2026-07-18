import { Sprout } from 'lucide-react'

export default function EmptyState({ label = 'Nothing here yet', hint }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-card px-6 py-14 text-center">
      <Sprout className="mb-3 text-moss-300" size={28} />
      <p className="font-medium text-ink-500">{label}</p>
      {hint && <p className="mt-1 text-sm text-ink-400">{hint}</p>}
    </div>
  )
}
